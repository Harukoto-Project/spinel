import path from 'node:path';
import { withTransaction, type Db } from '../db/Database.js';
import { HttpError } from '../http/HttpError.js';
import type { Logger } from '../logger.js';
import { toAppView } from './app/appView.js';
import { hasAppSpec } from './app/appTypes.js';
import type { PluginAppRuntime } from './app/PluginAppRuntime.js';
import type { AppOverview, LogChunk, SetupView, SourceView, TaskView } from './app/appRuntimeTypes.js';
import type { RouteMatch } from './context/PluginRouter.js';
import { readFrontAsset, type FrontAsset } from './frontAssets.js';
import { isPermissionCovered, isSamePermissions, normalizePermissions } from './permissions.js';
import type { FetchedRepository, PluginInstaller } from './PluginInstaller.js';
import type { PluginLoader } from './PluginLoader.js';
import { PluginStore } from './PluginStore.js';
import { normalizeRepositoryUrl, repositoryIdOf } from './repositoryUrl.js';
import { RepositoryStore } from './RepositoryStore.js';
import { applyPatch, buildSettingsPatch, pickValidValues } from './settingValues.js';
import type {
  PluginPermissions,
  PluginRecord,
  PluginRepositoryRecord,
  PluginRepositoryView,
  PluginView,
} from './types.js';

export class PluginService {
  private queue: Promise<unknown> = Promise.resolve();

  public constructor(
    private readonly db: Db,
    private readonly installer: PluginInstaller,
    private readonly loader: PluginLoader,
    private readonly app: PluginAppRuntime,
    private readonly logger: Logger,
  ) {}

  public findRoute(id: string, method: string, subPath: string): RouteMatch | null {
    return this.loader.findRoute(id, method, subPath);
  }

  public async listRepositories(): Promise<PluginRepositoryView[]> {
    const [repositories, plugins] = await Promise.all([
      new RepositoryStore(this.db).list(),
      new PluginStore(this.db).list(),
    ]);
    return repositories.map((repository) => toRepositoryView(repository, plugins));
  }

  public async listPlugins(): Promise<PluginView[]> {
    const [repositories, plugins] = await Promise.all([
      new RepositoryStore(this.db).list(),
      new PluginStore(this.db).list(),
    ]);
    const shas = new Map(repositories.map((repository) => [repository.id, repository.installedSha]));
    return plugins.map((plugin) => this.toPluginView(plugin, shas.get(plugin.repoId) ?? null));
  }

  public addRepository(rawUrl: string): Promise<PluginRepositoryView[]> {
    return this.serialize(async () => {
      const url = normalizeRepositoryUrl(rawUrl);
      const id = repositoryIdOf(url);
      if ((await new RepositoryStore(this.db).get(id)) !== null) {
        throw new HttpError(409, 'repository_exists', 'このリポジトリはすでに追加されています');
      }

      const fetched = await this.installer.fetch(url);
      try {
        await withTransaction(this.db, async (connection) => {
          const now = Date.now();
          const repositories = new RepositoryStore(connection);
          const plugins = new PluginStore(connection);
          await this.assertNoIdConflict(plugins, fetched, id);

          await repositories.insert({
            id,
            url,
            name: fetched.contents.index.name,
            installedSha: fetched.sha,
            createdAt: now,
            updatedAt: now,
          });
          for (const { summary, manifest } of fetched.contents.plugins) {
            await plugins.insert({ id: manifest.id, repoId: id, path: summary.path, manifest, now });
          }
          await this.installer.commit(fetched, id);
        });
      } finally {
        await this.installer.discard(fetched);
      }

      this.logger.info(`プラグインのリポジトリを追加しました: ${url}(${fetched.contents.plugins.length} 件)`);
      return this.listRepositories();
    });
  }

  public refreshRepository(id: string): Promise<PluginRepositoryView[]> {
    return this.serialize(async () => {
      const repository = await this.requireRepository(id);
      const fetched = await this.installer.fetch(repository.url);
      const toUnload: string[] = [];
      const toReload: string[] = [];
      const vanished: string[] = [];
      try {
        if (fetched.sha === repository.installedSha) return await this.listRepositories();

        await withTransaction(this.db, async (connection) => {
          const now = Date.now();
          const repositories = new RepositoryStore(connection);
          const plugins = new PluginStore(connection);
          await this.assertNoIdConflict(plugins, fetched, id);

          const existing = new Map((await plugins.listByRepository(id)).map((plugin) => [plugin.id, plugin]));
          for (const { summary, manifest } of fetched.contents.plugins) {
            const current = existing.get(manifest.id);
            if (current === undefined) {
              await plugins.insert({ id: manifest.id, repoId: id, path: summary.path, manifest, now });
              continue;
            }
            const keep = keepsGrant(current, manifest.permissions);
            if (!keep && current.enabled) toUnload.push(current.id);
            if (keep && current.enabled) toReload.push(current.id);
            await plugins.updateSource(manifest.id, {
              path: summary.path,
              manifest,
              enabled: keep && current.enabled,
              grantedPermissions: keep ? current.grantedPermissions : null,
              now,
            });
            existing.delete(manifest.id);
          }
          toUnload.push(...existing.keys());
          vanished.push(...existing.keys());
          await plugins.removeByIds([...existing.keys()]);

          await repositories.update(id, {
            name: fetched.contents.index.name,
            installedSha: fetched.sha,
            updatedAt: now,
          });
          await this.installer.commit(fetched, id);
        });
      } finally {
        await this.installer.discard(fetched);
      }

      for (const pluginId of toUnload) await this.loader.unload(pluginId);
      for (const pluginId of vanished) await this.purgeAppFiles(pluginId);
      for (const pluginId of toReload) await this.applyUpdate(pluginId, fetched.sha);
      this.logger.info(`プラグインのリポジトリを更新しました: ${repository.url}`);
      return this.listRepositories();
    });
  }

  public removeRepository(id: string): Promise<PluginRepositoryView[]> {
    return this.serialize(async () => {
      const repository = await this.requireRepository(id);
      for (const plugin of await new PluginStore(this.db).listByRepository(id)) {
        await this.loader.unload(plugin.id);
        await this.purgeAppFiles(plugin.id);
      }

      await new RepositoryStore(this.db).remove(id);
      await this.installer.remove(id).catch((error: unknown) => {
        this.logger.error(`プラグインのリポジトリのファイルを削除できませんでした: ${repository.url}`, error);
      });
      this.logger.info(`プラグインのリポジトリを削除しました: ${repository.url}`);
      return this.listRepositories();
    });
  }

  public enablePlugin(id: string, granted: PluginPermissions): Promise<PluginView[]> {
    return this.serialize(async () => {
      const plugin = await this.requirePlugin(id);
      const grantedPermissions = normalizePermissions(granted);
      if (!isSamePermissions(grantedPermissions, plugin.manifest.permissions)) {
        throw new HttpError(
          400,
          'permissions_mismatch',
          'プラグインが宣言している権限と、許可された権限が一致しません。権限を確認し直してください',
        );
      }

      const store = new PluginStore(this.db);
      await this.loader.unload(id);
      await store.setEnabled(id, true, grantedPermissions);
      await this.loader.load({ ...plugin, enabled: true, grantedPermissions }, 'enable');
      this.logger.info(`プラグインを有効化しました: ${id}`);
      return this.listPlugins();
    });
  }

  public updatePluginSettings(id: string, update: Record<string, unknown>): Promise<PluginView[]> {
    return this.serialize(async () => {
      const plugin = await this.requirePlugin(id);
      const patch = buildSettingsPatch(plugin.manifest.settings, update);

      const store = new PluginStore(this.db);
      const stored = await store.getStoredSettings(id);
      await store.saveSettings(id, applyPatch(stored.values, patch.config), applyPatch(stored.secrets, patch.secrets));
      return this.listPlugins();
    });
  }

  public async readFrontAsset(id: string, relativePath: string): Promise<FrontAsset> {
    const plugin = await this.requirePlugin(id);
    if (!plugin.enabled || plugin.manifest.front === null) {
      throw new HttpError(404, 'plugin_front_unavailable', 'このプラグインの画面は利用できません');
    }
    const frontRoot = path.join(this.installer.repositoryDirectory(plugin.repoId), plugin.path, 'front');
    return readFrontAsset(frontRoot, relativePath);
  }

  public disablePlugin(id: string): Promise<PluginView[]> {
    return this.serialize(async () => {
      await this.requirePlugin(id);
      await this.loader.unload(id);
      await new PluginStore(this.db).setEnabled(id, false, null);
      this.logger.info(`プラグインを無効化しました: ${id}`);
      return this.listPlugins();
    });
  }

  public async appOverview(id: string): Promise<AppOverview> {
    return this.app.overview(await this.requirePlugin(id));
  }

  public async updateAppSource(id: string): Promise<SourceView> {
    return this.app.updateSource(await this.requirePlugin(id));
  }

  public async runAppSetup(id: string): Promise<SetupView> {
    return this.app.startSetup(await this.requirePlugin(id));
  }

  public async readAppSetupLogs(id: string, stepId: string, after: number): Promise<LogChunk> {
    return this.app.readSetupLogs(await this.requirePlugin(id), stepId, after);
  }

  public async runAppTask(id: string, commandId: string, inputs: Record<string, unknown>): Promise<TaskView> {
    return this.app.startTask(await this.requirePlugin(id), commandId, inputs);
  }

  public async stopAppTask(id: string, commandId: string): Promise<TaskView> {
    return this.app.stopTask(await this.requirePlugin(id), commandId);
  }

  public async readAppTaskLogs(
    id: string,
    commandId: string,
    after: number,
  ): Promise<{ logs: LogChunk; task: TaskView }> {
    return this.app.readTaskLogs(await this.requirePlugin(id), commandId, after);
  }

  public async runAppQuery(id: string, commandId: string, inputs: Record<string, unknown>): Promise<unknown> {
    return this.app.runQuery(await this.requirePlugin(id), commandId, inputs);
  }

  private toPluginView(plugin: PluginRecord, repositorySha: string | null): PluginView {
    const { manifest } = plugin;
    const loadedSha = this.loader.loadedSha(plugin.id);
    return {
      id: plugin.id,
      repoId: plugin.repoId,
      name: manifest.name,
      version: plugin.installedVersion,
      description: manifest.description,
      hasServer: manifest.server !== null,
      hasFront: manifest.front !== null,
      frontEntry: manifest.front === null ? null : manifest.front.entry.slice('front/'.length),
      hasApp: hasAppSpec(manifest.app),
      app: toAppView(manifest.app),
      enabled: plugin.enabled,
      status: !plugin.enabled ? 'disabled' : plugin.errorMessage !== null ? 'error' : 'active',
      errorMessage: plugin.errorMessage,
      restartRequired: loadedSha !== null && repositorySha !== null && loadedSha !== repositorySha,
      permissions: manifest.permissions,
      grantedPermissions: plugin.grantedPermissions,
      settings: manifest.settings,
      settingValues: pickValidValues(manifest.settings, plugin.config),
      secretsSet: plugin.secretKeys.filter((key) =>
        manifest.settings.some((s) => s.type === 'secret' && s.key === key),
      ),
    };
  }

  private async applyUpdate(pluginId: string, sha: string): Promise<void> {
    const store = new PluginStore(this.db);
    const record = await store.get(pluginId);
    if (record === null || !record.enabled) return;

    if (record.manifest.server !== null || !this.loader.isLoaded(pluginId)) {
      await this.loader.unload(pluginId);
      await this.loader.load(record, 'enable');
      return;
    }

    this.loader.adoptSha(pluginId, sha);
    try {
      await this.app.refresh(record);
      await store.setError(pluginId, null);
    } catch (error) {
      this.logger.error(`プラグインの更新後の準備に失敗しました: ${pluginId}`, error);
      await store.setError(pluginId, error instanceof Error ? error.message : String(error)).catch(() => undefined);
    }
  }

  private async purgeAppFiles(pluginId: string): Promise<void> {
    await this.app.purge(pluginId).catch((error: unknown) => {
      this.logger.error(`プラグインのソース・データを削除できませんでした: ${pluginId}`, error);
    });
  }

  private async requireRepository(id: string): Promise<PluginRepositoryRecord> {
    const repository = await new RepositoryStore(this.db).get(id);
    if (repository === null) throw new HttpError(404, 'repository_not_found', 'リポジトリが見つかりません');
    return repository;
  }

  private async requirePlugin(id: string): Promise<PluginRecord> {
    const plugin = await new PluginStore(this.db).get(id);
    if (plugin === null) throw new HttpError(404, 'plugin_not_found', 'プラグインが見つかりません');
    return plugin;
  }

  private async assertNoIdConflict(plugins: PluginStore, fetched: FetchedRepository, repoId: string): Promise<void> {
    const ids = fetched.contents.plugins.map(({ manifest }) => manifest.id);
    const conflicts = await plugins.findIdsInOtherRepositories(ids, repoId);
    if (conflicts.length > 0) {
      throw new HttpError(
        409,
        'plugin_id_conflict',
        `すでに別のリポジトリで使われているプラグイン ID があります: ${conflicts.join(', ')}`,
      );
    }
  }

  private serialize<T>(task: () => Promise<T>): Promise<T> {
    const result = this.queue.then(task, task);
    this.queue = result.catch(() => undefined);
    return result;
  }
}

const keepsGrant = (current: PluginRecord, next: PluginPermissions): boolean =>
  current.grantedPermissions === null || isPermissionCovered(next, current.grantedPermissions);

const toRepositoryView = (
  repository: PluginRepositoryRecord,
  plugins: readonly PluginRecord[],
): PluginRepositoryView => ({
  id: repository.id,
  url: repository.url,
  name: repository.name,
  installedSha: repository.installedSha,
  updatedAt: repository.updatedAt,
  plugins: plugins
    .filter((plugin) => plugin.repoId === repository.id)
    .map((plugin) => ({
      id: plugin.id,
      name: plugin.manifest.name,
      version: plugin.installedVersion,
      description: plugin.manifest.description,
      enabled: plugin.enabled,
    })),
});
