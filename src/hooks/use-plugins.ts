import { useCallback, useEffect, useState } from 'react';
import { describeError } from '@/lib/errors';
import {
  addPluginRepository,
  deletePluginRepository,
  disablePlugin,
  enablePlugin,
  loadPluginRepositories,
  loadPlugins,
  refreshPluginRepository,
  savePluginSettings,
} from '@/services/pluginStorage';
import type { Plugin, PluginPermissions, PluginRepository, PluginSettingsUpdate } from '@/types/plugin';

export function usePlugins(nodeId: string, onChanged?: () => void) {
  const [repositories, setRepositories] = useState<PluginRepository[]>([]);
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([loadPluginRepositories(nodeId), loadPlugins(nodeId)])
      .then(([loadedRepositories, loadedPlugins]) => {
        if (cancelled) return;
        setRepositories(loadedRepositories);
        setPlugins(loadedPlugins);
      })
      .catch((caught) => {
        if (!cancelled) setError(`プラグインを読み込めませんでした: ${describeError(caught)}`);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [nodeId]);

  const syncPlugins = useCallback(async () => {
    try {
      setPlugins(await loadPlugins(nodeId));
    } catch (caught) {
      setError(`プラグインの一覧を更新できませんでした: ${describeError(caught)}`);
    }
  }, [nodeId]);

  const addRepository = useCallback(
    async (url: string) => {
      setRepositories(await addPluginRepository(nodeId, url));
      setError(null);
      await syncPlugins();
      onChanged?.();
    },
    [nodeId, syncPlugins, onChanged],
  );

  const refreshRepository = useCallback(
    async (repoId: string) => {
      try {
        setRepositories(await refreshPluginRepository(nodeId, repoId));
        setError(null);
        await syncPlugins();
        onChanged?.();
      } catch (caught) {
        setError(`リポジトリを更新できませんでした: ${describeError(caught)}`);
      }
    },
    [nodeId, syncPlugins, onChanged],
  );

  const deleteRepository = useCallback(
    async (repoId: string) => {
      try {
        setRepositories(await deletePluginRepository(nodeId, repoId));
        setError(null);
        await syncPlugins();
        onChanged?.();
      } catch (caught) {
        setError(`リポジトリを削除できませんでした: ${describeError(caught)}`);
      }
    },
    [nodeId, syncPlugins, onChanged],
  );

  const enable = useCallback(
    async (pluginId: string, grantedPermissions: PluginPermissions) => {
      setPlugins(await enablePlugin(nodeId, pluginId, grantedPermissions));
      setError(null);
      onChanged?.();
    },
    [nodeId, onChanged],
  );

  const disable = useCallback(
    async (pluginId: string) => {
      try {
        setPlugins(await disablePlugin(nodeId, pluginId));
        setError(null);
        onChanged?.();
      } catch (caught) {
        setError(`プラグインを無効にできませんでした: ${describeError(caught)}`);
      }
    },
    [nodeId, onChanged],
  );

  const saveSettings = useCallback(
    async (pluginId: string, values: PluginSettingsUpdate) => {
      setPlugins(await savePluginSettings(nodeId, pluginId, values));
      setError(null);
    },
    [nodeId],
  );

  return {
    repositories,
    plugins,
    loading,
    error,
    addRepository,
    refreshRepository,
    deleteRepository,
    enable,
    disable,
    saveSettings,
  };
}
