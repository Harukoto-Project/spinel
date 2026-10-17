import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

type AddImapAccountButtonProps = {
  onClick?: () => void;
};

export function AddImapAccountButton({ onClick }: AddImapAccountButtonProps) {
  return (
    <Button className="cursor-pointer" onClick={onClick}>
      <Plus />
      アカウントを追加
    </Button>
  );
}
