import { execute, queryRows, type Queryable } from '../../db/Database.js';
import type { Transport } from '../GitClient.js';

export interface PluginSourceRecord {
  pluginId: string;
  repo: string;
  ref: string | null;
  transport: Transport;
  installedSha: string;
  createdAt: number;
  updatedAt: number;
}

interface SourceRow {
  plugin_id: string;
  repo: string;
  source_ref: string | null;
  transport: string;
  installed_sha: string;
  created_at: number;
  updated_at: number;
}

const COLUMNS = 'plugin_id, repo, source_ref, transport, installed_sha, created_at, updated_at';

const toRecord = (row: SourceRow): PluginSourceRecord => ({
  pluginId: row.plugin_id,
  repo: row.repo,
  ref: row.source_ref,
  transport: row.transport === 'ssh' ? 'ssh' : 'https',
  installedSha: row.installed_sha,
  createdAt: Number(row.created_at),
  updatedAt: Number(row.updated_at),
});

export class PluginSourceStore {
  public constructor(private readonly db: Queryable) {}

  public async get(pluginId: string): Promise<PluginSourceRecord | null> {
    const [row] = await queryRows<SourceRow>(this.db, `SELECT ${COLUMNS} FROM plugin_sources WHERE plugin_id = ?`, [
      pluginId,
    ]);
    return row ? toRecord(row) : null;
  }

  public async upsert(record: PluginSourceRecord): Promise<void> {
    await execute(
      this.db,
      `INSERT INTO plugin_sources (${COLUMNS}) VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         repo = VALUES(repo),
         source_ref = VALUES(source_ref),
         transport = VALUES(transport),
         installed_sha = VALUES(installed_sha),
         updated_at = VALUES(updated_at)`,
      [
        record.pluginId,
        record.repo,
        record.ref,
        record.transport,
        record.installedSha,
        record.createdAt,
        record.updatedAt,
      ],
    );
  }

  public async remove(pluginId: string): Promise<void> {
    await execute(this.db, 'DELETE FROM plugin_sources WHERE plugin_id = ?', [pluginId]);
  }
}
