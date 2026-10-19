import { execFile } from 'node:child_process';
import { HttpError } from '../http/HttpError.js';
import type { SshCommandProvider } from '../ssh/types.js';
import { isSshRepositoryUrl } from './repositoryUrl.js';

const GIT_TIMEOUT_MS = 120_000;
const GIT_MAX_BUFFER = 1024 * 1024;
const ERROR_DETAIL_MAX = 400;

interface ExecFailure extends Error {
  code?: string | number;
  killed?: boolean;
  stderr?: string;
}

type Transport = 'https' | 'ssh';

const gitEnv = (transport: Transport, sshCommand: string | null): NodeJS.ProcessEnv => ({
  ...process.env,
  GIT_TERMINAL_PROMPT: '0',
  GCM_INTERACTIVE: 'never',
  GIT_ALLOW_PROTOCOL: transport,
  ...(sshCommand === null ? {} : { GIT_SSH_COMMAND: sshCommand }),
});

const describeFailure = (transport: Transport, stderr: string): string => {
  const detail = stderr.trim().slice(-ERROR_DETAIL_MAX);
  if (transport === 'ssh' && /permission denied \(publickey\)|could not read from remote repository/i.test(stderr)) {
    return (
      'リポジトリを取得できませんでした。このノードの SSH 公開鍵が GitHub に登録されていないか、リポジトリへのアクセス権がありません' +
      '(設定ページの「SSH 公開鍵」を GitHub の SSH keys に登録してください)'
    );
  }
  return `リポジトリを取得できませんでした${detail === '' ? '' : `: ${detail}`}`;
};

const run = (args: readonly string[], transport: Transport, sshCommand: string | null): Promise<string> =>
  new Promise((resolve, reject) => {
    execFile(
      'git',
      [...args],
      { env: gitEnv(transport, sshCommand), timeout: GIT_TIMEOUT_MS, maxBuffer: GIT_MAX_BUFFER, windowsHide: true },
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
        reject(new HttpError(400, 'repository_fetch_failed', describeFailure(transport, stderr)));
      },
    );
  });

export class GitClient {
  public constructor(private readonly ssh: SshCommandProvider) {}

  public async cloneShallow(url: string, destination: string): Promise<string> {
    const transport: Transport = isSshRepositoryUrl(url) ? 'ssh' : 'https';
    const sshCommand = transport === 'ssh' ? await this.ssh.gitSshCommand() : null;

    await run(
      [
        '-c',
        'core.symlinks=false',
        '-c',
        'protocol.allow=never',
        '-c',
        `protocol.${transport}.allow=always`,
        'clone',
        '--depth',
        '1',
        '--single-branch',
        '--no-tags',
        '--',
        url,
        destination,
      ],
      transport,
      sshCommand,
    );
    const sha = (await run(['-C', destination, 'rev-parse', 'HEAD'], transport, sshCommand)).trim();
    if (!/^[0-9a-f]{40}$/.test(sha)) {
      throw new HttpError(500, 'repository_fetch_failed', 'リポジトリのコミットを特定できませんでした');
    }
    return sha;
  }
}
