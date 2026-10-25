import { Fragment, type ReactNode } from 'react';
import { PageBody } from '@/components/common/PageBody';
import { PageHeader } from '@/components/common/PageHeader';
import { NodeRequiredNotice } from '@/components/nodes/NodeRequiredNotice';
import { NodeSelect } from '@/components/nodes/NodeSelect';
import { PageSearch } from '@/components/search/PageSearch';
import { Skeleton } from '@/components/ui/skeleton';
import type { NodeInfo } from '@/types/node';

type NodePageProps = {
  title: string;
  nodes: NodeInfo[];
  loaded: boolean;
  selectedNode: NodeInfo | null;
  onSelectNode: (id: string) => void;
  searchable?: boolean;
  skeleton?: ReactNode;
  children: (nodeId: string) => ReactNode;
};

export function NodePage({
  title,
  nodes,
  loaded,
  selectedNode,
  onSelectNode,
  searchable = false,
  skeleton,
  children,
}: NodePageProps) {
  return (
    <>
      <PageHeader title={title}>
        {searchable ? <PageSearch /> : null}
        {!loaded ? (
          <Skeleton className="h-9 w-full sm:w-56" />
        ) : (
          selectedNode && <NodeSelect nodes={nodes} value={selectedNode.id} onValueChange={onSelectNode} />
        )}
      </PageHeader>
      <PageBody>
        {!loaded ? (
          (skeleton ?? <Skeleton className="h-48 w-full" />)
        ) : selectedNode ? (
          <Fragment key={selectedNode.id}>{children(selectedNode.id)}</Fragment>
        ) : (
          <NodeRequiredNotice />
        )}
      </PageBody>
    </>
  );
}
