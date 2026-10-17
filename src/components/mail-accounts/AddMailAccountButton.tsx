import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

type AddMailAccountButtonProps = {
  onClick?: () => void;
};

export function AddMailAccountButton({ onClick }: AddMailAccountButtonProps) {
  return (
    <Button className="cursor-pointer" onClick={onClick}>
      <Plus />
      アカウントを追加
    </Button>
  );
}
