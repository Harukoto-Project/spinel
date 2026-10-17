import { NotificationConnectionCard } from '@/components/notifications/NotificationConnectionCard';
import { NotificationNodeSettingsSkeleton } from '@/components/notifications/NotificationNodeSettingsSkeleton';
import { NotificationSettingsCard } from '@/components/notifications/NotificationSettingsCard';
import { NotificationTestCard } from '@/components/notifications/NotificationTestCard';
import { useNotificationConfig } from '@/hooks/use-notification-config';
import { useNotificationConnection } from '@/hooks/use-notification-connection';

type NotificationNodeSettingsProps = {
  nodeId: string;
};

export function NotificationNodeSettings({ nodeId }: NotificationNodeSettingsProps) {
  const { config, loading, error, saveSettings, saveAdminKey, deleteAdminKey } = useNotificationConfig(nodeId);
  const { status, loading: statusLoading } = useNotificationConnection(nodeId);

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {loading ? (
        <NotificationNodeSettingsSkeleton />
      ) : (
        config && (
          <div className="grid gap-4 xl:grid-cols-2">
            <NotificationConnectionCard
              status={status}
              statusLoading={statusLoading}
              adminKeySet={config.adminKeySet}
              onSaveKey={saveAdminKey}
              onDeleteKey={deleteAdminKey}
            />
            <NotificationSettingsCard settings={config.settings} onSave={saveSettings} />
            <div className="xl:col-span-2">
              <NotificationTestCard nodeId={nodeId} connected={status?.state === 'connected'} />
            </div>
          </div>
        )
      )}
    </div>
  );
}
