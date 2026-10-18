import { createColumnHelper } from '@tanstack/react-table';
import type { DataTableFeatures } from '@/components/data-table/dataTableFeatures';
import { formatDateTime } from '@/components/nodes/nodeFormat';
import { RepositoryActionsMenu } from '@/components/plugins/RepositoryActionsMenu';
import type { RepositoryActionHandlers } from '@/components/plugins/repositoryActions';
import { Badge } from '@/components/ui/badge';
import type { PluginRepository } from '@/types/plugin';

const SHORT_SHA_LENGTH = 7;

const columnHelper = createColumnHelper<DataTableFeatures, PluginRepository>();

export function createRepositoryColumns(handlers: RepositoryActionHandlers) {
  return columnHelper.columns([
    columnHelper.accessor('name', {
      header: 'リポジトリ名',
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    }),
    columnHelper.accessor('url', {
      header: 'URL',
      cell: ({ row }) => (
        <span className="block max-w-72 truncate text-muted-foreground" title={row.original.url}>
          {row.original.url}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'plugins',
      header: 'プラグイン',
      cell: ({ row }) => <Badge variant="outline">{row.original.plugins.length} 件</Badge>,
    }),
    columnHelper.accessor('installedSha', {
      header: 'コミット',
      cell: ({ row }) => (
        <code className="text-xs text-muted-foreground">{row.original.installedSha.slice(0, SHORT_SHA_LENGTH)}</code>
      ),
    }),
    columnHelper.accessor('updatedAt', {
      header: '更新日時',
      cell: ({ row }) => (
        <span className="text-muted-foreground">{formatDateTime(new Date(row.original.updatedAt).toISOString())}</span>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: () => <span className="sr-only">操作</span>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <RepositoryActionsMenu repository={row.original} handlers={handlers} />
        </div>
      ),
    }),
  ]);
}
