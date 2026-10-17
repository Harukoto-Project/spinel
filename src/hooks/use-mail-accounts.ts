import { useCallback, useEffect, useState } from 'react';
import { describeError } from '@/lib/errors';
import { connectMailAccount, deleteMailAccount, loadMailAccounts } from '@/services/mailAccountStorage';
import type { MailAccount, MailProviderId } from '@/types/mailAccount';

export function useMailAccounts(nodeId: string) {
  const [accounts, setAccounts] = useState<MailAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadMailAccounts(nodeId)
      .then((loaded) => {
        if (!cancelled) setAccounts(loaded);
      })
      .catch((caught) => {
        if (!cancelled) setError(`メールアカウントを読み込めませんでした: ${describeError(caught)}`);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [nodeId]);

  const connect = useCallback(
    async (provider: MailProviderId) => {
      setAccounts(await connectMailAccount(nodeId, provider));
      setError(null);
    },
    [nodeId],
  );

  const deleteAccount = useCallback(
    async (accountId: string) => {
      try {
        setAccounts(await deleteMailAccount(nodeId, accountId));
        setError(null);
      } catch (caught) {
        setError(`アカウントを削除できませんでした: ${describeError(caught)}`);
      }
    },
    [nodeId],
  );

  return { accounts, loading, error, connect, deleteAccount };
}
