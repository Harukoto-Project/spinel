import { useState } from 'react';
import { LoaderCircle, RotateCw } from 'lucide-react';
import { PanelCard } from '@/components/plugin-app/PanelCard';
import { SetupStepItem } from '@/components/plugin-app/SetupStepItem';
import { SETUP_STATUS_LABELS } from '@/components/plugin-app/statusLabels';
import { SourceCard } from '@/components/plugin-app/SourceCard';
import { ToneLabel } from '@/components/plugin-app/ToneLabel';
import { Button } from '@/components/ui/button';
import { usePluginAppContext } from '@/contexts/PluginAppContext';
import { describeError } from '@/lib/errors';
import { runPluginAppSetup, updatePluginAppSource } from '@/services/pluginApp';

export function SetupTab() {
  const { nodeId, plugin, app, overview, refresh } = usePluginAppContext();
  const [pending, setPending] = useState<'source' | 'setup' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const taskRunning = overview.tasks.some((task) => task.status === 'running');
  const setupRunning = overview.setup.status === 'running';
  const busy = taskRunning || setupRunning || pending !== null;
  const statusLabel = SETUP_STATUS_LABELS[overview.setup.status];

  const execute = async (kind: 'source' | 'setup') => {
    setPending(kind);
    setError(null);
    try {
      if (kind === 'source') await updatePluginAppSource(nodeId, plugin.id);
      else await runPluginAppSetup(nodeId, plugin.id);
      refresh();
    } catch (caught) {
      setError(describeError(caught));
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {app.source !== null && (
        <SourceCard
          source={app.source}
          busy={busy}
          updating={pending === 'source'}
          onUpdate={() => void execute('source')}
        />
      )}
      {overview.setup.steps.length > 0 && (
        <PanelCard
          title="セットアップ"
          description="初回に実行する準備の手順です。完了するとコマンドを実行できます。"
          action={
            <div className="flex flex-wrap items-center justify-end gap-2">
              <ToneLabel tone={statusLabel.tone}>{statusLabel.label}</ToneLabel>
              <Button
                className="cursor-pointer"
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => void execute('setup')}
              >
                {pending === 'setup' ? <LoaderCircle className="animate-spin" /> : <RotateCw />}
                再実行
              </Button>
            </div>
          }
        >
          <ol className="flex flex-col divide-y divide-border">
            {overview.setup.steps.map((step, index) => (
              <SetupStepItem key={step.id} index={index} step={step} />
            ))}
          </ol>
        </PanelCard>
      )}
      {error && (
        <p role="alert" className="break-words text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
