import { createColumnHelper } from '@tanstack/react-table';
import type { DataTableFeatures } from '@/components/data-table/dataTableFeatures';
import { MailAccountActionsMenu } from '@/components/mail-accounts/MailAccountActionsMenu';
import { MailAccountStatusBadge } from '@/components/mail-accounts/MailAccountStatusBadge';
import type { MailAccountActionHandlers } from '@/components/mail-accounts/mailAccountActions';
import { formatDateTime } from '@/components/nodes/nodeFormat';
import { Badge } from '@/components/ui/badge';
import { getMailProviderLabel } from '@/config/mailProviders';
import type { MailAccount } from '@/types/mailAccount';

const columnHelper = createColumnHelper<DataTableFeatures, MailAccount>();

export function createMailAccountColumns(handlers: MailAccountActionHandlers) {
  return columnHelper.columns([
    columnHelper.accessor('name', {
      header: 'アカウント名',
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    }),
    columnHelper.accessor('email', {
      header: 'メールアドレス',
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.email}</span>,
    }),
    columnHelper.accessor('provider', {
      header: 'プロバイダー',
      cell: ({ row }) => <Badge variant="outline">{getMailProviderLabel(row.original.provider)}</Badge>,
    }),
    columnHelper.accessor('connected', {
      header: '状態',
      cell: ({ row }) => <MailAccountStatusBadge connected={row.original.connected} />,
    }),
    columnHelper.accessor('connectedAt', {
      header: '接続日時',
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatDateTime(new Date(row.original.connectedAt).toISOString())}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: () => <span className="sr-only">操作</span>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <MailAccountActionsMenu account={row.original} handlers={handlers} />
        </div>
      ),
    }),
  ]);
}
