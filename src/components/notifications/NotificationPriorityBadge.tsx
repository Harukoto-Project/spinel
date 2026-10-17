import { Badge } from '@/components/ui/badge';
import { PRIORITY_LABELS } from '@/config/notifications';
import type { NotificationPriority } from '@/types/notification';

type NotificationPriorityBadgeProps = {
  priority: NotificationPriority;
};

export function NotificationPriorityBadge({ priority }: NotificationPriorityBadgeProps) {
  return <Badge variant={priority === 'urgent' ? 'destructive' : 'secondary'}>{PRIORITY_LABELS[priority]}</Badge>;
}
