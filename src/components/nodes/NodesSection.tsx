import { useMemo, useState } from 'react';
import { PageSection } from '@/components/common/PageSection';
import { DataTable } from '@/components/data-table/DataTable';
import { AddNodeButton } from '@/components/nodes/AddNodeButton';
import { AddNodeDialog } from '@/components/nodes/AddNodeDialog';
import { DeleteNodeDialog } from '@/components/nodes/DeleteNodeDialog';
import { NodeContextMenuContent } from '@/components/nodes/NodeContextMenuContent';
import { NodeDetailsDialog } from '@/components/nodes/NodeDetailsDialog';
import { NodesEmptyState } from '@/components/nodes/NodesEmptyState';
import type { NodeActionHandlers } from '@/components/nodes/nodeActions';
import { createNodeColumns } from '@/components/nodes/nodeColumns';
import { filterNodes } from '@/components/nodes/nodeSearch';
import { usePageSearch } from '@/contexts/PageSearchContext';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import type { NewNodeInput, NodeInfo } from '@/types/node';

const SEARCH_DEBOUNCE_MS = 300;

type NodesSectionProps = {
  nodes: NodeInfo[];
  loading?: boolean;
  error?: string | null;
  onAddNode: (input: NewNodeInput) => Promise<void>;
  onRemoveNode: (id: string) => void;
};

export function NodesSection({ nodes, loading = false, error = null, onAddNode, onRemoveNode }: NodesSectionProps) {
  const { query } = usePageSearch();
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
  const searching = query !== debouncedQuery;

  const [addOpen, setAddOpen] = useState(false);
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handlers = useMemo<NodeActionHandlers>(
    () => ({
      onShowDetails: (node) => setDetailsId(node.id),
      onDelete: (node) => setDeleteId(node.id),
    }),
    [],
  );
  const columns = useMemo(() => createNodeColumns(handlers), [handlers]);

  const filteredNodes = useMemo(() => filterNodes(nodes, debouncedQuery), [nodes, debouncedQuery]);

  const detailsNode = nodes.find((node) => node.id === detailsId) ?? null;
  const deleteNode = nodes.find((node) => node.id === deleteId) ?? null;

  const openAdd = () => setAddOpen(true);

  return (
    <PageSection title="ノード" action={nodes.length > 0 ? <AddNodeButton onClick={openAdd} /> : undefined}>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {nodes.length === 0 ? (
        <NodesEmptyState onAddNode={openAdd} />
      ) : (
        <DataTable
          columns={columns}
          data={filteredNodes}
          loading={searching || loading}
          emptyMessage="一致するノードがありません"
          renderRowContextMenu={(node) => <NodeContextMenuContent node={node} handlers={handlers} />}
        />
      )}
      <AddNodeDialog open={addOpen} onOpenChange={setAddOpen} onAddNode={onAddNode} />
      <NodeDetailsDialog node={detailsNode} onOpenChange={(open) => !open && setDetailsId(null)} />
      <DeleteNodeDialog
        node={deleteNode}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={(node) => {
          onRemoveNode(node.id);
          setDeleteId(null);
        }}
      />
    </PageSection>
  );
}
