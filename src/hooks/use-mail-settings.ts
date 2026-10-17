import { useCallback, useEffect, useState } from 'react';
import { describeError } from '@/lib/errors';
import { loadMailSettings, saveMailSettings } from '@/services/mailAccountStorage';
import type { MailSettings } from '@/types/mailAccount';

export function useMailSettings(nodeId: string) {
  const [settings, setSettings] = useState<MailSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadMailSettings(nodeId)
      .then((loaded) => {
        if (!cancelled) setSettings(loaded);
      })
      .catch((caught) => {
        if (!cancelled) setError(`メールの設定を読み込めませんでした: ${describeError(caught)}`);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [nodeId]);

  const save = useCallback(
    async (next: MailSettings) => {
      setSettings(await saveMailSettings(nodeId, next));
    },
    [nodeId],
  );

  return { settings, loading, error, save };
}
