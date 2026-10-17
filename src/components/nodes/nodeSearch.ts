import type { NodeInfo } from '@/types/node';

export function filterNodes(nodes: NodeInfo[], query: string): NodeInfo[] {
  const keyword = query.trim().toLowerCase();
  if (!keyword) return nodes;

  return nodes.filter(
    (node) => node.name.toLowerCase().includes(keyword) || node.address.toLowerCase().includes(keyword),
  );
}
