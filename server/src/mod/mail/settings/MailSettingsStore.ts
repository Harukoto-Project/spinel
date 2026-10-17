import { execute, queryRows, type Queryable } from '../../db/Database.js';
import {
  POLL_INTERVAL_SEC_DEFAULT,
  POLL_INTERVAL_SEC_MAX,
  POLL_INTERVAL_SEC_MIN,
  type MailSettings,
} from '../types.js';

type Listener = (settings: MailSettings) => void;

const ROW_ID = 1;

interface MailSettingsRow {
  poll_interval_sec: number;
}

export const isValidPollInterval = (value: unknown): value is number =>
  typeof value === 'number' &&
  Number.isInteger(value) &&
  value >= POLL_INTERVAL_SEC_MIN &&
  value <= POLL_INTERVAL_SEC_MAX;

export class MailSettingsStore {
  private readonly listeners = new Set<Listener>();

  public constructor(private readonly db: Queryable) {}

  public async get(): Promise<MailSettings> {
    const [row] = await queryRows<MailSettingsRow>(
      this.db,
      'SELECT poll_interval_sec FROM mail_settings WHERE id = ?',
      [ROW_ID],
    );
    if (row === undefined) return { pollIntervalSec: POLL_INTERVAL_SEC_DEFAULT };

    const interval = Number(row.poll_interval_sec);
    if (!isValidPollInterval(interval)) {
      throw new Error('メール設定の取得間隔が正しくありません(mail_settings テーブル)');
    }
    return { pollIntervalSec: interval };
  }

  public subscribe(listener: Listener): void {
    this.listeners.add(listener);
  }

  public async update(settings: MailSettings): Promise<void> {
    await execute(
      this.db,
      `INSERT INTO mail_settings (id, poll_interval_sec) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE poll_interval_sec = VALUES(poll_interval_sec)`,
      [ROW_ID, settings.pollIntervalSec],
    );
    for (const listener of this.listeners) listener({ ...settings });
  }
}
