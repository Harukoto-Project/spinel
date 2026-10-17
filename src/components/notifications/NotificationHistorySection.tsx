import { useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { DataTable } from '@/components/data-table/DataTable';
import { ClearHistoryDialog } from '@/components/notifications/ClearHistoryDialog';
import { NotificationDetailsDialog } from '@/components/notifications/NotificationDetailsDialog';
import { createNotificationHistoryColumns } from '@/components/notifications/notificationHistoryColumns';
import { filterHistory } from '@/components/notifications/notificationHistorySearch';
import { Button } from '@/components/ui/button';
import { usePageSearch } from '@/contexts/PageSearchContext';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useNotificationHistory } from '@/hooks/use-notification-history';
import type { NodeInfo } from '@/types/node';

const SEARCH_DEBOUNCE_MS = 300;

type NotificationHistorySectionProps = {
  nodes: NodeInfo[];
};

export function NotificationHistorySection({ nodes }: NotificationHistorySectionProps) {
  const { query } = usePageSearch();
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
  const searching = query !== debouncedQuery;
  const { items, loading, error, clear } = useNotificationHistory();
  const [clearOpen, setClearOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo(() => items.find((item) => item.id === selectedId) ?? null, [items, selectedId]);

  const nodeNames = useMemo(() => new Map(nodes.map((node) => [node.id, node.name])), [nodes]);
  const columns = useMemo(() => createNotificationHistoryColumns(nodeNames), [nodeNames]);
  const filtered = useMemo(() => filterHistory(items, debouncedQuery, nodeNames), [items, debouncedQuery, nodeNames]);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">通知履歴</h2>
        <Button
          className="cursor-pointer"
          type="button"
          variant="outline"
          disabled={items.length === 0}
          onClick={() => setClearOpen(true)}
        >
          <Trash2 />
          履歴を削除
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <DataTable
        columns={columns}
        data={filtered}
        loading={loading || searching}
        emptyMessage={items.length === 0 ? '通知履歴がありません' : '一致する通知がありません'}
        onRowClick={(notification) => setSelectedId(notification.id)}
      />
      <NotificationDetailsDialog
        notification={selected}
        nodeName={selected ? nodeNames.get(selected.nodeId) : undefined}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      />
      <ClearHistoryDialog
        open={clearOpen}
        onOpenChange={setClearOpen}
        onConfirm={() => {
          setClearOpen(false);
          void clear();
        }}
      />
    </section>
  );
}
