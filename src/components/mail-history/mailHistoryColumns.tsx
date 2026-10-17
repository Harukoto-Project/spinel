import { createColumnHelper } from '@tanstack/react-table';
import type { DataTableFeatures } from '@/components/data-table/dataTableFeatures';
import { MailDecisionBadge } from '@/components/mail-history/MailDecisionBadge';
import { formatHistoryTime, formatSubject } from '@/components/mail-history/mailHistoryFormat';
import { EMPTY_VALUE } from '@/components/nodes/nodeFormat';
import { NotificationPriorityBadge } from '@/components/notifications/NotificationPriorityBadge';
import type { MailHistoryEntry } from '@/types/mailHistory';

const columnHelper = createColumnHelper<DataTableFeatures, MailHistoryEntry>();

export function createMailHistoryColumns() {
  return columnHelper.columns([
    columnHelper.accessor('processedAt', {
      header: '処理日時',
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-muted-foreground">{formatHistoryTime(row.original.processedAt)}</span>
      ),
    }),
    columnHelper.accessor('accountName', {
      header: 'アカウント',
      cell: ({ row }) => (
        <div className="flex max-w-56 flex-col gap-0.5">
          <span className="truncate font-medium">{row.original.accountName}</span>
          {row.original.accountEmail !== row.original.accountName && (
            <span className="truncate text-xs text-muted-foreground">{row.original.accountEmail}</span>
          )}
        </div>
      ),
    }),
    columnHelper.accessor('decision', {
      header: '判定',
      cell: ({ row }) => <MailDecisionBadge decision={row.original.decision} />,
    }),
    columnHelper.accessor('priority', {
      header: '優先度',
      cell: ({ row }) =>
        row.original.priority === null ? (
          <span className="text-muted-foreground">{EMPTY_VALUE}</span>
        ) : (
          <NotificationPriorityBadge priority={row.original.priority} />
        ),
    }),
    columnHelper.accessor('subject', {
      header: '件名',
      cell: ({ row }) => (
        <div className="flex max-w-md min-w-48 flex-col gap-0.5">
          <span className="truncate font-medium">{formatSubject(row.original.subject)}</span>
          {row.original.summary && (
            <span className="line-clamp-2 text-sm text-muted-foreground">{row.original.summary}</span>
          )}
        </div>
      ),
    }),
    columnHelper.accessor('from', {
      header: '差出人',
      cell: ({ row }) => <span className="block max-w-56 truncate text-muted-foreground">{row.original.from}</span>,
    }),
  ]);
}
