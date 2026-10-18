import { PageHeader } from '@/components/layout/PageHeader';
import { NodeSelect } from '@/components/nodes/NodeSelect';
import { PluginErrorBoundary } from '@/components/plugins/PluginErrorBoundary';
import { useActiveNode } from '@/contexts/ActiveNodeContext';
import { useNodesContext } from '@/contexts/NodesContext';
import type { RegisteredPluginPage } from '@/plugins/registeredPage';

type PluginPageFrameProps = {
  page: RegisteredPluginPage;
};

export function PluginPageFrame({ page }: PluginPageFrameProps) {
  const { nodes } = useNodesContext();
  const { activeNode, setActiveNodeId } = useActiveNode();
  const PageComponent = page.component;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader title={page.label} />
        {activeNode && <NodeSelect nodes={nodes} value={activeNode.id} onValueChange={setActiveNodeId} />}
      </div>
      <PluginErrorBoundary key={`${activeNode?.id ?? ''}:${page.navId}`} pluginName={page.pluginName}>
        <PageComponent />
      </PluginErrorBoundary>
    </div>
  );
}
