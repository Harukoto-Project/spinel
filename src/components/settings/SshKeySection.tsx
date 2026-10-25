import { PageSection } from '@/components/common/PageSection';
import { NodeRequiredNotice } from '@/components/nodes/NodeRequiredNotice';
import { NodeSelect } from '@/components/nodes/NodeSelect';
import { SshKeyNodeSettings } from '@/components/ssh-key/SshKeyNodeSettings';
import { Skeleton } from '@/components/ui/skeleton';
import { useNodesContext } from '@/contexts/NodesContext';
import { useSelectedNode } from '@/hooks/use-selected-node';

export function SshKeySection() {
  const { nodes, loaded } = useNodesContext();
  const { selectedNode, setSelectedId } = useSelectedNode(nodes);

  return (
    <PageSection
      title="ノードの SSH 公開鍵"
      divided
      action={
        !loaded ? (
          <Skeleton className="h-9 w-full sm:w-56" />
        ) : (
          selectedNode && <NodeSelect nodes={nodes} value={selectedNode.id} onValueChange={setSelectedId} />
        )
      }
    >
      {!loaded ? (
        <Skeleton className="h-48 w-full" />
      ) : selectedNode ? (
        <SshKeyNodeSettings key={selectedNode.id} nodeId={selectedNode.id} />
      ) : (
        <NodeRequiredNotice />
      )}
    </PageSection>
  );
}
