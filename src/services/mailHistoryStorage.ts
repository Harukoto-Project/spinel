import { invoke } from '@tauri-apps/api/core';
import type { MailHistoryEntry } from '@/types/mailHistory';

export function loadMailHistory(nodeId: string): Promise<MailHistoryEntry[]> {
  return invoke<MailHistoryEntry[]>('load_mail_history', { nodeId });
}

export function deleteMailHistory(nodeId: string, entryId: string): Promise<MailHistoryEntry[]> {
  return invoke<MailHistoryEntry[]>('delete_mail_history', { nodeId, entryId });
}

export function clearMailHistory(nodeId: string): Promise<MailHistoryEntry[]> {
  return invoke<MailHistoryEntry[]>('clear_mail_history', { nodeId });
}
