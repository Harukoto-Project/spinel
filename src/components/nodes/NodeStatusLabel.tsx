import { CircleCheck, CircleOff, type LucideIcon } from 'lucide-react';
import { StatusLabel } from '@/components/common/StatusLabel';
import type { StatusTone } from '@/config/statusTones';
import type { NodeStatus } from '@/types/node';

const STATUS_CONFIG: Record<NodeStatus, { label: string; tone: StatusTone; icon?: LucideIcon }> = {
  online: { label: 'オンライン', tone: 'normal', icon: CircleCheck },
  offline: { label: 'オフライン', tone: 'normal', icon: CircleOff },
  error: { label: 'エラー', tone: 'critical' },
};

type NodeStatusLabelProps = {
  status: NodeStatus;
};

export function NodeStatusLabel({ status }: NodeStatusLabelProps) {
  const { label, tone, icon } = STATUS_CONFIG[status];

  return (
    <StatusLabel tone={tone} icon={icon}>
      {label}
    </StatusLabel>
  );
}
