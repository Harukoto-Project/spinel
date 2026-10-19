import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { SetupStepLogs } from '@/components/plugin-app/SetupStepLogs';
import { SETUP_STEP_STATUS_LABELS } from '@/components/plugin-app/statusLabels';
import { ToneBadge } from '@/components/plugin-app/ToneBadge';
import { Button } from '@/components/ui/button';
import type { SetupStepState } from '@/types/pluginApp';

type SetupStepItemProps = {
  index: number;
  step: SetupStepState;
};

export function SetupStepItem({ index, step }: SetupStepItemProps) {
  const [open, setOpen] = useState<boolean | null>(null);

  const hasLogs = step.status === 'running' || step.status === 'failed' || step.status === 'success';
  const expanded = hasLogs && (open ?? (step.status === 'running' || step.status === 'failed'));
  const statusLabel = SETUP_STEP_STATUS_LABELS[step.status];

  return (
    <li className="flex flex-col gap-3 rounded-lg border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-sm text-muted-foreground tabular-nums">{index + 1}.</span>
          <span className="break-words text-sm font-medium">{step.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <ToneBadge tone={statusLabel.tone}>{statusLabel.label}</ToneBadge>
          {hasLogs && (
            <Button
              className="cursor-pointer"
              variant="ghost"
              size="sm"
              aria-expanded={expanded}
              onClick={() => setOpen(!expanded)}
            >
              {expanded ? <ChevronDown /> : <ChevronRight />}
              ログ
            </Button>
          )}
        </div>
      </div>
      {step.status === 'failed' && step.error && (
        <p role="alert" className="break-words text-sm text-destructive">
          {step.error}
        </p>
      )}
      {expanded && <SetupStepLogs step={step} />}
    </li>
  );
}
