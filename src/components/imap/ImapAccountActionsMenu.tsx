import { Fragment } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { IMAP_ACCOUNT_ACTIONS, type ImapAccountActionHandlers } from '@/components/imap/imapAccountActions';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ImapAccount } from '@/types/imap';

type ImapAccountActionsMenuProps = {
  account: ImapAccount;
  handlers: ImapAccountActionHandlers;
};

export function ImapAccountActionsMenu({ account, handlers }: ImapAccountActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8">
          <span className="sr-only">メニューを開く</span>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>操作</DropdownMenuLabel>
        {IMAP_ACCOUNT_ACTIONS.map((action) => (
          <Fragment key={action.id}>
            {action.separatorBefore && <DropdownMenuSeparator />}
            <DropdownMenuItem
              variant={action.destructive ? 'destructive' : 'default'}
              onSelect={() => action.onSelect(account, handlers)}
            >
              {action.label}
            </DropdownMenuItem>
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
