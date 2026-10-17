import { Fragment } from 'react';
import { IMAP_ACCOUNT_ACTIONS, type ImapAccountActionHandlers } from '@/components/imap/imapAccountActions';
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
} from '@/components/ui/context-menu';
import type { ImapAccount } from '@/types/imap';

type ImapAccountContextMenuContentProps = {
  account: ImapAccount;
  handlers: ImapAccountActionHandlers;
};

export function ImapAccountContextMenuContent({ account, handlers }: ImapAccountContextMenuContentProps) {
  return (
    <ContextMenuContent>
      <ContextMenuLabel>{account.name}</ContextMenuLabel>
      <ContextMenuSeparator />
      {IMAP_ACCOUNT_ACTIONS.map((action) => (
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
