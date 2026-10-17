import type { MailHistoryEntry } from '@/types/mailHistory';

export type MailHistoryActionHandlers = {
  onDelete: (entry: MailHistoryEntry) => void;
};

export type MailHistoryAction = {
  id: string;
  label: string;
  destructive?: boolean;
  separatorBefore?: boolean;
  onSelect: (entry: MailHistoryEntry, handlers: MailHistoryActionHandlers) => void;
};

export const MAIL_HISTORY_ACTIONS: MailHistoryAction[] = [
  {
    id: 'delete',
    label: '削除',
    destructive: true,
    onSelect: (entry, handlers) => handlers.onDelete(entry),
  },
];
