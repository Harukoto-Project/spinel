import { useState } from 'react';
import type { NodeInfo } from '@/types/node';

export function useSelectedNode(nodes: NodeInfo[]) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedNode = nodes.find((node) => node.id === selectedId) ?? nodes[0] ?? null;

  return { selectedNode, setSelectedId };
}
