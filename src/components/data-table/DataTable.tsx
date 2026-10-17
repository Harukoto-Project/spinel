import type { ReactNode } from 'react';
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
};

export function DataTable<TData extends RowData>({
  columns,
  data,
  emptyMessage = 'データがありません',
  loading = false,
  loadingRowCount = 4,
  renderRowContextMenu,
}: DataTableProps<TData>) {
  const table = useTable({
    features,
    data,
    columns,
  });

  return (
    <div className="overflow-hidden rounded-md border">
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

              if (!renderRowContextMenu) {
                return <TableRow key={row.id}>{cells}</TableRow>;
              }

              return (
                <ContextMenu key={row.id}>
                  <ContextMenuTrigger asChild>
                    <TableRow>{cells}</TableRow>
                  </ContextMenuTrigger>
                  {renderRowContextMenu(row.original)}
                </ContextMenu>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
