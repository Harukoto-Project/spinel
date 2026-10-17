import type { NodeInfo } from '@/types/node';

export type NodeActionHandlers = {
  onShowDetails: (node: NodeInfo) => void;
  onDelete: (node: NodeInfo) => void;
};

export type NodeAction = {
  id: string;
  label: string;
  destructive?: boolean;
  separatorBefore?: boolean;
  onSelect: (node: NodeInfo, handlers: NodeActionHandlers) => void;
};

export const NODE_ACTIONS: NodeAction[] = [
  {
    id: 'copy-id',
    label: 'IDをコピー',
    onSelect: (node) => {
      navigator.clipboard.writeText(node.id);
    },
  },
  {
    id: 'details',
    label: '詳細を表示',
    separatorBefore: true,
    onSelect: (node, handlers) => handlers.onShowDetails(node),
  },
  {
    id: 'delete',
    label: '削除',
    destructive: true,
    onSelect: (node, handlers) => handlers.onDelete(node),
  },
];
