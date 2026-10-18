import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useActiveNode } from '@/contexts/ActiveNodeContext';
import { useNodesContext } from '@/contexts/NodesContext';
import { describeError } from '@/lib/errors';
import { loadFrontPlugin, type LoadedFrontPlugin } from '@/plugins/loadFrontPlugin';
import type { RegisteredPluginPage } from '@/plugins/registeredPage';
import { loadPlugins } from '@/services/pluginStorage';

type PluginPagesStatus = 'loading' | 'ready';

type PluginPagesState = {
  status: PluginPagesStatus;
  pages: RegisteredPluginPage[];
  errors: Record<string, string>;
};

type PluginPagesContextValue = PluginPagesState & {
  reload: () => void;
};

const LOADING_STATE: PluginPagesState = { status: 'loading', pages: [], errors: {} };
const EMPTY_STATE: PluginPagesState = { status: 'ready', pages: [], errors: {} };

const PluginPagesContext = createContext<PluginPagesContextValue | null>(null);

export function PluginPagesProvider({ children }: { children: ReactNode }) {
  const { loaded } = useNodesContext();
  const { activeNode } = useActiveNode();
  const nodeId = activeNode?.id ?? null;
  const online = activeNode?.status === 'online';

  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState<PluginPagesState>(LOADING_STATE);
  const loadFailedRef = useRef(false);
  const wasOnlineRef = useRef(online);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    if (!loaded) {
      setState(LOADING_STATE);
      return;
    }
    if (nodeId === null) {
      setState(EMPTY_STATE);
      return;
    }

    let cancelled = false;
    const loadedPlugins: LoadedFrontPlugin[] = [];
    loadFailedRef.current = false;
    setState(LOADING_STATE);

    const run = async () => {
      let plugins;
      try {
        plugins = await loadPlugins(nodeId);
      } catch {
        loadFailedRef.current = true;
        if (!cancelled) setState(EMPTY_STATE);
        return;
      }

      const pages: RegisteredPluginPage[] = [];
      const errors: Record<string, string> = {};
      for (const plugin of plugins) {
        if (cancelled) return;
        if (!plugin.enabled || !plugin.hasFront) continue;
        try {
          const result = await loadFrontPlugin(nodeId, plugin);
          if (cancelled) {
            await result.dispose();
            return;
          }
          loadedPlugins.push(result);
          pages.push(...result.pages);
        } catch (caught) {
          errors[plugin.id] = describeError(caught);
        }
      }
      if (!cancelled) setState({ status: 'ready', pages, errors });
    };

    void run();

    return () => {
      cancelled = true;
      for (const plugin of loadedPlugins) void plugin.dispose();
    };
  }, [loaded, nodeId, reloadKey]);

  useEffect(() => {
    if (online && !wasOnlineRef.current && loadFailedRef.current) reload();
    wasOnlineRef.current = online;
  }, [online, reload]);

  const value = useMemo(() => ({ ...state, reload }), [state, reload]);

  return <PluginPagesContext.Provider value={value}>{children}</PluginPagesContext.Provider>;
}

export function usePluginPages(): PluginPagesContextValue {
  const value = useContext(PluginPagesContext);
  if (!value) {
    throw new Error('usePluginPages は PluginPagesProvider の内側で使用してください');
  }
  return value;
}
