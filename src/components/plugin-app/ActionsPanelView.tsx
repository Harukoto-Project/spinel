import { CommandRunner } from '@/components/plugin-app/CommandRunner';
import { PanelCard } from '@/components/plugin-app/PanelCard';
import { PanelSettingsForm } from '@/components/plugin-app/PanelSettingsForm';
import { usePluginAppContext } from '@/contexts/PluginAppContext';
import type { ActionsPanel } from '@/types/pluginApp';

type ActionsPanelViewProps = {
  panel: ActionsPanel;
};

export function ActionsPanelView({ panel }: ActionsPanelViewProps) {
  const { app } = usePluginAppContext();
  const commands = panel.commands.flatMap((id) => app.commands.filter((command) => command.id === id));

  return (
    <PanelCard title={panel.title} description={panel.description}>
      {panel.settings.length > 0 && <PanelSettingsForm keys={panel.settings} />}
      {commands.map((command) => (
        <CommandRunner key={command.id} command={command} />
      ))}
    </PanelCard>
  );
}
