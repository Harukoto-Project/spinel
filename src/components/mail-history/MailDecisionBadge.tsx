import { Badge } from '@/components/ui/badge';
import { DECISION_LABELS } from '@/config/mailHistory';
import type { MailDecision } from '@/types/mailHistory';

type MailDecisionBadgeProps = {
  decision: MailDecision;
};

export function MailDecisionBadge({ decision }: MailDecisionBadgeProps) {
  return <Badge variant={decision === 'notify' ? 'default' : 'outline'}>{DECISION_LABELS[decision]}</Badge>;
}
