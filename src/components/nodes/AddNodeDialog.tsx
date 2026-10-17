import { AddNodeForm } from '@/components/nodes/AddNodeForm';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import type { NewNodeInput } from '@/types/node';

type AddNodeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddNode: (input: NewNodeInput) => Promise<void>;
};

export function AddNodeDialog({ open, onOpenChange, onAddNode }: AddNodeDialogProps) {
  const handleSubmit = async (input: NewNodeInput) => {
    await onAddNode(input);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <AddNodeForm onSubmit={handleSubmit} onCancel={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
