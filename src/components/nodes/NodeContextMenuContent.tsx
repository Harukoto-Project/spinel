import { Fragment } from 'react';
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
} from '@/components/ui/context-menu';
import { NODE_ACTIONS, type NodeActionHandlers } from '@/components/nodes/nodeActions';
import type { NodeInfo } from '@/types/node';

type NodeContextMenuContentProps = {
  node: NodeInfo;
  handlers: NodeActionHandlers;
};

export function NodeContextMenuContent({ node, handlers }: NodeContextMenuContentProps) {
  return (
    <ContextMenuContent>
      <ContextMenuLabel>{node.name}</ContextMenuLabel>
      <ContextMenuSeparator />
      {NODE_ACTIONS.map((action) => (
        <Fragment key={action.id}>
          {action.separatorBefore && <ContextMenuSeparator />}
          <ContextMenuItem
            variant={action.destructive ? 'destructive' : 'default'}
            onSelect={() => action.onSelect(node, handlers)}
          >
            {action.label}
          </ContextMenuItem>
        </Fragment>
      ))}
    </ContextMenuContent>
  );
}
