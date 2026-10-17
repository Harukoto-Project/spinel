import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { NodeStatus } from '@/types/node';

const STATUS_CONFIG: Record<NodeStatus, { label: string; dotClass: string }> = {
  online: { label: 'オンライン', dotClass: 'bg-emerald-500' },
  offline: { label: 'オフライン', dotClass: 'bg-muted-foreground' },
  error: { label: 'エラー', dotClass: 'bg-destructive' },
};

type NodeStatusBadgeProps = {
  status: NodeStatus;
};

export function NodeStatusBadge({ status }: NodeStatusBadgeProps) {
  const { label, dotClass } = STATUS_CONFIG[status];

  return (
    <Badge variant="outline" className="gap-1.5">
      <span className={cn('size-1.5 rounded-full', dotClass)} />
      {label}
    </Badge>
  );
}
