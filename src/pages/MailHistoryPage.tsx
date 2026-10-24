import { MailHistorySection } from '@/components/mail-history/MailHistorySection';
import { NodePage } from '@/components/nodes/NodePage';
import { useNodesContext } from '@/contexts/NodesContext';
import { useSelectedNode } from '@/hooks/use-selected-node';

export function MailHistoryPage() {
  const { nodes, loaded } = useNodesContext();
  const { selectedNode, setSelectedId } = useSelectedNode(nodes);

  return (
    <NodePage
      title="通知履歴"
      nodes={nodes}
      loaded={loaded}
      selectedNode={selectedNode}
      onSelectNode={setSelectedId}
      searchable
    >
      {(nodeId) => <MailHistorySection nodeId={nodeId} />}
    </NodePage>
  );
}
