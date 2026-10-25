import { NotificationConnectionForm } from '@/components/notifications/NotificationConnectionForm';
import { NotificationNodeSettingsSkeleton } from '@/components/notifications/NotificationNodeSettingsSkeleton';
import { NotificationSettingsForm } from '@/components/notifications/NotificationSettingsForm';
import { NotificationTestSection } from '@/components/notifications/NotificationTestSection';
import { useNotificationConfig } from '@/hooks/use-notification-config';
import { useNotificationConnection } from '@/hooks/use-notification-connection';

type NotificationNodeSettingsProps = {
  nodeId: string;
};

export function NotificationNodeSettings({ nodeId }: NotificationNodeSettingsProps) {
  const { config, loading, error, saveSettings, saveAdminKey, deleteAdminKey } = useNotificationConfig(nodeId);
  const { status, loading: statusLoading } = useNotificationConnection(nodeId);

  return (
    <>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {loading ? (
        <NotificationNodeSettingsSkeleton />
      ) : (
        config && (
          <>
            <NotificationConnectionForm
              status={status}
              statusLoading={statusLoading}
              adminKeySet={config.adminKeySet}
              onSaveKey={saveAdminKey}
              onDeleteKey={deleteAdminKey}
            />
            <NotificationSettingsForm settings={config.settings} onSave={saveSettings} />
            <NotificationTestSection nodeId={nodeId} connected={status?.state === 'connected'} />
          </>
        )
      )}
    </>
  );
}
