import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const KEY_PREFIX = 'spn_';
const HASH_HEX_LENGTH = 64;

interface StoredAdminKey {
  hash: string;
  createdAt: string;
}

const digest = (key: string): Buffer => createHash('sha256').update(key).digest();

const isStoredAdminKey = (value: unknown): value is StoredAdminKey =>
  typeof value === 'object' &&
  value !== null &&
  'hash' in value &&
  typeof value.hash === 'string' &&
  value.hash.length === HASH_HEX_LENGTH;

export class AdminKeyStore {
  private hash: Buffer | null = null;

  public constructor(
    private readonly filePath: string,
    private readonly fixedKey: string | null,
  ) {}

  public async ensure(): Promise<string | null> {
    if (this.fixedKey) {
      this.hash = digest(this.fixedKey);
      return null;
    }

    const stored = await this.read();
    if (stored) {
      this.hash = Buffer.from(stored.hash, 'hex');
      return null;
    }

    const key = `${KEY_PREFIX}${randomBytes(32).toString('base64url')}`;
    const hash = digest(key);
    const record: StoredAdminKey = { hash: hash.toString('hex'), createdAt: new Date().toISOString() };
    await mkdir(path.dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, JSON.stringify(record, null, 2), { mode: 0o600 });
    this.hash = hash;
    return key;
  }

  public verify(key: string): boolean {
    if (this.hash === null) return false;
    return timingSafeEqual(digest(key), this.hash);
  }

  private async read(): Promise<StoredAdminKey | null> {
    let raw: string;
    try {
      raw = await readFile(this.filePath, 'utf8');
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return null;
      throw error;
    }

    const parsed: unknown = JSON.parse(raw);
    if (!isStoredAdminKey(parsed)) {
      throw new Error(`管理キーファイルの形式が正しくありません: ${this.filePath}`);
    }
    return parsed;
  }
}
