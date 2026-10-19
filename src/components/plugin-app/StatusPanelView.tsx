import { LoaderCircle, RefreshCw } from 'lucide-react';
import { formatClock } from '@/components/plugin-app/format';
import { PanelCard } from '@/components/plugin-app/PanelCard';
import { WidgetView } from '@/components/plugin-app/widgets/WidgetView';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { usePluginAppContext } from '@/contexts/PluginAppContext';
import { usePanelQuery } from '@/hooks/use-panel-query';
import { cn } from '@/lib/utils';
import type { StatusPanel } from '@/types/pluginApp';

type StatusPanelViewProps = {
  panel: StatusPanel;
};

export function StatusPanelView({ panel }: StatusPanelViewProps) {
  const { nodeId, plugin, setupReady } = usePluginAppContext();
  const { data, refreshing, error, updatedAt, refresh } = usePanelQuery(
    nodeId,
    plugin.id,
    panel.query,
    panel.intervalSec,
    setupReady,
  );

  const waiting = data === undefined && error === null;

  return (
    <PanelCard
      title={panel.title}
      description={panel.description}
      action={
        <Button
          className="cursor-pointer"
          variant="outline"
          size="sm"
          disabled={!setupReady || refreshing}
          onClick={() => void refresh()}
        >
          {refreshing ? <LoaderCircle className="animate-spin" /> : <RefreshCw />}
          更新
        </Button>
      }
    >
      {!setupReady ? (
        <p className="text-sm text-muted-foreground">セットアップが完了すると表示されます</p>
      ) : waiting ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : (
        <>
          {data !== undefined && (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] gap-4">
              {panel.widgets.map((widget, index) => (
                <div
                  key={index}
                  className={cn('min-w-0', (widget.type === 'progress' || widget.type === 'table') && 'col-span-full')}
                >
                  <WidgetView widget={widget} data={data} />
                </div>
              ))}
            </div>
          )}
          {error && (
            <p role="alert" className="break-words text-sm text-destructive">
              情報を取得できませんでした: {error}
            </p>
          )}
          {updatedAt !== null && <p className="text-xs text-muted-foreground">最終更新 {formatClock(updatedAt)}</p>}
        </>
      )}
    </PanelCard>
  );
}
