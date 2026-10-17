import { invoke } from '@tauri-apps/api/core';
import type { MailAccount, MailProviderId } from '@/types/mailAccount';

export function loadMailAccounts(nodeId: string): Promise<MailAccount[]> {
  return invoke<MailAccount[]>('load_mail_accounts', { nodeId });
}

export function connectMailAccount(nodeId: string, provider: MailProviderId): Promise<MailAccount[]> {
  return invoke<MailAccount[]>('connect_mail_account', { nodeId, provider });
}

export function deleteMailAccount(nodeId: string, accountId: string): Promise<MailAccount[]> {
  return invoke<MailAccount[]>('delete_mail_account', { nodeId, accountId });
}

export function deleteMailAccounts(nodeId: string): Promise<void> {
  return invoke('delete_mail_accounts', { nodeId });
}
