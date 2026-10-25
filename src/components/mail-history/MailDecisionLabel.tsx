import { Bell, BellOff } from 'lucide-react';
import { StatusLabel } from '@/components/common/StatusLabel';
import { DECISION_LABELS } from '@/config/mailHistory';
import type { MailDecision } from '@/types/mailHistory';

type MailDecisionLabelProps = {
  decision: MailDecision;
};

export function MailDecisionLabel({ decision }: MailDecisionLabelProps) {
  return decision === 'notify' ? (
    <StatusLabel icon={Bell} className="font-medium text-foreground">
      {DECISION_LABELS[decision]}
    </StatusLabel>
  ) : (
    <StatusLabel icon={BellOff}>{DECISION_LABELS[decision]}</StatusLabel>
  );
}
