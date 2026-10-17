import { useEffect, useState } from 'react';
import { listenConnectionChanged } from '@/services/notificationEvents';
import { getNotificationConnections } from '@/services/notificationStorage';
import type { ConnectionStatus } from '@/types/notification';

export function useNotificationConnection(nodeId: string) {
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let unlisten: (() => void) | undefined;

    listenConnectionChanged((next) => {
      if (next.nodeId === nodeId) setStatus(next);
    }).then((fn) => {
      if (cancelled) fn();
      else unlisten = fn;
    });

    getNotificationConnections()
      .then((all) => {
        if (cancelled) return;
        const found = all.find((item) => item.nodeId === nodeId) ?? null;
        setStatus((current) => (current && (!found || current.updatedAt >= found.updatedAt) ? current : found));
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      unlisten?.();
    };
  }, [nodeId]);

  return { status, loading };
}
