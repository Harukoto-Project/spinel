import { useCallback, useEffect, useState } from 'react';
import { describeError } from '@/lib/errors';
import { loadSshKey, regenerateSshKey } from '@/services/sshKeyStorage';
import type { SshKey } from '@/types/sshKey';

export function useSshKey(nodeId: string) {
  const [sshKey, setSshKey] = useState<SshKey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadSshKey(nodeId)
      .then((loaded) => {
        if (!cancelled) setSshKey(loaded);
      })
      .catch((caught) => {
        if (!cancelled) setError(`SSH 公開鍵を取得できませんでした: ${describeError(caught)}`);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [nodeId]);

  const regenerate = useCallback(async () => {
    setSshKey(await regenerateSshKey(nodeId));
    setError(null);
  }, [nodeId]);

  return { sshKey, loading, error, regenerate };
}
