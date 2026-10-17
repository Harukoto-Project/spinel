import { Badge } from '@/components/ui/badge';
import { CONNECTION_STATE_CONFIG } from '@/config/notifications';
import { cn } from '@/lib/utils';
import type { ConnectionState } from '@/types/notification';

type NotificationConnectionBadgeProps = {
  state: ConnectionState;
};

export function NotificationConnectionBadge({ state }: NotificationConnectionBadgeProps) {
  const { label, dotClass } = CONNECTION_STATE_CONFIG[state];

  return (
    <Badge variant="outline" className="gap-1.5">
      <span className={cn('size-1.5 rounded-full', dotClass)} />
      {label}
    </Badge>
  );
}
