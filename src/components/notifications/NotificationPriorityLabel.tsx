import { StatusLabel } from '@/components/common/StatusLabel';
import { PRIORITY_LABELS } from '@/config/notifications';
import type { NotificationPriority } from '@/types/notification';

type NotificationPriorityLabelProps = {
  priority: NotificationPriority;
};

export function NotificationPriorityLabel({ priority }: NotificationPriorityLabelProps) {
  return <StatusLabel tone={priority === 'urgent' ? 'critical' : 'normal'}>{PRIORITY_LABELS[priority]}</StatusLabel>;
}
