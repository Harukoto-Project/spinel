import { Fragment } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { MAIL_ACCOUNT_ACTIONS, type MailAccountActionHandlers } from '@/components/mail-accounts/mailAccountActions';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { MailAccount } from '@/types/mailAccount';

type MailAccountActionsMenuProps = {
  account: MailAccount;
  handlers: MailAccountActionHandlers;
};

export function MailAccountActionsMenu({ account, handlers }: MailAccountActionsMenuProps) {
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
        {MAIL_ACCOUNT_ACTIONS.map((action) => (
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
