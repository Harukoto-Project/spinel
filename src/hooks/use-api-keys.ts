import { useCallback, useEffect, useState } from 'react';
import { describeError } from '@/lib/errors';
import { deleteApiKey, loadApiKeys, saveApiKey } from '@/services/apiKeyStorage';
import type { ApiKeyId, ApiKeyStatusMap } from '@/types/apiKey';

export function useApiKeys(nodeId: string) {
  const [status, setStatus] = useState<ApiKeyStatusMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadApiKeys(nodeId)
      .then((loaded) => {
        if (!cancelled) setStatus(loaded);
      })
      .catch((caught) => {
        if (!cancelled) setError(`APIキーの状態を読み込めませんでした: ${describeError(caught)}`);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [nodeId]);

  const save = useCallback(
    async (id: ApiKeyId, value: string): Promise<boolean> => {
      try {
        setStatus(await saveApiKey(nodeId, id, value));
        setError(null);
        return true;
      } catch (caught) {
        setError(`APIキーを保存できませんでした: ${describeError(caught)}`);
        return false;
      }
    },
    [nodeId],
  );

  const remove = useCallback(
    async (id: ApiKeyId): Promise<boolean> => {
      try {
        setStatus(await deleteApiKey(nodeId, id));
        setError(null);
        return true;
      } catch (caught) {
        setError(`APIキーを削除できませんでした: ${describeError(caught)}`);
        return false;
      }
    },
    [nodeId],
  );

  return { status, loading, error, save, remove };
}
