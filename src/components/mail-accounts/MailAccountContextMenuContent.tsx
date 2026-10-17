import { Fragment } from 'react';
import { MAIL_ACCOUNT_ACTIONS, type MailAccountActionHandlers } from '@/components/mail-accounts/mailAccountActions';
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
} from '@/components/ui/context-menu';
import type { MailAccount } from '@/types/mailAccount';

type MailAccountContextMenuContentProps = {
  account: MailAccount;
  handlers: MailAccountActionHandlers;
};

export function MailAccountContextMenuContent({ account, handlers }: MailAccountContextMenuContentProps) {
  return (
    <ContextMenuContent>
      <ContextMenuLabel>{account.name}</ContextMenuLabel>
      <ContextMenuSeparator />
      {MAIL_ACCOUNT_ACTIONS.map((action) => (
        <Fragment key={action.id}>
          {action.separatorBefore && <ContextMenuSeparator />}
          <ContextMenuItem
            variant={action.destructive ? 'destructive' : 'default'}
            onSelect={() => action.onSelect(account, handlers)}
          >
            {action.label}
          </ContextMenuItem>
        </Fragment>
      ))}
    </ContextMenuContent>
  );
}
