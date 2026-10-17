import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { execute, queryRows, type Db } from '../db/Database.js';

const KEY_PREFIX = 'spn_';
const HASH_HEX_LENGTH = 64;
const ROW_ID = 1;

interface AdminKeyRow {
  hash: string;
}

const digest = (key: string): Buffer => createHash('sha256').update(key).digest();

export class AdminKeyStore {
  private hash: Buffer | null = null;

  public constructor(
    private readonly db: Db,
    private readonly fixedKey: string | null,
  ) {}

  public async ensure(): Promise<string | null> {
    if (this.fixedKey) {
      this.hash = digest(this.fixedKey);
      return null;
    }

    const stored = await this.read();
    if (stored) {
      this.hash = stored;
      return null;
    }

    const key = `${KEY_PREFIX}${randomBytes(32).toString('base64url')}`;
    const hash = digest(key);
    const result = await execute(this.db, 'INSERT IGNORE INTO admin_keys (id, hash, created_at) VALUES (?, ?, ?)', [
      ROW_ID,
      hash.toString('hex'),
      Date.now(),
    ]);
    if (result.affectedRows === 0) {
      const raced = await this.read();
      if (raced === null) throw new Error('管理キーを保存できませんでした');
      this.hash = raced;
      return null;
    }

    this.hash = hash;
    return key;
  }

  public verify(key: string): boolean {
    if (this.hash === null) return false;
    return timingSafeEqual(digest(key), this.hash);
  }

  private async read(): Promise<Buffer | null> {
    const [row] = await queryRows<AdminKeyRow>(this.db, 'SELECT hash FROM admin_keys WHERE id = ?', [ROW_ID]);
    if (row === undefined) return null;
    if (row.hash.length !== HASH_HEX_LENGTH) {
      throw new Error('管理キーのハッシュの形式が正しくありません(admin_keys テーブル)');
    }
    return Buffer.from(row.hash, 'hex');
  }
}
