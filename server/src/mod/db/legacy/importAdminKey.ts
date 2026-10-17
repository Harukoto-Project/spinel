import { execute } from '../Database.js';
import type { LegacyImporter } from './types.js';

const HASH_HEX_PATTERN = /^[0-9a-fA-F]{64}$/;
const ROW_ID = 1;

export const adminKeyImporter: LegacyImporter = {
  name: '管理キー',
  file: 'admin-key.json',
  table: 'admin_keys',
  async run(connection, data) {
    if (typeof data !== 'object' || data === null || !('hash' in data) || typeof data.hash !== 'string') {
      throw new Error('管理キーファイルの形式が正しくありません');
    }
    if (!HASH_HEX_PATTERN.test(data.hash)) {
      throw new Error('管理キーファイルのハッシュの形式が正しくありません');
    }

    const createdAt = 'createdAt' in data && typeof data.createdAt === 'string' ? Date.parse(data.createdAt) : NaN;
    await execute(connection, 'INSERT INTO admin_keys (id, hash, created_at) VALUES (?, ?, ?)', [
      ROW_ID,
      data.hash.toLowerCase(),
      Number.isFinite(createdAt) ? createdAt : Date.now(),
    ]);
    return 1;
  },
};
