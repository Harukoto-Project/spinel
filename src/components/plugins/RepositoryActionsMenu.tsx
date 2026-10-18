import { Fragment } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { REPOSITORY_ACTIONS, type RepositoryActionHandlers } from '@/components/plugins/repositoryActions';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { PluginRepository } from '@/types/plugin';

type RepositoryActionsMenuProps = {
  repository: PluginRepository;
  handlers: RepositoryActionHandlers;
};

export function RepositoryActionsMenu({ repository, handlers }: RepositoryActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8">
          <span className="sr-only">メニューを開く</span>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>操作</DropdownMenuLabel>
        {REPOSITORY_ACTIONS.map((action) => (
          <Fragment key={action.id}>
            {action.separatorBefore && <DropdownMenuSeparator />}
            <DropdownMenuItem
              variant={action.destructive ? 'destructive' : 'default'}
              onSelect={() => action.onSelect(repository, handlers)}
            >
              {action.label}
            </DropdownMenuItem>
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
