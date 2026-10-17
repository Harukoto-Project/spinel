import { invoke } from '@tauri-apps/api/core';
import type { ImapAccountInput, ImapConfig, ImapSettings } from '@/types/imap';

export function loadImapConfig(nodeId: string): Promise<ImapConfig> {
  return invoke<ImapConfig>('load_imap_config', { nodeId });
}

export function saveImapAccount(nodeId: string, account: ImapAccountInput): Promise<ImapConfig> {
  return invoke<ImapConfig>('save_imap_account', { nodeId, account });
}

export function deleteImapAccount(nodeId: string, accountId: string): Promise<ImapConfig> {
  return invoke<ImapConfig>('delete_imap_account', { nodeId, accountId });
}

export function saveImapSettings(nodeId: string, settings: ImapSettings): Promise<ImapConfig> {
  return invoke<ImapConfig>('save_imap_settings', { nodeId, settings });
}

export function deleteImapConfig(nodeId: string): Promise<void> {
  return invoke('delete_imap_config', { nodeId });
}
