import { useCallback, useEffect, useRef, useState } from 'react';
import { describeError } from '@/lib/errors';
import { loadPluginApp } from '@/services/pluginApp';
import { loadPlugins, savePluginSettings } from '@/services/pluginStorage';
import type { Plugin, PluginSettingsUpdate } from '@/types/plugin';
import type { PluginAppOverview } from '@/types/pluginApp';

const IDLE_INTERVAL_MS = 3000;
const BUSY_INTERVAL_MS = 1000;

function isBusy(overview: PluginAppOverview | null): boolean {
  if (overview === null) return false;
  return overview.setup.status === 'running' || overview.tasks.some((task) => task.status === 'running');
}

export function usePluginApp(nodeId: string, pluginId: string) {
  const [plugin, setPlugin] = useState<Plugin | null>(null);
  const [overview, setOverview] = useState<PluginAppOverview | null>(null);
  const [pluginLoading, setPluginLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);
  const overviewRef = useRef<PluginAppOverview | null>(null);

  const active = plugin !== null && plugin.enabled && plugin.status === 'active' && plugin.hasApp;

  useEffect(() => {
    let cancelled = false;

    loadPlugins(nodeId)
      .then((plugins) => {
        if (cancelled) return;
        const found = plugins.find((item) => item.id === pluginId) ?? null;
        setPlugin(found);
        setError(found === null ? 'プラグインが見つかりません' : null);
      })
      .catch((caught) => {
        if (!cancelled) setError(`プラグインを読み込めませんでした: ${describeError(caught)}`);
      })
      .finally(() => {
        if (!cancelled) setPluginLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [nodeId, pluginId]);

  useEffect(() => {
    if (!active) {
      overviewRef.current = null;
      setOverview(null);
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const tick = async () => {
      if (!document.hidden || overviewRef.current === null) {
        try {
          const next = await loadPluginApp(nodeId, pluginId);
          if (cancelled) return;
          overviewRef.current = next;
          setOverview(next);
          setOverviewError(null);
        } catch (caught) {
          if (cancelled) return;
          setOverviewError(describeError(caught));
        }
      }
      if (cancelled) return;
      const delay = isBusy(overviewRef.current) ? BUSY_INTERVAL_MS : IDLE_INTERVAL_MS;
      timer = setTimeout(() => void tick(), delay);
    };

    void tick();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [active, nodeId, pluginId, refreshTick]);

  const refresh = useCallback(() => setRefreshTick((tick) => tick + 1), []);

  const saveSettings = useCallback(
    async (values: PluginSettingsUpdate): Promise<Plugin> => {
      const plugins = await savePluginSettings(nodeId, pluginId, values);
      const updated = plugins.find((item) => item.id === pluginId);
      if (!updated) throw new Error('プラグインが見つかりません');
      setPlugin(updated);
      return updated;
    },
    [nodeId, pluginId],
  );

  const loading = pluginLoading || (active && overview === null && overviewError === null);

  return { plugin, overview, loading, error, overviewError, refresh, saveSettings };
}
