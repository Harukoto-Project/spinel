import { ToneBadge } from '@/components/plugin-app/ToneBadge';
import { WidgetLabel } from '@/components/plugin-app/widgets/WidgetLabel';
import { readText } from '@/components/plugin-app/widgetData';
import type { BadgeWidget } from '@/types/pluginApp';

type BadgeWidgetViewProps = {
  widget: BadgeWidget;
  data: unknown;
};

export function BadgeWidgetView({ widget, data }: BadgeWidgetViewProps) {
  const raw = readText(data, widget.value);
  const text = raw === null ? '—' : (widget.labels[raw] ?? raw);
  const tone = raw === null ? 'neutral' : (widget.tones[raw] ?? 'neutral');

  return (
    <div className="flex flex-col items-start gap-1">
      <WidgetLabel label={widget.label} />
      <ToneBadge tone={tone}>{text}</ToneBadge>
    </div>
  );
}
