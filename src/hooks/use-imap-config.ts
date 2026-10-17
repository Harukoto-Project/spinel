import { useCallback, useEffect, useState } from 'react';
import { describeError } from '@/lib/errors';
import { deleteImapAccount, loadImapConfig, saveImapAccount, saveImapSettings } from '@/services/imapStorage';
import type { ImapAccountInput, ImapConfig, ImapSettings } from '@/types/imap';

export function useImapConfig(nodeId: string) {
  const [config, setConfig] = useState<ImapConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadImapConfig(nodeId)
      .then((loaded) => {
        if (!cancelled) setConfig(loaded);
      })
      .catch((caught) => {
        if (!cancelled) setError(`IMAP設定を読み込めませんでした: ${describeError(caught)}`);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [nodeId]);

  const saveAccount = useCallback(
    async (input: ImapAccountInput) => {
      setConfig(await saveImapAccount(nodeId, input));
      setError(null);
    },
    [nodeId],
  );

  const deleteAccount = useCallback(
    async (accountId: string) => {
      try {
        setConfig(await deleteImapAccount(nodeId, accountId));
        setError(null);
      } catch (caught) {
        setError(`アカウントを削除できませんでした: ${describeError(caught)}`);
      }
    },
    [nodeId],
  );

  const saveSettings = useCallback(
    async (settings: ImapSettings) => {
      setConfig(await saveImapSettings(nodeId, settings));
      setError(null);
    },
    [nodeId],
  );

  return { config, loading, error, saveAccount, deleteAccount, saveSettings };
}
