import { Skeleton } from '@/components/ui/skeleton';
import { TableCell, TableRow } from '@/components/ui/table';

type DataTableSkeletonRowsProps = {
  columnCount: number;
  rowCount: number;
};

export function DataTableSkeletonRows({ columnCount, rowCount }: DataTableSkeletonRowsProps) {
  return Array.from({ length: rowCount }, (_, rowIndex) => (
    <TableRow key={rowIndex} aria-hidden="true">
      {Array.from({ length: columnCount }, (_, columnIndex) => (
        <TableCell key={columnIndex}>
          <Skeleton className="h-4 w-full max-w-32" />
        </TableCell>
      ))}
    </TableRow>
  ));
}
