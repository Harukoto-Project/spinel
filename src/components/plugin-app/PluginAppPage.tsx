import { PluginAppSkeleton } from '@/components/plugin-app/PluginAppSkeleton';
import { PluginAppTabs } from '@/components/plugin-app/PluginAppTabs';
import { Button } from '@/components/ui/button';
import { PluginAppProvider } from '@/contexts/PluginAppContext';
import { useActiveNode } from '@/contexts/ActiveNodeContext';
import { usePluginApp } from '@/hooks/use-plugin-app';

type PluginAppPageProps = {
  pluginId: string;
};

type PluginAppLoaderProps = PluginAppPageProps & {
  nodeId: string;
};

function Notice({ children }: { children: string }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}

function PluginAppLoader({ nodeId, pluginId }: PluginAppLoaderProps) {
  const { plugin, overview, loading, error, overviewError, refresh, saveSettings } = usePluginApp(nodeId, pluginId);

  if (loading) return <PluginAppSkeleton />;

  if (error !== null || plugin === null) {
    return (
      <p role="alert" className="break-words text-sm text-destructive">
        {error ?? 'プラグインが見つかりません'}
      </p>
    );
  }

  if (!plugin.enabled) return <Notice>プラグインが無効です。「プラグインの管理」で有効にしてください。</Notice>;

  if (plugin.status === 'error' || plugin.app === null) {
    return (
      <div className="flex flex-col gap-2">
        <p role="alert" className="break-words text-sm text-destructive">
          {plugin.errorMessage ?? 'プラグインを読み込めませんでした'}
        </p>
        <Notice>原因を解消したあと、「プラグインの管理」で無効にしてから、もう一度有効にしてください。</Notice>
      </div>
    );
  }

  if (overview === null) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p role="alert" className="break-words text-sm text-destructive">
          状態を取得できませんでした: {overviewError}
        </p>
        <Button className="cursor-pointer" variant="outline" onClick={refresh}>
          再取得
        </Button>
      </div>
    );
  }

  return (
    <PluginAppProvider
      nodeId={nodeId}
      plugin={plugin}
      app={plugin.app}
      overview={overview}
      refresh={refresh}
      saveSettings={saveSettings}
    >
      <div className="flex flex-col gap-4">
        {overviewError !== null && (
          <p role="alert" className="break-words text-xs text-destructive">
            最新の状態を取得できませんでした: {overviewError}
          </p>
        )}
        <PluginAppTabs />
      </div>
    </PluginAppProvider>
  );
}

export function PluginAppPage({ pluginId }: PluginAppPageProps) {
  const { activeNode } = useActiveNode();
  if (activeNode === null) return null;

  return <PluginAppLoader key={`${activeNode.id}:${pluginId}`} nodeId={activeNode.id} pluginId={pluginId} />;
}
