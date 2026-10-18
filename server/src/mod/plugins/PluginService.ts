import { withTransaction, type Db } from '../db/Database.js';
import { HttpError } from '../http/HttpError.js';
import type { Logger } from '../logger.js';
import { isPermissionCovered } from './permissions.js';
import type { PluginInstaller, FetchedRepository } from './PluginInstaller.js';
import { PluginStore } from './PluginStore.js';
import { normalizeRepositoryUrl, repositoryIdOf } from './repositoryUrl.js';
import { RepositoryStore } from './RepositoryStore.js';
import type { PluginRecord, PluginRepositoryRecord, PluginRepositoryView } from './types.js';

export class PluginService {
  private queue: Promise<unknown> = Promise.resolve();

  public constructor(
    private readonly db: Db,
    private readonly installer: PluginInstaller,
    private readonly logger: Logger,
  ) {}

  public async listRepositories(): Promise<PluginRepositoryView[]> {
    const [repositories, plugins] = await Promise.all([new RepositoryStore(this.db).list(), new PluginStore(this.db).list()]);
    return repositories.map((repository) => toView(repository, plugins));
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
            await plugins.updateSource(manifest.id, {
              path: summary.path,
              manifest,
              enabled: keep && current.enabled,
              grantedPermissions: keep ? current.grantedPermissions : null,
              now,
            });
            existing.delete(manifest.id);
          }
          await plugins.removeByIds([...existing.keys()]);

          await repositories.update(id, { name: fetched.contents.index.name, installedSha: fetched.sha, updatedAt: now });
          await this.installer.commit(fetched, id);
        });
      } finally {
        await this.installer.discard(fetched);
      }

      this.logger.info(`プラグインのリポジトリを更新しました: ${repository.url}`);
      return this.listRepositories();
    });
  }

  public removeRepository(id: string): Promise<PluginRepositoryView[]> {
    return this.serialize(async () => {
      const repository = await this.requireRepository(id);
      await new RepositoryStore(this.db).remove(id);
      await this.installer.remove(id).catch((error: unknown) => {
        this.logger.error(`プラグインのリポジトリのファイルを削除できませんでした: ${repository.url}`, error);
      });
      this.logger.info(`プラグインのリポジトリを削除しました: ${repository.url}`);
      return this.listRepositories();
    });
  }

  private async requireRepository(id: string): Promise<PluginRepositoryRecord> {
    const repository = await new RepositoryStore(this.db).get(id);
    if (repository === null) throw new HttpError(404, 'repository_not_found', 'リポジトリが見つかりません');
    return repository;
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

const keepsGrant = (current: PluginRecord, next: PluginRecord['manifest']['permissions']): boolean =>
  current.grantedPermissions === null || isPermissionCovered(next, current.grantedPermissions);

const toView = (repository: PluginRepositoryRecord, plugins: readonly PluginRecord[]): PluginRepositoryView => ({
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
