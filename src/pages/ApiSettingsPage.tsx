import { ApiKeysNodeSettings } from '@/components/api-keys/ApiKeysNodeSettings';
import { NodePage } from '@/components/nodes/NodePage';
import { useNodesContext } from '@/contexts/NodesContext';
import { useSelectedNode } from '@/hooks/use-selected-node';

export function ApiSettingsPage() {
  const { nodes, loaded } = useNodesContext();
  const { selectedNode, setSelectedId } = useSelectedNode(nodes);

  return (
    <NodePage
      title="APIキーの設定"
      nodes={nodes}
      loaded={loaded}
      selectedNode={selectedNode}
      onSelectNode={setSelectedId}
    >
      {(nodeId) => <ApiKeysNodeSettings nodeId={nodeId} />}
    </NodePage>
  );
}
