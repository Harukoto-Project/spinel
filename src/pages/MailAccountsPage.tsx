import { MailAccountsNodeSettings } from '@/components/mail-accounts/MailAccountsNodeSettings';
import { NodePage } from '@/components/nodes/NodePage';
import { useNodesContext } from '@/contexts/NodesContext';
import { useSelectedNode } from '@/hooks/use-selected-node';

export function MailAccountsPage() {
  const { nodes, loaded } = useNodesContext();
  const { selectedNode, setSelectedId } = useSelectedNode(nodes);

  return (
    <NodePage
      title="メールアカウント"
      nodes={nodes}
      loaded={loaded}
      selectedNode={selectedNode}
      onSelectNode={setSelectedId}
    >
      {(nodeId) => <MailAccountsNodeSettings nodeId={nodeId} />}
    </NodePage>
  );
}
