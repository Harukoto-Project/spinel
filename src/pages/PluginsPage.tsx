import { NodePage } from '@/components/nodes/NodePage';
import { PluginsNodeSettings } from '@/components/plugins/PluginsNodeSettings';
import { useActiveNode } from '@/contexts/ActiveNodeContext';
import { useNodesContext } from '@/contexts/NodesContext';

export function PluginsPage() {
  const { nodes, loaded } = useNodesContext();
  const { activeNode, setActiveNodeId } = useActiveNode();

  return (
    <NodePage
      title="プラグインの管理"
      nodes={nodes}
      loaded={loaded}
      selectedNode={activeNode}
      onSelectNode={setActiveNodeId}
      searchable
    >
      {(nodeId) => <PluginsNodeSettings nodeId={nodeId} />}
    </NodePage>
  );
}
