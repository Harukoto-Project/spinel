import { execFile } from 'node:child_process';
import { HttpError } from '../http/HttpError.js';

const KEYGEN_TIMEOUT_MS = 30_000;
const ERROR_DETAIL_MAX = 300;

export const runKeygen = (keyFile: string, comment: string): Promise<void> =>
  new Promise((resolve, reject) => {
    execFile(
      'ssh-keygen',
      ['-q', '-t', 'ed25519', '-N', '', '-C', comment, '-f', keyFile],
      { timeout: KEYGEN_TIMEOUT_MS, windowsHide: true },
      (error, _stdout, stderr) => {
        if (error === null) {
          resolve();
          return;
        }
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
          reject(new HttpError(500, 'ssh_unavailable', 'ノードに ssh-keygen(OpenSSH)がインストールされていません'));
          return;
        }
        const detail = stderr.trim().slice(-ERROR_DETAIL_MAX);
        reject(
          new HttpError(
            500,
            'ssh_key_generation_failed',
            `SSH 鍵を生成できませんでした${detail === '' ? '' : `: ${detail}`}`,
          ),
        );
      },
    );
  });
