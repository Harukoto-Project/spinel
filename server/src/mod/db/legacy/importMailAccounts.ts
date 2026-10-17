import { MailAccountStore } from '../../mail/accounts/MailAccountStore.js';
import { MAIL_PROVIDER_IDS, type StoredMailAccount } from '../../mail/types.js';
import type { LegacyImporter } from './types.js';

const isStringOrNull = (value: unknown): value is string | null => value === null || typeof value === 'string';

const isNumberOrNull = (value: unknown): value is number | null => value === null || typeof value === 'number';

const isStoredAccount = (value: unknown): value is StoredMailAccount => {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.provider === 'string' &&
    (MAIL_PROVIDER_IDS as readonly string[]).includes(v.provider) &&
    typeof v.email === 'string' &&
    typeof v.name === 'string' &&
    typeof v.refreshToken === 'string' &&
    typeof v.connectedAt === 'number' &&
    typeof v.connected === 'boolean' &&
    isStringOrNull(v.lastError) &&
    isNumberOrNull(v.lastCheckedAt) &&
    isStringOrNull(v.cursor)
  );
};

export const mailAccountsImporter: LegacyImporter = {
  name: 'メールアカウント',
  file: 'mail-accounts.json',
  table: 'mail_accounts',
  async run(connection, data) {
    const list = typeof data === 'object' && data !== null && 'accounts' in data ? data.accounts : null;
    if (!Array.isArray(list) || !list.every(isStoredAccount)) {
      throw new Error('メールアカウントファイルの形式が正しくありません');
    }

    const store = new MailAccountStore(connection);
    for (const account of list) await store.save(account);
    return list.length;
  },
};
