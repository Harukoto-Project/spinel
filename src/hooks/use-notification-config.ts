import { useCallback, useEffect, useState } from 'react';
import { describeError } from '@/lib/errors';
import {
  deleteNodeAdminKey,
  loadNotificationConfig,
  saveNotificationSettings,
  setNodeAdminKey,
} from '@/services/notificationStorage';
import type { NotificationConfig, NotificationSettings } from '@/types/notification';

export function useNotificationConfig(nodeId: string) {
  const [config, setConfig] = useState<NotificationConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadNotificationConfig(nodeId)
      .then((loaded) => {
        if (!cancelled) setConfig(loaded);
      })
      .catch((caught) => {
        if (!cancelled) setError(`通知設定を読み込めませんでした: ${describeError(caught)}`);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [nodeId]);

  const saveSettings = useCallback(
    async (settings: NotificationSettings) => {
      setConfig(await saveNotificationSettings(nodeId, settings));
      setError(null);
    },
    [nodeId],
  );

  const saveAdminKey = useCallback(
    async (adminKey: string) => {
      setConfig(await setNodeAdminKey(nodeId, adminKey));
      setError(null);
    },
    [nodeId],
  );

  const deleteAdminKey = useCallback(async () => {
    setConfig(await deleteNodeAdminKey(nodeId));
    setError(null);
  }, [nodeId]);

  return { config, loading, error, saveSettings, saveAdminKey, deleteAdminKey };
}
