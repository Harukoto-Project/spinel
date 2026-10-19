import { useCallback } from 'react';
import { LogViewer } from '@/components/plugin-app/LogViewer';
import { usePluginAppContext } from '@/contexts/PluginAppContext';
import { useLogStream } from '@/hooks/use-log-stream';
import { readPluginAppSetupLogs } from '@/services/pluginApp';
import type { SetupStepState } from '@/types/pluginApp';

type SetupStepLogsProps = {
  step: SetupStepState;
};

export function SetupStepLogs({ step }: SetupStepLogsProps) {
  const { nodeId, plugin } = usePluginAppContext();

  const read = useCallback(
    (after: number) => readPluginAppSetupLogs(nodeId, plugin.id, step.id, after),
    [nodeId, plugin.id, step.id],
  );

  const { entries, loading, error } = useLogStream(read, step.status === 'running', step.startedAt);

  return (
    <LogViewer
      entries={entries}
      loading={loading}
      error={error}
      emptyText="この手順のログはありません(再起動すると消えます)"
      className="h-48 md:h-56"
    />
  );
}
