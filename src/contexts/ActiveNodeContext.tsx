import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useNodesContext } from '@/contexts/NodesContext';
import type { NodeInfo } from '@/types/node';

type ActiveNodeContextValue = {
  activeNode: NodeInfo | null;
  setActiveNodeId: (id: string) => void;
};

const ActiveNodeContext = createContext<ActiveNodeContextValue | null>(null);

export function ActiveNodeProvider({ children }: { children: ReactNode }) {
  const { nodes } = useNodesContext();
  const [activeId, setActiveNodeId] = useState<string | null>(null);
  const activeNode = nodes.find((node) => node.id === activeId) ?? nodes[0] ?? null;

  const value = useMemo(() => ({ activeNode, setActiveNodeId }), [activeNode]);

  return <ActiveNodeContext.Provider value={value}>{children}</ActiveNodeContext.Provider>;
}

export function useActiveNode(): ActiveNodeContextValue {
  const value = useContext(ActiveNodeContext);
  if (!value) {
    throw new Error('useActiveNode は ActiveNodeProvider の内側で使用してください');
  }
  return value;
}
