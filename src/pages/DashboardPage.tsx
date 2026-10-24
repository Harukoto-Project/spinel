import { PageBody } from '@/components/common/PageBody';
import { PageHeader } from '@/components/common/PageHeader';
import { NodesSection } from '@/components/nodes/NodesSection';
import { PageSearch } from '@/components/search/PageSearch';
import { useNodesContext } from '@/contexts/NodesContext';

export function DashboardPage() {
  const { nodes, loading, error, addNode, removeNode } = useNodesContext();

  return (
    <>
      <PageHeader title="ダッシュボード">
        <PageSearch />
      </PageHeader>
      <PageBody>
        <NodesSection nodes={nodes} loading={loading} error={error} onAddNode={addNode} onRemoveNode={removeNode} />
      </PageBody>
    </>
  );
}
