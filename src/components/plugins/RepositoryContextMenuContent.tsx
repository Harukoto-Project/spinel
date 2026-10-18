import { Fragment } from 'react';
import { REPOSITORY_ACTIONS, type RepositoryActionHandlers } from '@/components/plugins/repositoryActions';
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
} from '@/components/ui/context-menu';
import type { PluginRepository } from '@/types/plugin';

type RepositoryContextMenuContentProps = {
  repository: PluginRepository;
  handlers: RepositoryActionHandlers;
};

export function RepositoryContextMenuContent({ repository, handlers }: RepositoryContextMenuContentProps) {
  return (
    <ContextMenuContent>
      <ContextMenuLabel>{repository.name}</ContextMenuLabel>
      <ContextMenuSeparator />
      {REPOSITORY_ACTIONS.map((action) => (
        <Fragment key={action.id}>
          {action.separatorBefore && <ContextMenuSeparator />}
          <ContextMenuItem
            variant={action.destructive ? 'destructive' : 'default'}
            onSelect={() => action.onSelect(repository, handlers)}
          >
            {action.label}
          </ContextMenuItem>
        </Fragment>
      ))}
    </ContextMenuContent>
  );
}
