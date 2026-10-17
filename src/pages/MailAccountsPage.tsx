import { PageHeader } from '@/components/layout/PageHeader';
import { MailAccountsNodeSettings } from '@/components/mail-accounts/MailAccountsNodeSettings';
import { NodeRequiredNotice } from '@/components/nodes/NodeRequiredNotice';
import { NodeSelect } from '@/components/nodes/NodeSelect';
import { Skeleton } from '@/components/ui/skeleton';
import { useNodesContext } from '@/contexts/NodesContext';
import { useSelectedNode } from '@/hooks/use-selected-node';

export function MailAccountsPage() {
  const { nodes, loaded } = useNodesContext();
  const { selectedNode, setSelectedId } = useSelectedNode(nodes);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader title="メールアカウント" />
        {!loaded ? (
          <Skeleton className="h-9 w-full sm:w-64" />
        ) : (
          selectedNode && <NodeSelect nodes={nodes} value={selectedNode.id} onValueChange={setSelectedId} />
        )}
      </div>
      {!loaded ? (
        <Skeleton className="h-48 w-full" />
      ) : selectedNode ? (
        <MailAccountsNodeSettings key={selectedNode.id} nodeId={selectedNode.id} />
      ) : (
        <NodeRequiredNotice />
      )}
    </div>
  );
}
