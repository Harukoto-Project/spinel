import { useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { DataTable } from '@/components/data-table/DataTable';
import { ClearMailHistoryDialog } from '@/components/mail-history/ClearMailHistoryDialog';
import { MailHistoryContextMenuContent } from '@/components/mail-history/MailHistoryContextMenuContent';
import { MailHistoryDetailsDialog } from '@/components/mail-history/MailHistoryDetailsDialog';
import { MailHistoryFilters } from '@/components/mail-history/MailHistoryFilters';
import type { MailHistoryActionHandlers } from '@/components/mail-history/mailHistoryActions';
import { createMailHistoryColumns } from '@/components/mail-history/mailHistoryColumns';
import { buildAccountOptions, filterMailHistory } from '@/components/mail-history/mailHistorySearch';
import { Button } from '@/components/ui/button';
import { DEFAULT_MAIL_HISTORY_FILTERS } from '@/config/mailHistory';
import { usePageSearch } from '@/contexts/PageSearchContext';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useMailHistory } from '@/hooks/use-mail-history';
import type { MailHistoryFilters as Filters } from '@/types/mailHistory';

const SEARCH_DEBOUNCE_MS = 300;

type MailHistorySectionProps = {
  nodeId: string;
};

export function MailHistorySection({ nodeId }: MailHistorySectionProps) {
  const { query } = usePageSearch();
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
  const searching = query !== debouncedQuery;
  const { items, loading, error, remove, clear } = useMailHistory(nodeId);
  const [filters, setFilters] = useState<Filters>(DEFAULT_MAIL_HISTORY_FILTERS);
  const [clearOpen, setClearOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo(() => items.find((item) => item.id === selectedId) ?? null, [items, selectedId]);

  const handlers = useMemo<MailHistoryActionHandlers>(
    () => ({
      onDelete: (entry) => {
        setSelectedId((current) => (current === entry.id ? null : current));
        void remove(entry.id);
      },
    }),
    [remove],
  );
  const columns = useMemo(() => createMailHistoryColumns(), []);
  const accountOptions = useMemo(() => buildAccountOptions(items), [items]);
  const filtered = useMemo(
    () => filterMailHistory(items, debouncedQuery, filters),
    [items, debouncedQuery, filters],
  );

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <MailHistoryFilters filters={filters} accountOptions={accountOptions} onChange={setFilters} />
        <Button
          className="cursor-pointer"
          type="button"
          variant="outline"
          disabled={items.length === 0}
          onClick={() => setClearOpen(true)}
        >
          <Trash2 />
          履歴をすべて削除
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
        emptyMessage={items.length === 0 ? '履歴がありません' : '一致する履歴がありません'}
        onRowClick={(entry) => setSelectedId(entry.id)}
        renderRowContextMenu={(entry) => <MailHistoryContextMenuContent entry={entry} handlers={handlers} />}
      />
      <MailHistoryDetailsDialog
        entry={selected}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      />
      <ClearMailHistoryDialog
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
