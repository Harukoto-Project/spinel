import { PageBody } from '@/components/common/PageBody';
import { PageHeader } from '@/components/common/PageHeader';
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
    <>
      <PageHeader title={page.label}>
        {activeNode && <NodeSelect nodes={nodes} value={activeNode.id} onValueChange={setActiveNodeId} />}
      </PageHeader>
      <PageBody>
        <PluginErrorBoundary key={`${activeNode?.id ?? ''}:${page.navId}`} pluginName={page.pluginName}>
          <PageComponent />
        </PluginErrorBoundary>
      </PageBody>
    </>
  );
}
