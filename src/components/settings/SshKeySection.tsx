import { NodeRequiredNotice } from '@/components/nodes/NodeRequiredNotice';
import { NodeSelect } from '@/components/nodes/NodeSelect';
import { SshKeyNodeCard } from '@/components/ssh-key/SshKeyNodeCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useNodesContext } from '@/contexts/NodesContext';
import { useSelectedNode } from '@/hooks/use-selected-node';

export function SshKeySection() {
  const { nodes, loaded } = useNodesContext();
  const { selectedNode, setSelectedId } = useSelectedNode(nodes);

  return (
    <section className="flex max-w-3xl flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">SSH 公開鍵(ノード)</h2>
        {!loaded ? (
          <Skeleton className="h-9 w-full sm:w-64" />
        ) : (
          selectedNode && <NodeSelect nodes={nodes} value={selectedNode.id} onValueChange={setSelectedId} />
        )}
      </div>
      {!loaded ? (
        <Skeleton className="h-48 w-full" />
      ) : selectedNode ? (
        <SshKeyNodeCard key={selectedNode.id} nodeId={selectedNode.id} />
      ) : (
        <NodeRequiredNotice />
      )}
    </section>
  );
}
