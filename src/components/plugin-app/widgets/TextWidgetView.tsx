import { WidgetLabel } from '@/components/plugin-app/widgets/WidgetLabel';
import { renderTemplate } from '@/components/plugin-app/widgetData';
import type { TextWidget } from '@/types/pluginApp';

type TextWidgetViewProps = {
  widget: TextWidget;
  data: unknown;
};

export function TextWidgetView({ widget, data }: TextWidgetViewProps) {
  return (
    <div className="flex flex-col gap-1">
      <WidgetLabel label={widget.label} />
      <p className="whitespace-pre-wrap break-words text-sm">{renderTemplate(widget.value, data)}</p>
    </div>
  );
}
