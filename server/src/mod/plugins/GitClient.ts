import { execFile } from 'node:child_process';
import { HttpError } from '../http/HttpError.js';

const GIT_TIMEOUT_MS = 120_000;
const GIT_MAX_BUFFER = 1024 * 1024;
const ERROR_DETAIL_MAX = 400;

interface ExecFailure extends Error {
  code?: string | number;
  killed?: boolean;
  stderr?: string;
}

const gitEnv = (): NodeJS.ProcessEnv => ({
  ...process.env,
  GIT_TERMINAL_PROMPT: '0',
  GCM_INTERACTIVE: 'never',
  GIT_ALLOW_PROTOCOL: 'https',
});

const run = (args: readonly string[]): Promise<string> =>
  new Promise((resolve, reject) => {
    execFile(
      'git',
      [...args],
      { env: gitEnv(), timeout: GIT_TIMEOUT_MS, maxBuffer: GIT_MAX_BUFFER, windowsHide: true },
      (error, stdout, stderr) => {
        if (error === null) {
          resolve(stdout);
          return;
        }
        const failure = error as ExecFailure;
        if (failure.code === 'ENOENT') {
          reject(new HttpError(500, 'git_unavailable', 'ノードに git がインストールされていません'));
          return;
        }
        if (failure.killed === true) {
          reject(new HttpError(504, 'repository_fetch_timeout', 'リポジトリの取得がタイムアウトしました'));
          return;
        }
        const detail = stderr.trim().slice(-ERROR_DETAIL_MAX);
        reject(
          new HttpError(
            400,
            'repository_fetch_failed',
            `リポジトリを取得できませんでした${detail === '' ? '' : `: ${detail}`}`,
          ),
        );
      },
    );
  });

export class GitClient {
  public async cloneShallow(url: string, destination: string): Promise<string> {
    await run([
      '-c',
      'core.symlinks=false',
      '-c',
      'protocol.allow=never',
      '-c',
      'protocol.https.allow=always',
      'clone',
      '--depth',
      '1',
      '--single-branch',
      '--no-tags',
      '--',
      url,
      destination,
    ]);
    const sha = (await run(['-C', destination, 'rev-parse', 'HEAD'])).trim();
    if (!/^[0-9a-f]{40}$/.test(sha)) {
      throw new HttpError(500, 'repository_fetch_failed', 'リポジトリのコミットを特定できませんでした');
    }
    return sha;
  }
}
