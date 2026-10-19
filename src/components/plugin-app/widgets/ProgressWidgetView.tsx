import { WidgetLabel } from '@/components/plugin-app/widgets/WidgetLabel';
import { formatPercent } from '@/components/plugin-app/format';
import { readPercent, renderTemplate } from '@/components/plugin-app/widgetData';
import { Progress } from '@/components/ui/progress';
import type { ProgressWidget } from '@/types/pluginApp';

type ProgressWidgetViewProps = {
  widget: ProgressWidget;
  data: unknown;
};

export function ProgressWidgetView({ widget, data }: ProgressWidgetViewProps) {
  const percent = readPercent(data, widget.value);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <WidgetLabel label={widget.label} />
        <span className="text-sm font-medium tabular-nums">{percent === null ? '—' : formatPercent(percent)}</span>
      </div>
      <Progress value={percent ?? 0} />
      {widget.detail !== null && (
        <p className="break-words text-xs text-muted-foreground">{renderTemplate(widget.detail, data)}</p>
      )}
    </div>
  );
}
