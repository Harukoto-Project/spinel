import { createContext, useContext, type ReactNode } from 'react';
import { useNodes } from '@/hooks/use-nodes';

type NodesContextValue = ReturnType<typeof useNodes>;

const NodesContext = createContext<NodesContextValue | null>(null);

export function NodesProvider({ children }: { children: ReactNode }) {
  const value = useNodes();
  return <NodesContext.Provider value={value}>{children}</NodesContext.Provider>;
}

export function useNodesContext(): NodesContextValue {
  const value = useContext(NodesContext);
  if (!value) {
    throw new Error('useNodesContext は NodesProvider の内側で使用してください');
  }
  return value;
}
