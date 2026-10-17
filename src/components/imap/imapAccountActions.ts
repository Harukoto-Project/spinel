import type { ImapAccount } from '@/types/imap';

export type ImapAccountActionHandlers = {
  onEdit: (account: ImapAccount) => void;
  onDelete: (account: ImapAccount) => void;
};

export type ImapAccountAction = {
  id: string;
  label: string;
  destructive?: boolean;
  separatorBefore?: boolean;
  onSelect: (account: ImapAccount, handlers: ImapAccountActionHandlers) => void;
};

export const IMAP_ACCOUNT_ACTIONS: ImapAccountAction[] = [
  {
    id: 'edit',
    label: '編集',
    onSelect: (account, handlers) => handlers.onEdit(account),
  },
  {
    id: 'delete',
    label: '削除',
    destructive: true,
    separatorBefore: true,
    onSelect: (account, handlers) => handlers.onDelete(account),
  },
];
