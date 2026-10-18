import { randomUUID } from 'node:crypto';
import { mkdir, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import type { GitClient } from './GitClient.js';
import { readRepositoryContents, type RepositoryContents } from './readRepositoryContents.js';

export interface FetchedRepository {
  directory: string;
  sha: string;
  contents: RepositoryContents;
}

const removeDirectory = (directory: string): Promise<void> =>
  rm(directory, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });

export class PluginInstaller {
  public constructor(
    private readonly reposDir: string,
    private readonly git: GitClient,
  ) {}

  public repositoryDirectory(repoId: string): string {
    return path.join(this.reposDir, repoId);
  }

  public async fetch(url: string): Promise<FetchedRepository> {
    await mkdir(this.reposDir, { recursive: true });
    const directory = path.join(this.reposDir, `.tmp-${randomUUID()}`);
    try {
      const sha = await this.git.cloneShallow(url, directory);
      const contents = await readRepositoryContents(directory);
      return { directory, sha, contents };
    } catch (error) {
      await removeDirectory(directory).catch(() => undefined);
      throw error;
    }
  }

  public async commit(fetched: FetchedRepository, repoId: string): Promise<void> {
    const target = this.repositoryDirectory(repoId);
    const previous = `${target}.old-${randomUUID()}`;
    const hadPrevious = await rename(target, previous).then(
      () => true,
      (error: NodeJS.ErrnoException) => {
        if (error.code === 'ENOENT') return false;
        throw error;
      },
    );

    try {
      await rename(fetched.directory, target);
    } catch (error) {
      if (hadPrevious) await rename(previous, target).catch(() => undefined);
      throw error;
    }
    if (hadPrevious) await removeDirectory(previous).catch(() => undefined);
  }

  public async discard(fetched: FetchedRepository): Promise<void> {
    await removeDirectory(fetched.directory).catch(() => undefined);
  }

  public async remove(repoId: string): Promise<void> {
    await removeDirectory(this.repositoryDirectory(repoId));
  }
}
