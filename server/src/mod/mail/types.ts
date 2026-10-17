export type MailProviderId = 'google';

export const MAIL_PROVIDER_IDS: readonly MailProviderId[] = ['google'];

export interface Mail {
  id: string;
  account: string;
  from: string;
  subject: string;
  body: string;
  receivedAt: Date;
}

export interface StoredMailAccount {
  id: string;
  provider: MailProviderId;
  email: string;
  name: string;
  refreshToken: string;
  connectedAt: number;
  connected: boolean;
  lastError: string | null;
  lastCheckedAt: number | null;
  cursor: string | null;
}

export interface MailAccountView {
  id: string;
  provider: MailProviderId;
  email: string;
  name: string;
  connectedAt: number;
  connected: boolean;
  lastError: string | null;
  lastCheckedAt: number | null;
}

export interface ConnectMailAccountInput {
  provider: MailProviderId;
  email: string;
  name: string;
  refreshToken: string;
}

export interface MailSettings {
  pollIntervalSec: number;
}

export const POLL_INTERVAL_SEC_MIN = 10;
export const POLL_INTERVAL_SEC_MAX = 86_400;
export const POLL_INTERVAL_SEC_DEFAULT = 300;

export const toMailAccountView = (account: StoredMailAccount): MailAccountView => ({
  id: account.id,
  provider: account.provider,
  email: account.email,
  name: account.name,
  connectedAt: account.connectedAt,
  connected: account.connected,
  lastError: account.lastError,
  lastCheckedAt: account.lastCheckedAt,
});
