import { useCallback } from 'react';
import { LogViewer } from '@/components/plugin-app/LogViewer';
import { usePluginAppContext } from '@/contexts/PluginAppContext';
import { useLogStream } from '@/hooks/use-log-stream';
import { readPluginAppCommandLogs } from '@/services/pluginApp';

type TaskLogViewerProps = {
  commandId: string;
};

export function TaskLogViewer({ commandId }: TaskLogViewerProps) {
  const { nodeId, plugin, overview } = usePluginAppContext();
  const task = overview.tasks.find((item) => item.commandId === commandId);

  const read = useCallback(
    async (after: number) => (await readPluginAppCommandLogs(nodeId, plugin.id, commandId, after)).logs,
    [nodeId, plugin.id, commandId],
  );

  const { entries, loading, error } = useLogStream(read, task?.status === 'running', task?.startedAt ?? null);

  return <LogViewer entries={entries} loading={loading} error={error} emptyText="実行するとログがここに表示されます" />;
}
