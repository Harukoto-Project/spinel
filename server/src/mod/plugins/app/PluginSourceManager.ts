import { randomUUID } from 'node:crypto';
import { mkdir, rename, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import type { Queryable } from '../../db/Database.js';
import { HttpError } from '../../http/HttpError.js';
import type { GitClient, Transport } from '../GitClient.js';
import type { PluginSource } from './appTypes.js';
import { PluginSourceStore, type PluginSourceRecord } from './PluginSourceStore.js';

const TRANSPORTS_IN_ORDER: readonly Transport[] = ['https', 'ssh'];

const removeDirectory = (directory: string): Promise<void> =>
  rm(directory, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });

const exists = (target: string): Promise<boolean> =>
  stat(target).then(
    () => true,
    (error: NodeJS.ErrnoException) => {
      if (error.code === 'ENOENT') return false;
      throw error;
    },
  );

const repoUrl = (repo: string, transport: Transport): string =>
  transport === 'ssh' ? `git@github.com:${repo}.git` : `https://github.com/${repo}.git`;

export class PluginSourceManager {
  private readonly queues = new Map<string, Promise<unknown>>();

  public constructor(
    private readonly sourcesDir: string,
    private readonly git: GitClient,
    private readonly db: Queryable,
  ) {}

  public directory(pluginId: string): string {
    return path.join(this.sourcesDir, pluginId);
  }

  public get(pluginId: string): Promise<PluginSourceRecord | null> {
    return new PluginSourceStore(this.db).get(pluginId);
  }

  public async isPresent(pluginId: string): Promise<boolean> {
    return exists(path.join(this.directory(pluginId), '.git'));
  }

  public sync(pluginId: string, source: PluginSource): Promise<PluginSourceRecord> {
    return this.serialize(pluginId, () => this.syncNow(pluginId, source));
  }

  public remove(pluginId: string): Promise<void> {
    return this.serialize(pluginId, async () => {
      await removeDirectory(this.directory(pluginId));
      await new PluginSourceStore(this.db).remove(pluginId);
    });
  }

  private serialize<T>(pluginId: string, task: () => Promise<T>): Promise<T> {
    const previous = this.queues.get(pluginId) ?? Promise.resolve();
    const next = previous.then(task, task);
    const tail = next.then(
      () => undefined,
      () => undefined,
    );
    this.queues.set(pluginId, tail);
    void tail.then(() => {
      if (this.queues.get(pluginId) === tail) this.queues.delete(pluginId);
    });
    return next;
  }

  private async syncNow(pluginId: string, source: PluginSource): Promise<PluginSourceRecord> {
    const store = new PluginSourceStore(this.db);
    const previous = await store.get(pluginId);
    const directory = this.directory(pluginId);
    const reusable = previous !== null && previous.repo === source.repo && (await this.isPresent(pluginId));

    const now = Date.now();
    if (reusable) {
      const installedSha = await this.git.fetchAndReset(directory, previous.transport, source.ref);
      const record: PluginSourceRecord = { ...previous, ref: source.ref, installedSha, updatedAt: now };
      await store.upsert(record);
      return record;
    }

    const { sha, transport } = await this.cloneInto(pluginId, source);
    const record: PluginSourceRecord = {
      pluginId,
      repo: source.repo,
      ref: source.ref,
      transport,
      installedSha: sha,
      createdAt: previous?.createdAt ?? now,
      updatedAt: now,
    };
    await store.upsert(record);
    return record;
  }

  private async cloneInto(pluginId: string, source: PluginSource): Promise<{ sha: string; transport: Transport }> {
    await mkdir(this.sourcesDir, { recursive: true });
    const temporary = path.join(this.sourcesDir, `.tmp-${randomUUID()}`);
    try {
      const { sha, transport } = await this.cloneWithFallback(source, temporary);
      const target = this.directory(pluginId);
      await removeDirectory(target);
      await rename(temporary, target);
      return { sha, transport };
    } catch (error) {
      await removeDirectory(temporary).catch(() => undefined);
      throw error;
    }
  }

  private async cloneWithFallback(
    source: PluginSource,
    destination: string,
  ): Promise<{ sha: string; transport: Transport }> {
    let lastError: unknown = null;
    for (const transport of TRANSPORTS_IN_ORDER) {
      try {
        const sha = await this.git.cloneShallow(repoUrl(source.repo, transport), destination, source.ref);
        return { sha, transport };
      } catch (error) {
        lastError = error;
        const retryable = error instanceof HttpError && error.code === 'repository_fetch_failed';
        if (!retryable) throw error;
        await removeDirectory(destination).catch(() => undefined);
      }
    }
    throw lastError;
  }
}
