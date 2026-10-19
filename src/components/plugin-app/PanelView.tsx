import { ActionsPanelView } from '@/components/plugin-app/ActionsPanelView';
import { ConsolePanelView } from '@/components/plugin-app/ConsolePanelView';
import { StatusPanelView } from '@/components/plugin-app/StatusPanelView';
import type { PluginPanel } from '@/types/pluginApp';

type PanelViewProps = {
  panel: PluginPanel;
};

export function PanelView({ panel }: PanelViewProps) {
  switch (panel.type) {
    case 'actions':
      return <ActionsPanelView panel={panel} />;
    case 'console':
      return <ConsolePanelView panel={panel} />;
    case 'status':
      return <StatusPanelView panel={panel} />;
  }
}
