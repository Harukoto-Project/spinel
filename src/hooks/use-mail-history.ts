import { useCallback, useEffect, useState } from 'react';
import { describeError } from '@/lib/errors';
import { clearMailHistory, deleteMailHistory, loadMailHistory } from '@/services/mailHistoryStorage';
import type { MailHistoryEntry } from '@/types/mailHistory';

export function useMailHistory(nodeId: string) {
  const [items, setItems] = useState<MailHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadMailHistory(nodeId)
      .then((loaded) => {
        if (!cancelled) setItems(loaded);
      })
      .catch((caught) => {
        if (!cancelled) setError(`履歴を読み込めませんでした: ${describeError(caught)}`);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [nodeId]);

  const remove = useCallback(
    async (entryId: string) => {
      try {
        setItems(await deleteMailHistory(nodeId, entryId));
        setError(null);
      } catch (caught) {
        setError(`履歴を削除できませんでした: ${describeError(caught)}`);
      }
    },
    [nodeId],
  );

  const clear = useCallback(async () => {
    try {
      setItems(await clearMailHistory(nodeId));
      setError(null);
    } catch (caught) {
      setError(`履歴を削除できませんでした: ${describeError(caught)}`);
    }
  }, [nodeId]);

  return { items, loading, error, remove, clear };
}
