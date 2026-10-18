import { execute, queryRows, type Queryable } from '../db/Database.js';

interface StorageRow {
  item_value: string;
}

export class PluginStorageStore {
  public constructor(private readonly db: Queryable) {}

  public async get(pluginId: string, key: string): Promise<string | null> {
    const [row] = await queryRows<StorageRow>(
      this.db,
      'SELECT item_value FROM plugin_storage WHERE plugin_id = ? AND item_key = ?',
      [pluginId, key],
    );
    return row?.item_value ?? null;
  }

  public async set(pluginId: string, key: string, value: string): Promise<void> {
    await execute(
      this.db,
      `INSERT INTO plugin_storage (plugin_id, item_key, item_value) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE item_value = VALUES(item_value)`,
      [pluginId, key, value],
    );
  }

  public async remove(pluginId: string, key: string): Promise<boolean> {
    const result = await execute(this.db, 'DELETE FROM plugin_storage WHERE plugin_id = ? AND item_key = ?', [
      pluginId,
      key,
    ]);
    return result.affectedRows > 0;
  }
}
