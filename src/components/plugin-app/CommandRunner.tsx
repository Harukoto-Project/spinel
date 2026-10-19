import { useState } from 'react';
import { LoaderCircle, Play, Square } from 'lucide-react';
import { CommandInputField } from '@/components/plugin-app/CommandInputField';
import {
  buildInputValues,
  createInputDraft,
  isInputDraftValid,
  type InputDraft,
} from '@/components/plugin-app/commandInputDraft';
import { formatClock } from '@/components/plugin-app/format';
import { TASK_STATUS_LABELS } from '@/components/plugin-app/statusLabels';
import { ToneBadge } from '@/components/plugin-app/ToneBadge';
import { Button } from '@/components/ui/button';
import { usePluginAppContext } from '@/contexts/PluginAppContext';
import { describeError } from '@/lib/errors';
import { runPluginAppCommand, stopPluginAppCommand } from '@/services/pluginApp';
import type { PluginAppCommand } from '@/types/pluginApp';

type CommandRunnerProps = {
  command: PluginAppCommand;
};

export function CommandRunner({ command }: CommandRunnerProps) {
  const { nodeId, plugin, overview, setupReady, refresh } = usePluginAppContext();
  const [draft, setDraft] = useState<InputDraft>(() => createInputDraft(command.inputs));
  const [pending, setPending] = useState<'run' | 'stop' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const task = overview.tasks.find((item) => item.commandId === command.id);
  const status = task?.status ?? 'idle';
  const running = status === 'running';
  const valid = isInputDraftValid(command.inputs, draft);
  const statusLabel = TASK_STATUS_LABELS[status];

  const handleRun = async () => {
    setPending('run');
    setError(null);
    try {
      await runPluginAppCommand(nodeId, plugin.id, command.id, buildInputValues(command.inputs, draft));
      refresh();
    } catch (caught) {
      setError(describeError(caught));
    } finally {
      setPending(null);
    }
  };

  const handleStop = async () => {
    setPending('stop');
    setError(null);
    try {
      await stopPluginAppCommand(nodeId, plugin.id, command.id);
      refresh();
    } catch (caught) {
      setError(describeError(caught));
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-lg border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-1">
          <h4 className="break-words text-sm font-medium">{command.label}</h4>
          {command.description && <p className="text-sm text-muted-foreground">{command.description}</p>}
        </div>
        <ToneBadge tone={statusLabel.tone}>{statusLabel.label}</ToneBadge>
      </div>

      {command.inputs.length > 0 && (
        <div className="flex flex-col gap-4">
          {command.inputs.map((input) => (
            <CommandInputField
              key={input.key}
              input={input}
              value={draft[input.key] ?? ''}
              disabled={running || pending !== null}
              onValueChange={(value) => setDraft((current) => ({ ...current, [input.key]: value }))}
            />
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {running ? (
          <Button
            className="cursor-pointer"
            variant="destructive"
            disabled={pending !== null}
            onClick={() => void handleStop()}
          >
            {pending === 'stop' ? <LoaderCircle className="animate-spin" /> : <Square />}
            停止
          </Button>
        ) : (
          <Button
            className="cursor-pointer"
            disabled={!setupReady || !valid || pending !== null}
            onClick={() => void handleRun()}
          >
            {pending === 'run' ? <LoaderCircle className="animate-spin" /> : <Play />}
            実行
          </Button>
        )}
        {!setupReady && <span className="text-xs text-muted-foreground">セットアップが完了すると実行できます</span>}
        {setupReady && task !== undefined && task.startedAt !== null && (
          <span className="text-xs text-muted-foreground">
            開始 {formatClock(task.startedAt)}
            {task.finishedAt !== null && ` / 終了 ${formatClock(task.finishedAt)}`}
            {task.exitCode !== null && ` / 終了コード ${task.exitCode}`}
          </span>
        )}
      </div>

      {error && (
        <p role="alert" className="break-words text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
