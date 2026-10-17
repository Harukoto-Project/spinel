import { createColumnHelper } from '@tanstack/react-table';
import type { DataTableFeatures } from '@/components/data-table/dataTableFeatures';
import { EMPTY_VALUE } from '@/components/nodes/nodeFormat';
import { NotificationPriorityBadge } from '@/components/notifications/NotificationPriorityBadge';
import { formatReceivedAt } from '@/components/notifications/notificationHistoryFormat';
import { UNKNOWN_NODE_NAME } from '@/components/notifications/notificationHistorySearch';
import { KIND_LABELS } from '@/config/notifications';
import type { ReceivedNotification } from '@/types/notification';

const columnHelper = createColumnHelper<DataTableFeatures, ReceivedNotification>();

export function createNotificationHistoryColumns(nodeNames: ReadonlyMap<string, string>) {
  return columnHelper.columns([
    columnHelper.accessor('receivedAt', {
      header: '受信日時',
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-muted-foreground">{formatReceivedAt(row.original.receivedAt)}</span>
      ),
    }),
    columnHelper.display({
      id: 'node',
      header: 'ノード',
      cell: ({ row }) => <span>{nodeNames.get(row.original.nodeId) ?? UNKNOWN_NODE_NAME}</span>,
    }),
    columnHelper.accessor('priority', {
      header: '優先度',
      cell: ({ row }) => <NotificationPriorityBadge priority={row.original.priority} />,
    }),
    columnHelper.accessor('kind', {
      header: '種別',
      cell: ({ row }) => <span className="text-muted-foreground">{KIND_LABELS[row.original.kind]}</span>,
    }),
    columnHelper.display({
      id: 'content',
      header: '内容',
      cell: ({ row }) => (
        <div className="flex max-w-md min-w-48 flex-col gap-0.5">
          <span className="truncate font-medium">{row.original.title}</span>
          <span className="line-clamp-2 text-sm whitespace-pre-line text-muted-foreground">{row.original.body}</span>
        </div>
      ),
    }),
    columnHelper.accessor('shown', {
      header: 'Windows通知',
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-muted-foreground">{row.original.shown ? '表示済み' : EMPTY_VALUE}</span>
      ),
    }),
  ]);
}
