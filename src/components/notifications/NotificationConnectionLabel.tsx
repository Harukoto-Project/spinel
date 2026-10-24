import { StatusLabel } from '@/components/common/StatusLabel';
import { CONNECTION_STATE_CONFIG } from '@/config/notifications';
import type { ConnectionState } from '@/types/notification';

type NotificationConnectionLabelProps = {
  state: ConnectionState;
};

export function NotificationConnectionLabel({ state }: NotificationConnectionLabelProps) {
  const { label, tone, icon } = CONNECTION_STATE_CONFIG[state];

  return (
    <StatusLabel tone={tone} icon={icon}>
      {label}
    </StatusLabel>
  );
}
