import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { NodeInfo } from '@/types/node';

type NodeSelectProps = {
  nodes: NodeInfo[];
  value: string | null;
  onValueChange: (id: string) => void;
};

export function NodeSelect({ nodes, value, onValueChange }: NodeSelectProps) {
  return (
    <Select value={value ?? undefined} onValueChange={onValueChange}>
      <SelectTrigger className="w-full sm:w-64" aria-label="ノードを選択">
        <SelectValue placeholder="ノードを選択" />
      </SelectTrigger>
      <SelectContent>
        {nodes.map((node) => (
          <SelectItem key={node.id} value={node.id}>
            {node.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
