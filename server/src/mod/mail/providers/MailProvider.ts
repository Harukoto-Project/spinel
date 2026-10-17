import type { Mail, MailProviderId, StoredMailAccount } from '../types.js';

export type ProviderAccount = Pick<StoredMailAccount, 'id' | 'name' | 'refreshToken'>;

export interface FetchResult {
  mails: Mail[];
  cursor: string;
}

export interface MailProvider {
  readonly id: MailProviderId;
  readonly configured: boolean;
  initCursor(account: ProviderAccount): Promise<string>;
  fetchNew(account: ProviderAccount, cursor: string): Promise<FetchResult>;
}
