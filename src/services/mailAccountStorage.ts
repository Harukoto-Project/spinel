import { invoke } from '@tauri-apps/api/core';
import type { MailAccount, MailProviderId, MailSettings } from '@/types/mailAccount';

export function loadMailAccounts(nodeId: string): Promise<MailAccount[]> {
  return invoke<MailAccount[]>('load_mail_accounts', { nodeId });
}

export function connectMailAccount(nodeId: string, provider: MailProviderId): Promise<MailAccount[]> {
  return invoke<MailAccount[]>('connect_mail_account', { nodeId, provider });
}

export function deleteMailAccount(nodeId: string, accountId: string): Promise<MailAccount[]> {
  return invoke<MailAccount[]>('delete_mail_account', { nodeId, accountId });
}

export function loadMailSettings(nodeId: string): Promise<MailSettings> {
  return invoke<MailSettings>('load_mail_settings', { nodeId });
}

export function saveMailSettings(nodeId: string, settings: MailSettings): Promise<MailSettings> {
  return invoke<MailSettings>('save_mail_settings', { nodeId, settings });
}
