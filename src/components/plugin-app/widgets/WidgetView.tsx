import { BadgeWidgetView } from '@/components/plugin-app/widgets/BadgeWidgetView';
import { ProgressWidgetView } from '@/components/plugin-app/widgets/ProgressWidgetView';
import { StatWidgetView } from '@/components/plugin-app/widgets/StatWidgetView';
import { TableWidgetView } from '@/components/plugin-app/widgets/TableWidgetView';
import { TextWidgetView } from '@/components/plugin-app/widgets/TextWidgetView';
import type { PluginWidget } from '@/types/pluginApp';

type WidgetViewProps = {
  widget: PluginWidget;
  data: unknown;
};

export function WidgetView({ widget, data }: WidgetViewProps) {
  switch (widget.type) {
    case 'progress':
      return <ProgressWidgetView widget={widget} data={data} />;
    case 'stat':
      return <StatWidgetView widget={widget} data={data} />;
    case 'text':
      return <TextWidgetView widget={widget} data={data} />;
    case 'badge':
      return <BadgeWidgetView widget={widget} data={data} />;
    case 'table':
      return <TableWidgetView widget={widget} data={data} />;
  }
}
