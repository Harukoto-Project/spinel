import type { MailAccount } from '@/types/mailAccount';

export type MailAccountActionHandlers = {
  onDelete: (account: MailAccount) => void;
};

export type MailAccountAction = {
  id: string;
  label: string;
  destructive?: boolean;
  separatorBefore?: boolean;
  onSelect: (account: MailAccount, handlers: MailAccountActionHandlers) => void;
};

export const MAIL_ACCOUNT_ACTIONS: MailAccountAction[] = [
  {
    id: 'delete',
    label: '削除',
    destructive: true,
    onSelect: (account, handlers) => handlers.onDelete(account),
  },
];
