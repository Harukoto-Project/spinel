import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { Plugin, PluginSettingsUpdate } from '@/types/plugin';
import type { PluginAppOverview, PluginAppView } from '@/types/pluginApp';

type PluginAppContextValue = {
  nodeId: string;
  plugin: Plugin;
  app: PluginAppView;
  overview: PluginAppOverview;
  setupReady: boolean;
  refresh: () => void;
  saveSettings: (values: PluginSettingsUpdate) => Promise<Plugin>;
};

const PluginAppContext = createContext<PluginAppContextValue | null>(null);

type PluginAppProviderProps = Omit<PluginAppContextValue, 'setupReady'> & {
  children: ReactNode;
};

export function PluginAppProvider({
  nodeId,
  plugin,
  app,
  overview,
  refresh,
  saveSettings,
  children,
}: PluginAppProviderProps) {
  const value = useMemo(
    () => ({
      nodeId,
      plugin,
      app,
      overview,
      setupReady: overview.setup.status === 'success',
      refresh,
      saveSettings,
    }),
    [nodeId, plugin, app, overview, refresh, saveSettings],
  );

  return <PluginAppContext.Provider value={value}>{children}</PluginAppContext.Provider>;
}

export function usePluginAppContext(): PluginAppContextValue {
  const value = useContext(PluginAppContext);
  if (!value) {
    throw new Error('usePluginAppContext は PluginAppProvider の内側で使用してください');
  }
  return value;
}
