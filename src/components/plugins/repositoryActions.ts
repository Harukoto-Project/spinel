import type { PluginRepository } from '@/types/plugin';

export type RepositoryActionHandlers = {
  onRefresh: (repository: PluginRepository) => void;
  onDelete: (repository: PluginRepository) => void;
};

export type RepositoryAction = {
  id: string;
  label: string;
  destructive?: boolean;
  separatorBefore?: boolean;
  onSelect: (repository: PluginRepository, handlers: RepositoryActionHandlers) => void;
};

export const REPOSITORY_ACTIONS: RepositoryAction[] = [
  {
    id: 'refresh',
    label: '最新を取得',
    onSelect: (repository, handlers) => handlers.onRefresh(repository),
  },
  {
    id: 'delete',
    label: '削除',
    destructive: true,
    separatorBefore: true,
    onSelect: (repository, handlers) => handlers.onDelete(repository),
  },
];
