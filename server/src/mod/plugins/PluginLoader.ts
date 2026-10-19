import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Db } from '../db/Database.js';
import type { Logger } from '../logger.js';
import type { NotificationPayload } from '../notifications/protocol.js';
import { createPluginContext } from './context/createPluginContext.js';
import type { PluginActivate, PluginInstance } from './context/contextTypes.js';
import { PluginRouter, type RouteMatch } from './context/PluginRouter.js';
import type { PluginAppRuntime, PrepareReason } from './app/PluginAppRuntime.js';
import type { PluginInstaller } from './PluginInstaller.js';
import type { PluginProcessManager } from './process/PluginProcessManager.js';
import { PluginStorageStore } from './PluginStorageStore.js';
import { PluginStore } from './PluginStore.js';
import { RepositoryStore } from './RepositoryStore.js';
import type { PluginRecord } from './types.js';

const ACTIVATE_TIMEOUT_MS = 30_000;

type Deactivator = () => void | Promise<void>;

interface LoadedPlugin {
  sha: string;
  router: PluginRouter;
  deactivators: Deactivator[];
  instance: PluginInstance | null;
}

export interface PluginLoaderDeps {
  db: Db;
  installer: PluginInstaller;
  processes: PluginProcessManager;
  app: PluginAppRuntime;
  publish: (payload: NotificationPayload) => number;
  logger: Logger;
}

const messageOf = (error: unknown): string => (error instanceof Error ? error.message : String(error));

const withTimeout = <T>(task: Promise<T>, ms: number, message: string): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    task.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });

export class PluginLoader {
  private readonly loaded = new Map<string, LoadedPlugin>();

  public constructor(private readonly deps: PluginLoaderDeps) {}

  public isLoaded(id: string): boolean {
    return this.loaded.has(id);
  }

  public loadedSha(id: string): string | null {
    return this.loaded.get(id)?.sha ?? null;
  }

  public findRoute(id: string, method: string, subPath: string): RouteMatch | null {
    return this.loaded.get(id)?.router.match(method, subPath) ?? null;
  }

  public async loadAll(): Promise<void> {
    const plugins = await new PluginStore(this.deps.db).list();
    for (const plugin of plugins) {
      if (plugin.enabled) await this.load(plugin);
    }
  }

  public async load(record: PluginRecord, reason: PrepareReason = 'boot'): Promise<void> {
    if (this.loaded.has(record.id)) return;
    const store = new PluginStore(this.deps.db);

    try {
      await this.activate(record, reason);
      await store.setError(record.id, null);
    } catch (error) {
      await this.unload(record.id);
      this.deps.logger.error(`プラグインを読み込めませんでした: ${record.id}`, error);
      await store.setError(record.id, messageOf(error)).catch(() => undefined);
    }
  }

  public async unload(id: string): Promise<void> {
    const plugin = this.loaded.get(id);
    this.loaded.delete(id);
    plugin?.router.dispose();

    if (plugin !== undefined) {
      await this.guard(id, async () => plugin.instance?.deactivate?.());
      for (const deactivator of [...plugin.deactivators].reverse()) await this.guard(id, deactivator);
    }
    this.deps.app.release(id);
    await this.guard(id, () => this.deps.processes.stopPlugin(id));
  }

  public async unloadAll(): Promise<void> {
    for (const id of [...this.loaded.keys()]) await this.unload(id);
    await this.deps.processes.stopAll();
  }

  private async activate(record: PluginRecord, reason: PrepareReason): Promise<void> {
    const permissions = record.grantedPermissions;
    if (permissions === null) throw new Error('権限が許可されていません');

    const repository = await new RepositoryStore(this.deps.db).get(record.repoId);
    if (repository === null) throw new Error('プラグインのリポジトリが見つかりません');

    const plugin: LoadedPlugin = { sha: repository.installedSha, router: new PluginRouter(), deactivators: [], instance: null };
    this.loaded.set(record.id, plugin);

    await this.deps.app.prepare(record, reason);

    const entry = record.manifest.server?.entry;
    if (entry === undefined) return;

    const context = createPluginContext({
      record,
      permissions,
      router: plugin.router,
      pluginStore: new PluginStore(this.deps.db),
      storageStore: new PluginStorageStore(this.deps.db),
      processes: this.deps.processes,
      publish: this.deps.publish,
      logger: this.deps.logger,
      onDeactivate: (listener) => {
        if (typeof listener === 'function') plugin.deactivators.push(listener);
      },
    });

    const file = path.join(this.deps.installer.repositoryDirectory(record.repoId), record.path, entry);
    const imported = (await import(`${pathToFileURL(file).href}?v=${repository.installedSha}`)) as { default?: unknown };
    if (typeof imported.default !== 'function') throw new Error(`${entry} が関数を default export していません`);

    const result = await withTimeout(
      Promise.resolve((imported.default as PluginActivate)(context)),
      ACTIVATE_TIMEOUT_MS,
      `activate が ${ACTIVATE_TIMEOUT_MS / 1000} 秒以内に完了しませんでした`,
    );
    plugin.instance = typeof result === 'object' && result !== null ? result : null;
  }

  private async guard(id: string, task: () => void | Promise<void>): Promise<void> {
    try {
      await task();
    } catch (error) {
      this.deps.logger.error(`プラグインの終了処理に失敗しました: ${id}`, error);
    }
  }
}
