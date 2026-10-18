import { execute, queryRows, type Queryable } from '../db/Database.js';
import type { PluginManifest, PluginPermissions, PluginRecord } from './types.js';

interface PluginRow {
  id: string;
  repo_id: string;
  path: string;
  manifest: string;
  installed_version: string;
  enabled: number;
  granted_permissions: string | null;
  config: string;
  secrets: string | null;
  error_message: string | null;
  created_at: number;
  updated_at: number;
}

const COLUMNS =
  'id, repo_id, path, manifest, installed_version, enabled, granted_permissions, config, secrets, error_message, created_at, updated_at';

const toRecord = (row: PluginRow): PluginRecord => ({
  id: row.id,
  repoId: row.repo_id,
  path: row.path,
  manifest: JSON.parse(row.manifest) as PluginManifest,
  installedVersion: row.installed_version,
  enabled: row.enabled === 1,
  grantedPermissions: row.granted_permissions === null ? null : (JSON.parse(row.granted_permissions) as PluginPermissions),
  config: parseObject(row.config),
  secretKeys: Object.keys(parseObject(row.secrets)),
  errorMessage: row.error_message,
  createdAt: Number(row.created_at),
  updatedAt: Number(row.updated_at),
});

interface SettingsRow {
  config: string | null;
  secrets: string | null;
}

export interface StoredSettings {
  values: Record<string, unknown>;
  secrets: Record<string, unknown>;
}

const parseObject = (raw: string | null): Record<string, unknown> => {
  if (raw === null) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
};

export interface PluginInsert {
  id: string;
  repoId: string;
  path: string;
  manifest: PluginManifest;
  now: number;
}

export interface PluginSourceUpdate {
  path: string;
  manifest: PluginManifest;
  enabled: boolean;
  grantedPermissions: PluginPermissions | null;
  now: number;
}

export class PluginStore {
  public constructor(private readonly db: Queryable) {}

  public async list(): Promise<PluginRecord[]> {
    const rows = await queryRows<PluginRow>(this.db, `SELECT ${COLUMNS} FROM plugins ORDER BY created_at ASC, id ASC`);
    return rows.map(toRecord);
  }

  public async listByRepository(repoId: string): Promise<PluginRecord[]> {
    const rows = await queryRows<PluginRow>(
      this.db,
      `SELECT ${COLUMNS} FROM plugins WHERE repo_id = ? ORDER BY created_at ASC, id ASC`,
      [repoId],
    );
    return rows.map(toRecord);
  }

  public async get(id: string): Promise<PluginRecord | null> {
    const [row] = await queryRows<PluginRow>(this.db, `SELECT ${COLUMNS} FROM plugins WHERE id = ?`, [id]);
    return row ? toRecord(row) : null;
  }

  public async findIdsInOtherRepositories(ids: readonly string[], repoId: string): Promise<string[]> {
    if (ids.length === 0) return [];
    const rows = await queryRows<Pick<PluginRow, 'id'>>(
      this.db,
      'SELECT id FROM plugins WHERE repo_id <> ? AND id IN (?)',
      [repoId, [...ids]],
    );
    return rows.map((row) => row.id);
  }

  public async insert(plugin: PluginInsert): Promise<void> {
    await execute(
      this.db,
      `INSERT INTO plugins (id, repo_id, path, manifest, installed_version, enabled, granted_permissions, config, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 0, NULL, '{}', ?, ?)`,
      [
        plugin.id,
        plugin.repoId,
        plugin.path,
        JSON.stringify(plugin.manifest),
        plugin.manifest.version,
        plugin.now,
        plugin.now,
      ],
    );
  }

  public async updateSource(id: string, update: PluginSourceUpdate): Promise<void> {
    await execute(
      this.db,
      `UPDATE plugins
       SET path = ?, manifest = ?, installed_version = ?, enabled = ?, granted_permissions = ?, error_message = NULL, updated_at = ?
       WHERE id = ?`,
      [
        update.path,
        JSON.stringify(update.manifest),
        update.manifest.version,
        update.enabled ? 1 : 0,
        update.grantedPermissions === null ? null : JSON.stringify(update.grantedPermissions),
        update.now,
        id,
      ],
    );
  }

  public async getStoredSettings(id: string): Promise<StoredSettings> {
    const [row] = await queryRows<SettingsRow>(this.db, 'SELECT config, secrets FROM plugins WHERE id = ?', [id]);
    return {
      values: parseObject(row?.config ?? null),
      secrets: parseObject(row?.secrets ?? null),
    };
  }

  public async saveSettings(id: string, values: Record<string, unknown>, secrets: Record<string, unknown>): Promise<void> {
    await execute(this.db, 'UPDATE plugins SET config = ?, secrets = ?, updated_at = ? WHERE id = ?', [
      JSON.stringify(values),
      Object.keys(secrets).length === 0 ? null : JSON.stringify(secrets),
      Date.now(),
      id,
    ]);
  }

  public async setEnabled(id: string, enabled: boolean, grantedPermissions: PluginPermissions | null): Promise<void> {
    await execute(
      this.db,
      'UPDATE plugins SET enabled = ?, granted_permissions = ?, error_message = NULL, updated_at = ? WHERE id = ?',
      [enabled ? 1 : 0, grantedPermissions === null ? null : JSON.stringify(grantedPermissions), Date.now(), id],
    );
  }

  public async setError(id: string, message: string | null): Promise<void> {
    await execute(this.db, 'UPDATE plugins SET error_message = ? WHERE id = ?', [message, id]);
  }

  public async removeByIds(ids: readonly string[]): Promise<void> {
    if (ids.length === 0) return;
    await execute(this.db, 'DELETE FROM plugins WHERE id IN (?)', [[...ids]]);
  }
}
