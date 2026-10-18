import { AddRepositoryForm } from '@/components/plugins/AddRepositoryForm';
import { Dialog, DialogContent } from '@/components/ui/dialog';

type AddRepositoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddRepository: (url: string) => Promise<void>;
};

export function AddRepositoryDialog({ open, onOpenChange, onAddRepository }: AddRepositoryDialogProps) {
  const handleSubmit = async (url: string) => {
    await onAddRepository(url);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <AddRepositoryForm onSubmit={handleSubmit} onCancel={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
