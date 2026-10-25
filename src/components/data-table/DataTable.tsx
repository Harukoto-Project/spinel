import type { KeyboardEvent, ReactNode } from 'react';
import { useTable, type ColumnDef, type RowData } from '@tanstack/react-table';
import { DataTableSkeletonRows } from '@/components/data-table/DataTableSkeletonRows';
import { ContextMenu, ContextMenuTrigger } from '@/components/ui/context-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { features, type DataTableFeatures } from './dataTableFeatures';

type DataTableProps<TData extends RowData> = {
  columns: ColumnDef<DataTableFeatures, TData>[];
  data: TData[];
  emptyMessage?: string;
  loading?: boolean;
  loadingRowCount?: number;
  renderRowContextMenu?: (data: TData) => ReactNode;
  onRowClick?: (data: TData) => void;
};

export function DataTable<TData extends RowData>({
  columns,
  data,
  emptyMessage = 'データがありません',
  loading = false,
  loadingRowCount = 4,
  renderRowContextMenu,
  onRowClick,
}: DataTableProps<TData>) {
  const table = useTable({
    features,
    data,
    columns,
  });

  return (
    <div className="overflow-hidden rounded-md border bg-card">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody aria-busy={loading}>
          {loading ? (
            <DataTableSkeletonRows columnCount={columns.length} rowCount={loadingRowCount} />
          ) : table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => {
              const cells = row.getAllCells().map((cell) => (
                <TableCell key={cell.id}>
                  <table.FlexRender cell={cell} />
                </TableCell>
              ));

              const clickProps = onRowClick
                ? {
                    tabIndex: 0,
                    onClick: () => onRowClick(row.original),
                    onKeyDown: (event: KeyboardEvent<HTMLTableRowElement>) => {
                      if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
                        event.preventDefault();
                        onRowClick(row.original);
                      }
                    },
                  }
                : {};

              if (!renderRowContextMenu) {
                return (
                  <TableRow className="cursor-pointer" key={row.id} {...clickProps}>
                    {cells}
                  </TableRow>
                );
              }

              return (
                <ContextMenu key={row.id}>
                  <ContextMenuTrigger asChild>
                    <TableRow className="cursor-pointer select-none" {...clickProps}>
                      {cells}
                    </TableRow>
                  </ContextMenuTrigger>
                  {renderRowContextMenu(row.original)}
                </ContextMenu>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
