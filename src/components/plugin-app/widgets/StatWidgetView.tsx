import { WidgetLabel } from '@/components/plugin-app/widgets/WidgetLabel';
import { renderTemplate } from '@/components/plugin-app/widgetData';
import type { StatWidget } from '@/types/pluginApp';

type StatWidgetViewProps = {
  widget: StatWidget;
  data: unknown;
};

export function StatWidgetView({ widget, data }: StatWidgetViewProps) {
  return (
    <div className="flex flex-col gap-1">
      <WidgetLabel label={widget.label} />
      <p className="break-words text-2xl font-semibold tabular-nums">{renderTemplate(widget.value, data)}</p>
    </div>
  );
}
