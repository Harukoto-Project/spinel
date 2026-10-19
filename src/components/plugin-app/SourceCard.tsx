import { LoaderCircle, RefreshCw } from 'lucide-react';
import { formatDateTime } from '@/components/plugin-app/format';
import { PanelCard } from '@/components/plugin-app/PanelCard';
import { Button } from '@/components/ui/button';
import { usePluginAppContext } from '@/contexts/PluginAppContext';
import type { PluginAppSource } from '@/types/pluginApp';

type SourceCardProps = {
  source: PluginAppSource;
  busy: boolean;
  updating: boolean;
  onUpdate: () => void;
};

export function SourceCard({ source, busy, updating, onUpdate }: SourceCardProps) {
  const { overview } = usePluginAppContext();
  const state = overview.source;

  return (
    <PanelCard
      title="ソース"
      description="GitHub から取得したソースです。更新は手動で行います。"
      action={
        <Button className="cursor-pointer" variant="outline" size="sm" disabled={busy || updating} onClick={onUpdate}>
          {updating ? <LoaderCircle className="animate-spin" /> : <RefreshCw />}
          ソース更新
        </Button>
      }
    >
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        <dt className="text-muted-foreground">リポジトリ</dt>
        <dd className="break-all">{source.repo}</dd>
        <dt className="text-muted-foreground">ブランチ</dt>
        <dd>{source.ref ?? '既定のブランチ'}</dd>
        {state === null || !state.present ? (
          <>
            <dt className="text-muted-foreground">状態</dt>
            <dd>未取得</dd>
          </>
        ) : (
          <>
            <dt className="text-muted-foreground">取得方式</dt>
            <dd>{state.transport === 'ssh' ? 'SSH' : 'HTTPS'}</dd>
            <dt className="text-muted-foreground">コミット</dt>
            <dd className="font-mono">{state.installedSha.slice(0, 7)}</dd>
            <dt className="text-muted-foreground">取得日時</dt>
            <dd>{formatDateTime(state.updatedAt)}</dd>
          </>
        )}
      </dl>
    </PanelCard>
  );
}
