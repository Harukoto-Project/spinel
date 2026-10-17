import { ImapAccountForm } from '@/components/imap/ImapAccountForm';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import type { ImapAccount, ImapAccountInput } from '@/types/imap';

type ImapAccountDialogProps = {
  open: boolean;
  account: ImapAccount | null;
  onOpenChange: (open: boolean) => void;
  onSave: (input: ImapAccountInput) => Promise<void>;
};

export function ImapAccountDialog({ open, account, onOpenChange, onSave }: ImapAccountDialogProps) {
  const handleSubmit = async (input: ImapAccountInput) => {
    await onSave(input);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <ImapAccountForm account={account} onSubmit={handleSubmit} onCancel={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
