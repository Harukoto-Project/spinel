import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

type AddNodeButtonProps = {
  onClick?: () => void;
};

export function AddNodeButton({ onClick }: AddNodeButtonProps) {
  return (
    <Button className="cursor-pointer" onClick={onClick}>
      <Plus />
      ノードを追加
    </Button>
  );
}
