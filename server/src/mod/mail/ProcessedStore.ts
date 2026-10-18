import { execute, queryRows, type Queryable } from '../db/Database.js';

const MAX_ENTRIES = 5000;

interface ProcessedRow {
  found: number;
}

export class ProcessedStore {
  public constructor(private readonly db: Queryable) {}

  public async has(id: string): Promise<boolean> {
    const rows = await queryRows<ProcessedRow>(this.db, 'SELECT 1 AS found FROM mail_processed WHERE mail_id = ?', [
      id,
    ]);
    return rows.length > 0;
  }

  public async add(id: string): Promise<void> {
    const result = await execute(this.db, 'INSERT IGNORE INTO mail_processed (mail_id) VALUES (?)', [id]);
    if (result.affectedRows === 0) return;

    await execute(
      this.db,
      `DELETE FROM mail_processed WHERE seq <= (
         SELECT seq FROM (
           SELECT seq FROM mail_processed ORDER BY seq DESC LIMIT 1 OFFSET ?
         ) AS oldest
       )`,
      [MAX_ENTRIES],
    );
  }
}
