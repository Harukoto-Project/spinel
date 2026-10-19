import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, rm, stat } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { HttpError } from '../http/HttpError.js';
import type { Logger } from '../logger.js';
import { fingerprintOf, PUBLIC_KEY_PREFIX } from './fingerprint.js';
import { runKeygen } from './runKeygen.js';
import type { SshCommandProvider, SshKeyInfo } from './types.js';

const KEY_NAME = 'id_ed25519';
const KNOWN_HOSTS_NAME = 'known_hosts';

const commentOf = (): string => `spinel-${os.hostname().replace(/[^A-Za-z0-9._-]/g, '') || 'node'}`;

const quote = (file: string): string => `"${file.replace(/\\/g, '/')}"`;

export class SshKeyService implements SshCommandProvider {
  private queue: Promise<unknown> = Promise.resolve();

  public constructor(
    private readonly directory: string,
    private readonly logger: Logger,
  ) {}

  private get privateKeyFile(): string {
    return path.join(this.directory, KEY_NAME);
  }

  private get publicKeyFile(): string {
    return `${this.privateKeyFile}.pub`;
  }

  public get(): Promise<SshKeyInfo> {
    return this.serialize(() => this.ensure());
  }

  public regenerate(): Promise<SshKeyInfo> {
    return this.serialize(async () => {
      await this.generate();
      this.logger.info('SSH 鍵を再生成しました');
      return this.read();
    });
  }

  public async gitSshCommand(): Promise<string> {
    await this.get();
    return [
      'ssh',
      '-i',
      quote(this.privateKeyFile),
      '-o IdentitiesOnly=yes',
      '-o BatchMode=yes',
      '-o StrictHostKeyChecking=accept-new',
      `-o UserKnownHostsFile=${quote(path.join(this.directory, KNOWN_HOSTS_NAME))}`,
    ].join(' ');
  }

  private async ensure(): Promise<SshKeyInfo> {
    const exists = await Promise.all([this.privateKeyFile, this.publicKeyFile].map((file) => isFile(file)));
    if (!exists.every(Boolean)) {
      await this.generate();
      this.logger.info('SSH 鍵を生成しました');
    }
    return this.read();
  }

  private async generate(): Promise<void> {
    await mkdir(this.directory, { recursive: true, mode: 0o700 });
    const workDir = path.join(this.directory, `.tmp-${randomUUID()}`);
    await mkdir(workDir, { mode: 0o700 });
    try {
      const keyFile = path.join(workDir, KEY_NAME);
      await runKeygen(keyFile, commentOf());
      await rename(keyFile, this.privateKeyFile);
      await rename(`${keyFile}.pub`, this.publicKeyFile);
    } finally {
      await rm(workDir, { recursive: true, force: true }).catch(() => undefined);
    }
  }

  private async read(): Promise<SshKeyInfo> {
    const [text, info] = await Promise.all([readFile(this.publicKeyFile, 'utf8'), stat(this.publicKeyFile)]);
    const publicKey = text.trim();
    if (!publicKey.startsWith(PUBLIC_KEY_PREFIX)) {
      throw new HttpError(500, 'ssh_key_invalid', '保存されている SSH 公開鍵を読み取れません。再生成してください');
    }
    return { publicKey, fingerprint: fingerprintOf(publicKey), createdAt: Math.floor(info.mtimeMs) };
  }

  private serialize<T>(task: () => Promise<T>): Promise<T> {
    const result = this.queue.then(task, task);
    this.queue = result.catch(() => undefined);
    return result;
  }
}

const isFile = (file: string): Promise<boolean> =>
  stat(file).then(
    (info) => info.isFile(),
    () => false,
  );
