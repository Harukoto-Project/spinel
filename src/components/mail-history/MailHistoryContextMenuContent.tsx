import { Fragment } from 'react';
import { formatSubject } from '@/components/mail-history/mailHistoryFormat';
import { MAIL_HISTORY_ACTIONS, type MailHistoryActionHandlers } from '@/components/mail-history/mailHistoryActions';
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
} from '@/components/ui/context-menu';
import type { MailHistoryEntry } from '@/types/mailHistory';

type MailHistoryContextMenuContentProps = {
  entry: MailHistoryEntry;
  handlers: MailHistoryActionHandlers;
};

export function MailHistoryContextMenuContent({ entry, handlers }: MailHistoryContextMenuContentProps) {
  return (
    <ContextMenuContent>
      <ContextMenuLabel className="max-w-64 truncate">{formatSubject(entry.subject)}</ContextMenuLabel>
      <ContextMenuSeparator />
      {MAIL_HISTORY_ACTIONS.map((action) => (
        <Fragment key={action.id}>
          {action.separatorBefore && <ContextMenuSeparator />}
          <ContextMenuItem
            variant={action.destructive ? 'destructive' : 'default'}
            onSelect={() => action.onSelect(entry, handlers)}
          >
            {action.label}
          </ContextMenuItem>
        </Fragment>
      ))}
    </ContextMenuContent>
  );
}
