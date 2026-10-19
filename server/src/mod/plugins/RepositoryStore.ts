import { execute, queryRows, type Queryable } from '../db/Database.js';
import type { PluginRepositoryRecord } from './types.js';

interface RepositoryRow {
  id: string;
  url: string;
  name: string;
  installed_sha: string;
  created_at: number;
  updated_at: number;
}

const COLUMNS = 'id, url, name, installed_sha, created_at, updated_at';

const toRecord = (row: RepositoryRow): PluginRepositoryRecord => ({
  id: row.id,
  url: row.url,
  name: row.name,
  installedSha: row.installed_sha,
  createdAt: Number(row.created_at),
  updatedAt: Number(row.updated_at),
});

export class RepositoryStore {
  public constructor(private readonly db: Queryable) {}

  public async list(): Promise<PluginRepositoryRecord[]> {
    const rows = await queryRows<RepositoryRow>(
      this.db,
      `SELECT ${COLUMNS} FROM plugin_repositories ORDER BY created_at ASC, id ASC`,
    );
    return rows.map(toRecord);
  }

  public async get(id: string): Promise<PluginRepositoryRecord | null> {
    const [row] = await queryRows<RepositoryRow>(this.db, `SELECT ${COLUMNS} FROM plugin_repositories WHERE id = ?`, [
      id,
    ]);
    return row ? toRecord(row) : null;
  }

  public async insert(record: PluginRepositoryRecord): Promise<void> {
    await execute(this.db, `INSERT INTO plugin_repositories (${COLUMNS}) VALUES (?, ?, ?, ?, ?, ?)`, [
      record.id,
      record.url,
      record.name,
      record.installedSha,
      record.createdAt,
      record.updatedAt,
    ]);
  }

  public async update(id: string, fields: { name: string; installedSha: string; updatedAt: number }): Promise<void> {
    await execute(this.db, 'UPDATE plugin_repositories SET name = ?, installed_sha = ?, updated_at = ? WHERE id = ?', [
      fields.name,
      fields.installedSha,
      fields.updatedAt,
      id,
    ]);
  }

  public async remove(id: string): Promise<boolean> {
    const result = await execute(this.db, 'DELETE FROM plugin_repositories WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}
