import { useCallback, useMemo, useRef, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { DataTable } from '@/components/data-table/DataTable';
import { AddRepositoryButton } from '@/components/plugins/AddRepositoryButton';
import { AddRepositoryDialog } from '@/components/plugins/AddRepositoryDialog';
import { DeleteRepositoryDialog } from '@/components/plugins/DeleteRepositoryDialog';
import { RepositoryContextMenuContent } from '@/components/plugins/RepositoryContextMenuContent';
import type { RepositoryActionHandlers } from '@/components/plugins/repositoryActions';
import { createRepositoryColumns } from '@/components/plugins/repositoryColumns';
import type { PluginRepository } from '@/types/plugin';

type PluginRepositoriesSectionProps = {
  repositories: PluginRepository[];
  totalCount: number;
  loading?: boolean;
  onAddRepository: (url: string) => Promise<void>;
  onRefreshRepository: (repoId: string) => Promise<void>;
  onDeleteRepository: (repoId: string) => Promise<void>;
};

export function PluginRepositoriesSection({
  repositories,
  totalCount,
  loading = false,
  onAddRepository,
  onRefreshRepository,
  onDeleteRepository,
}: PluginRepositoriesSectionProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const busyRef = useRef(false);

  const runExclusive = useCallback(async (message: string, task: () => Promise<void>) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setPendingMessage(message);
    try {
      await task();
    } finally {
      busyRef.current = false;
      setPendingMessage(null);
    }
  }, []);

  const handlers = useMemo<RepositoryActionHandlers>(
    () => ({
      onRefresh: (repository) =>
        void runExclusive(`「${repository.name}」の最新を取得しています…`, () => onRefreshRepository(repository.id)),
      onDelete: (repository) => setDeleteId(repository.id),
    }),
    [onRefreshRepository, runExclusive],
  );
  const columns = useMemo(() => createRepositoryColumns(handlers), [handlers]);

  const deleteRepository = repositories.find((repository) => repository.id === deleteId) ?? null;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">リポジトリ</h2>
        <AddRepositoryButton onClick={() => setAddOpen(true)} />
      </div>
      {pendingMessage && (
        <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" />
          {pendingMessage}
        </p>
      )}
      <DataTable
        columns={columns}
        data={repositories}
        loading={loading}
        emptyMessage={totalCount === 0 ? 'リポジトリがありません。追加するとプラグインが使えるようになります' : '一致するリポジトリがありません'}
        renderRowContextMenu={(repository) => <RepositoryContextMenuContent repository={repository} handlers={handlers} />}
      />
      <AddRepositoryDialog open={addOpen} onOpenChange={setAddOpen} onAddRepository={onAddRepository} />
      <DeleteRepositoryDialog
        repository={deleteRepository}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={(repository) => {
          setDeleteId(null);
          void runExclusive(`「${repository.name}」を削除しています…`, () => onDeleteRepository(repository.id));
        }}
      />
    </section>
  );
}
