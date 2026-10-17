import { createColumnHelper } from '@tanstack/react-table';
import type { DataTableFeatures } from '@/components/data-table/dataTableFeatures';
import { NodeActionsMenu } from '@/components/nodes/NodeActionsMenu';
import { NodeStatusBadge } from '@/components/nodes/NodeStatusBadge';
import type { NodeActionHandlers } from '@/components/nodes/nodeActions';
import { EMPTY_VALUE, formatDateTime, formatPing } from '@/components/nodes/nodeFormat';
import type { NodeInfo } from '@/types/node';

const columnHelper = createColumnHelper<DataTableFeatures, NodeInfo>();

export function createNodeColumns(handlers: NodeActionHandlers) {
  return columnHelper.columns([
    columnHelper.accessor('name', {
      header: '名前',
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    }),
    columnHelper.accessor('status', {
      header: 'ステータス',
      cell: ({ row }) => <NodeStatusBadge status={row.original.status} />,
    }),
    columnHelper.accessor('address', {
      header: 'アドレス',
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.address}</span>,
    }),
    columnHelper.display({
      id: 'os',
      header: 'OS',
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.health?.os.name ?? EMPTY_VALUE}</span>,
    }),
    columnHelper.display({
      id: 'ping',
      header: 'Ping',
      cell: ({ row }) => <span className="text-muted-foreground">{formatPing(row.original.pingMs)}</span>,
    }),
    columnHelper.accessor('lastSeenAt', {
      header: '最終接続',
      cell: ({ row }) => <span className="text-muted-foreground">{formatDateTime(row.original.lastSeenAt)}</span>,
    }),
    columnHelper.display({
      id: 'actions',
      header: () => <span className="sr-only">操作</span>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <NodeActionsMenu node={row.original} handlers={handlers} />
        </div>
      ),
    }),
  ]);
}
