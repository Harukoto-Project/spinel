import { createColumnHelper } from '@tanstack/react-table';
import type { DataTableFeatures } from '@/components/data-table/dataTableFeatures';
import { MailAccountActionsMenu } from '@/components/mail-accounts/MailAccountActionsMenu';
import { MailAccountStatusLabel } from '@/components/mail-accounts/MailAccountStatusLabel';
import type { MailAccountActionHandlers } from '@/components/mail-accounts/mailAccountActions';
import { EMPTY_VALUE, formatDateTime } from '@/components/nodes/nodeFormat';
import { getMailProviderLabel } from '@/config/mailProviders';
import type { MailAccount } from '@/types/mailAccount';

const columnHelper = createColumnHelper<DataTableFeatures, MailAccount>();

export function createMailAccountColumns(handlers: MailAccountActionHandlers) {
  return columnHelper.columns([
    columnHelper.accessor('name', {
      header: 'アカウント名',
      cell: ({ row }) => <span className="font-medium text-foreground">{row.original.name}</span>,
    }),
    columnHelper.accessor('email', {
      header: 'メールアドレス',
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.email}</span>,
    }),
    columnHelper.accessor('provider', {
      header: 'プロバイダー',
      cell: ({ row }) => <span className="text-muted-foreground">{getMailProviderLabel(row.original.provider)}</span>,
    }),
    columnHelper.accessor('connected', {
      header: '状態',
      cell: ({ row }) => (
        <div className="flex flex-col items-start gap-1">
          <MailAccountStatusLabel connected={row.original.connected} />
          {row.original.lastError && (
            <span className="max-w-72 truncate text-xs text-destructive" title={row.original.lastError}>
              {row.original.lastError}
            </span>
          )}
        </div>
      ),
    }),
    columnHelper.accessor('connectedAt', {
      header: '接続日時',
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatDateTime(new Date(row.original.connectedAt).toISOString())}
        </span>
      ),
    }),
    columnHelper.accessor('lastCheckedAt', {
      header: '最終確認',
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.lastCheckedAt === null
            ? EMPTY_VALUE
            : formatDateTime(new Date(row.original.lastCheckedAt).toISOString())}
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
