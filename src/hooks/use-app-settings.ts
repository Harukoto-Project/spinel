import { useCallback, useEffect, useState } from 'react';
import { describeError } from '@/lib/errors';
import { loadAppSettings, saveAppSettings } from '@/services/appSettingsStorage';
import type { AppSettings } from '@/types/appSettings';

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadAppSettings()
      .then((loaded) => {
        if (!cancelled) setSettings(loaded);
      })
      .catch((caught) => {
        if (!cancelled) setError(`設定を読み込めませんでした: ${describeError(caught)}`);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const save = useCallback(async (next: AppSettings) => {
    setSettings(await saveAppSettings(next));
  }, []);

  return { settings, loading, error, save };
}
