import { createColumnHelper } from '@tanstack/react-table';
import type { DataTableFeatures } from '@/components/data-table/dataTableFeatures';
import { ImapAccountActionsMenu } from '@/components/imap/ImapAccountActionsMenu';
import type { ImapAccountActionHandlers } from '@/components/imap/imapAccountActions';
import { Badge } from '@/components/ui/badge';
import type { ImapAccount } from '@/types/imap';

const columnHelper = createColumnHelper<DataTableFeatures, ImapAccount>();

export function createImapAccountColumns(handlers: ImapAccountActionHandlers) {
  return columnHelper.columns([
    columnHelper.accessor('name', {
      header: 'アカウント名',
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    }),
    columnHelper.accessor('user', {
      header: 'メールアドレス',
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.user}</span>,
    }),
    columnHelper.display({
      id: 'server',
      header: 'サーバー',
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.host}:{row.original.port}
        </span>
      ),
    }),
    columnHelper.accessor('secure', {
      header: '接続方式',
      cell: ({ row }) =>
        row.original.secure ? <Badge variant="secondary">SSL/TLS</Badge> : <Badge variant="outline">暗号化なし</Badge>,
    }),
    columnHelper.display({
      id: 'actions',
      header: () => <span className="sr-only">操作</span>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <ImapAccountActionsMenu account={row.original} handlers={handlers} />
        </div>
      ),
    }),
  ]);
}
