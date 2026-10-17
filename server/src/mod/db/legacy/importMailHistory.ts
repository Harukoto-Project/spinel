import { MailHistoryStore } from '../../mail/history/MailHistoryStore.js';
import { MAIL_PROVIDER_IDS, type MailHistoryEntry } from '../../mail/types.js';
import type { LegacyImporter } from './types.js';

const isStringOrNull = (value: unknown): value is string | null => value === null || typeof value === 'string';

const isHistoryEntry = (value: unknown): value is MailHistoryEntry => {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.accountId === 'string' &&
    typeof v.accountName === 'string' &&
    typeof v.accountEmail === 'string' &&
    typeof v.provider === 'string' &&
    (MAIL_PROVIDER_IDS as readonly string[]).includes(v.provider) &&
    typeof v.from === 'string' &&
    typeof v.subject === 'string' &&
    typeof v.receivedAt === 'number' &&
    typeof v.processedAt === 'number' &&
    (v.decision === 'notify' || v.decision === 'ignore') &&
    (v.priority === null || v.priority === 'normal' || v.priority === 'urgent') &&
    isStringOrNull(v.summary) &&
    isStringOrNull(v.deadline)
  );
};

export const mailHistoryImporter: LegacyImporter = {
  name: 'メール履歴',
  file: 'mail-history.json',
  table: 'mail_history',
  async run(connection, data) {
    const list = typeof data === 'object' && data !== null && 'history' in data ? data.history : null;
    if (!Array.isArray(list) || !list.every(isHistoryEntry)) {
      throw new Error('メール履歴ファイルの形式が正しくありません');
    }

    const store = new MailHistoryStore(connection);
    for (const entry of [...list].reverse()) await store.add(entry);
    return list.length;
  },
};
