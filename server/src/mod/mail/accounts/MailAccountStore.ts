import { execute, queryRows, type Queryable } from '../../db/Database.js';
import type { MailProviderId, StoredMailAccount } from '../types.js';

interface MailAccountRow {
  id: string;
  provider: MailProviderId;
  email: string;
  name: string;
  refresh_token: string;
  connected_at: number;
  connected: number;
  last_error: string | null;
  last_checked_at: number | null;
  sync_cursor: string | null;
}

const SELECT_COLUMNS =
  'id, provider, email, name, refresh_token, connected_at, connected, last_error, last_checked_at, sync_cursor';

const COLUMN_BY_FIELD: Record<Exclude<keyof StoredMailAccount, 'id'>, string> = {
  provider: 'provider',
  email: 'email',
  name: 'name',
  refreshToken: 'refresh_token',
  connectedAt: 'connected_at',
  connected: 'connected',
  lastError: 'last_error',
  lastCheckedAt: 'last_checked_at',
  cursor: 'sync_cursor',
};

const toAccount = (row: MailAccountRow): StoredMailAccount => ({
  id: row.id,
  provider: row.provider,
  email: row.email,
  name: row.name,
  refreshToken: row.refresh_token,
  connectedAt: Number(row.connected_at),
  connected: row.connected === 1,
  lastError: row.last_error,
  lastCheckedAt: row.last_checked_at === null ? null : Number(row.last_checked_at),
  cursor: row.sync_cursor,
});

const toColumnValue = (value: unknown): unknown => (typeof value === 'boolean' ? (value ? 1 : 0) : value);

export class MailAccountStore {
  public constructor(private readonly db: Queryable) {}

  public async list(): Promise<StoredMailAccount[]> {
    const rows = await queryRows<MailAccountRow>(
      this.db,
      `SELECT ${SELECT_COLUMNS} FROM mail_accounts ORDER BY seq ASC`,
    );
    return rows.map(toAccount);
  }

  public async get(id: string): Promise<StoredMailAccount | undefined> {
    const [row] = await queryRows<MailAccountRow>(
      this.db,
      `SELECT ${SELECT_COLUMNS} FROM mail_accounts WHERE id = ?`,
      [id],
    );
    return row ? toAccount(row) : undefined;
  }

  public async findByEmail(provider: MailProviderId, email: string): Promise<StoredMailAccount | undefined> {
    const [row] = await queryRows<MailAccountRow>(
      this.db,
      `SELECT ${SELECT_COLUMNS} FROM mail_accounts WHERE provider = ? AND email = ?`,
      [provider, email],
    );
    return row ? toAccount(row) : undefined;
  }

  public async save(account: StoredMailAccount): Promise<void> {
    await execute(
      this.db,
      `INSERT INTO mail_accounts (${SELECT_COLUMNS})
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         provider = VALUES(provider),
         email = VALUES(email),
         name = VALUES(name),
         refresh_token = VALUES(refresh_token),
         connected_at = VALUES(connected_at),
         connected = VALUES(connected),
         last_error = VALUES(last_error),
         last_checked_at = VALUES(last_checked_at),
         sync_cursor = VALUES(sync_cursor)`,
      [
        account.id,
        account.provider,
        account.email,
        account.name,
        account.refreshToken,
        account.connectedAt,
        account.connected ? 1 : 0,
        account.lastError,
        account.lastCheckedAt,
        account.cursor,
      ],
    );
  }

  public async update(id: string, patch: Partial<Omit<StoredMailAccount, 'id'>>): Promise<void> {
    const assignments: string[] = [];
    const params: unknown[] = [];
    for (const [field, value] of Object.entries(patch)) {
      const column = COLUMN_BY_FIELD[field as keyof typeof COLUMN_BY_FIELD];
      if (column === undefined || value === undefined) continue;
      assignments.push(`${column} = ?`);
      params.push(toColumnValue(value));
    }
    if (assignments.length === 0) return;

    await execute(this.db, `UPDATE mail_accounts SET ${assignments.join(', ')} WHERE id = ?`, [...params, id]);
  }

  public async remove(id: string): Promise<boolean> {
    const result = await execute(this.db, 'DELETE FROM mail_accounts WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}
