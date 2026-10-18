import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

type AddRepositoryButtonProps = {
  onClick?: () => void;
};

export function AddRepositoryButton({ onClick }: AddRepositoryButtonProps) {
  return (
    <Button className="cursor-pointer" onClick={onClick}>
      <Plus />
      リポジトリを追加
    </Button>
  );
}
