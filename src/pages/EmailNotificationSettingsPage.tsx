import { NodePage } from '@/components/nodes/NodePage';
import { NotificationNodeSettings } from '@/components/notifications/NotificationNodeSettings';
import { NotificationNodeSettingsSkeleton } from '@/components/notifications/NotificationNodeSettingsSkeleton';
import { useNodesContext } from '@/contexts/NodesContext';
import { useSelectedNode } from '@/hooks/use-selected-node';

export function EmailNotificationSettingsPage() {
  const { nodes, loaded } = useNodesContext();
  const { selectedNode, setSelectedId } = useSelectedNode(nodes);

  return (
    <NodePage
      title="メールの通知設定"
      nodes={nodes}
      loaded={loaded}
      selectedNode={selectedNode}
      onSelectNode={setSelectedId}
      skeleton={<NotificationNodeSettingsSkeleton />}
    >
      {(nodeId) => <NotificationNodeSettings nodeId={nodeId} />}
    </NodePage>
  );
}
