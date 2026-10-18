import { execute, queryRows, type Queryable } from '../db/Database.js';
import type { ApiKeyId } from './types.js';

interface ApiKeyRow {
  id: ApiKeyId;
  api_key: string;
}

export class ApiKeyStore {
  public constructor(private readonly db: Queryable) {}

  public async get(id: ApiKeyId): Promise<string | null> {
    const [row] = await queryRows<ApiKeyRow>(this.db, 'SELECT id, api_key FROM api_keys WHERE id = ?', [id]);
    return row?.api_key ?? null;
  }

  public async listIds(): Promise<ApiKeyId[]> {
    const rows = await queryRows<Pick<ApiKeyRow, 'id'>>(this.db, 'SELECT id FROM api_keys');
    return rows.map((row) => row.id);
  }

  public async set(id: ApiKeyId, value: string): Promise<void> {
    await execute(
      this.db,
      `INSERT INTO api_keys (id, api_key, updated_at) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE api_key = VALUES(api_key), updated_at = VALUES(updated_at)`,
      [id, value, Date.now()],
    );
  }

  public async remove(id: ApiKeyId): Promise<boolean> {
    const result = await execute(this.db, 'DELETE FROM api_keys WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}
