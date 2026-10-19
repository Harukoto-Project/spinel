import { WidgetLabel } from '@/components/plugin-app/widgets/WidgetLabel';
import { renderTemplate, resolveRows } from '@/components/plugin-app/widgetData';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { TableWidget } from '@/types/pluginApp';

type TableWidgetViewProps = {
  widget: TableWidget;
  data: unknown;
};

export function TableWidgetView({ widget, data }: TableWidgetViewProps) {
  const rows = resolveRows(data, widget.rows);
  const visible = widget.maxRows === null ? rows : rows.slice(0, widget.maxRows);
  const hidden = rows.length - visible.length;

  return (
    <div className="flex flex-col gap-2">
      <WidgetLabel label={widget.label} />
      <Table>
        <TableHeader>
          <TableRow>
            {widget.columns.map((column) => (
              <TableHead key={column.label}>{column.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.length === 0 ? (
            <TableRow>
              <TableCell colSpan={widget.columns.length} className="text-center text-muted-foreground">
                {widget.empty ?? 'データがありません'}
              </TableCell>
            </TableRow>
          ) : (
            visible.map((row, index) => (
              <TableRow key={index}>
                {widget.columns.map((column) => (
                  <TableCell key={column.label} className="whitespace-normal break-words">
                    {renderTemplate(column.value, row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {hidden > 0 && <p className="text-xs text-muted-foreground">ほか {hidden} 件</p>}
    </div>
  );
}
