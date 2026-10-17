import { PageHeader } from '@/components/layout/PageHeader';
import { NodesSection } from '@/components/nodes/NodesSection';
import { useNodesContext } from '@/contexts/NodesContext';

export function DashboardPage() {
  const { nodes, loading, error, addNode, removeNode } = useNodesContext();

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <PageHeader title="Dashboard" />
      <NodesSection nodes={nodes} loading={loading} error={error} onAddNode={addNode} onRemoveNode={removeNode} />
    </div>
  );
}
