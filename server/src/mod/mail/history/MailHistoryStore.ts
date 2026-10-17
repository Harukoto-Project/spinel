import { execute, queryRows, type Queryable } from '../../db/Database.js';
import type { MailDecision, MailHistoryEntry, MailHistoryPriority, MailProviderId } from '../types.js';

const MAX_ENTRIES = 1000;

interface MailHistoryRow {
  id: string;
  account_id: string;
  account_name: string;
  account_email: string;
  provider: MailProviderId;
  sender: string;
  subject: string;
  received_at: number;
  processed_at: number;
  decision: MailDecision;
  priority: MailHistoryPriority | null;
  summary: string | null;
  deadline: string | null;
}

const SELECT_COLUMNS =
  'id, account_id, account_name, account_email, provider, sender, subject, received_at, processed_at, decision, priority, summary, deadline';

const toEntry = (row: MailHistoryRow): MailHistoryEntry => ({
  id: row.id,
  accountId: row.account_id,
  accountName: row.account_name,
  accountEmail: row.account_email,
  provider: row.provider,
  from: row.sender,
  subject: row.subject,
  receivedAt: Number(row.received_at),
  processedAt: Number(row.processed_at),
  decision: row.decision,
  priority: row.priority,
  summary: row.summary,
  deadline: row.deadline,
});

export class MailHistoryStore {
  public constructor(private readonly db: Queryable) {}

  public async list(): Promise<MailHistoryEntry[]> {
    const rows = await queryRows<MailHistoryRow>(
      this.db,
      `SELECT ${SELECT_COLUMNS} FROM mail_history ORDER BY seq DESC LIMIT ?`,
      [MAX_ENTRIES],
    );
    return rows.map(toEntry);
  }

  public async add(entry: MailHistoryEntry): Promise<void> {
    await execute(
      this.db,
      `INSERT INTO mail_history (${SELECT_COLUMNS}) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        entry.id,
        entry.accountId,
        entry.accountName,
        entry.accountEmail,
        entry.provider,
        entry.from,
        entry.subject,
        entry.receivedAt,
        entry.processedAt,
        entry.decision,
        entry.priority,
        entry.summary,
        entry.deadline,
      ],
    );

    await execute(
      this.db,
      `DELETE FROM mail_history WHERE seq <= (
         SELECT seq FROM (
           SELECT seq FROM mail_history ORDER BY seq DESC LIMIT 1 OFFSET ?
         ) AS oldest
       )`,
      [MAX_ENTRIES],
    );
  }

  public async remove(id: string): Promise<boolean> {
    const result = await execute(this.db, 'DELETE FROM mail_history WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  public async clear(): Promise<void> {
    await execute(this.db, 'DELETE FROM mail_history');
  }
}
