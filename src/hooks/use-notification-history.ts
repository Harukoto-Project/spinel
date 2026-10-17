import { useCallback, useEffect, useState } from 'react';
import { NOTIFICATION_HISTORY_LIMIT } from '@/config/notifications';
import { describeError } from '@/lib/errors';
import { listenNotificationReceived } from '@/services/notificationEvents';
import { clearNotificationHistory, loadNotificationHistory } from '@/services/notificationStorage';
import type { ReceivedNotification } from '@/types/notification';

function mergeHistory(primary: ReceivedNotification[], secondary: ReceivedNotification[]): ReceivedNotification[] {
  const seen = new Set<string>();
  return [...primary, ...secondary]
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .sort((a, b) => b.receivedAt - a.receivedAt)
    .slice(0, NOTIFICATION_HISTORY_LIMIT);
}

export function useNotificationHistory() {
  const [items, setItems] = useState<ReceivedNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let unlisten: (() => void) | undefined;

    listenNotificationReceived((received) => setItems((current) => mergeHistory([received], current))).then((fn) => {
      if (cancelled) fn();
      else unlisten = fn;
    });

    loadNotificationHistory()
      .then((loaded) => {
        if (!cancelled) setItems((current) => mergeHistory(current, loaded));
      })
      .catch((caught) => {
        if (!cancelled) setError(`通知履歴を読み込めませんでした: ${describeError(caught)}`);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      unlisten?.();
    };
  }, []);

  const clear = useCallback(async () => {
    try {
      await clearNotificationHistory();
      setItems([]);
      setError(null);
    } catch (caught) {
      setError(`通知履歴を削除できませんでした: ${describeError(caught)}`);
    }
  }, []);

  return { items, loading, error, clear };
}
