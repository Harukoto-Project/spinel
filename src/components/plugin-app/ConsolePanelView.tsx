import { useState } from 'react';
import { PanelCard } from '@/components/plugin-app/PanelCard';
import { TASK_STATUS_LABELS } from '@/components/plugin-app/statusLabels';
import { TaskLogViewer } from '@/components/plugin-app/TaskLogViewer';
import { ToneBadge } from '@/components/plugin-app/ToneBadge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePluginAppContext } from '@/contexts/PluginAppContext';
import type { ConsolePanel } from '@/types/pluginApp';

type ConsolePanelViewProps = {
  panel: ConsolePanel;
};

export function ConsolePanelView({ panel }: ConsolePanelViewProps) {
  const { app, overview } = usePluginAppContext();
  const commands = panel.commands.flatMap((id) => app.commands.filter((command) => command.id === id));

  const runningId = commands.find((command) =>
    overview.tasks.some((task) => task.commandId === command.id && task.status === 'running'),
  )?.id;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const currentId = selectedId ?? runningId ?? commands[0]?.id;

  if (currentId === undefined) return null;

  const status = overview.tasks.find((task) => task.commandId === currentId)?.status ?? 'idle';
  const statusLabel = TASK_STATUS_LABELS[status];

  return (
    <PanelCard
      title={panel.title}
      description={panel.description}
      action={<ToneBadge tone={statusLabel.tone}>{statusLabel.label}</ToneBadge>}
    >
      {commands.length > 1 && (
        <Select value={currentId} onValueChange={setSelectedId}>
          <SelectTrigger className="w-full sm:w-64" aria-label="表示するコマンド">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {commands.map((command) => (
              <SelectItem key={command.id} value={command.id}>
                {command.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <TaskLogViewer key={currentId} commandId={currentId} />
    </PanelCard>
  );
}
