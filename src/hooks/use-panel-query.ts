import { useCallback, useEffect, useRef, useState } from 'react';
import { describeError } from '@/lib/errors';
import { queryPluginAppCommand } from '@/services/pluginApp';

export function usePanelQuery(
  nodeId: string,
  pluginId: string,
  commandId: string,
  intervalSec: number,
  enabled: boolean,
) {
  const [data, setData] = useState<unknown>(undefined);
  const [loading, setLoading] = useState(enabled);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const inflightRef = useRef(false);
  const loadedRef = useRef(false);

  const fetchOnce = useCallback(async (): Promise<void> => {
    if (inflightRef.current) return;
    inflightRef.current = true;
    setRefreshing(true);
    try {
      const result = await queryPluginAppCommand(nodeId, pluginId, commandId);
      setData(result.data);
      loadedRef.current = true;
      setUpdatedAt(Date.now());
      setError(null);
    } catch (caught) {
      setError(describeError(caught));
    } finally {
      inflightRef.current = false;
      setRefreshing(false);
      setLoading(false);
    }
  }, [nodeId, pluginId, commandId]);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const loop = async () => {
      if (!document.hidden || !loadedRef.current) await fetchOnce();
      if (!cancelled && intervalSec > 0) timer = setTimeout(() => void loop(), intervalSec * 1000);
    };

    void loop();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [enabled, fetchOnce, intervalSec]);

  return { data, loading, refreshing, error, updatedAt, refresh: fetchOnce };
}
