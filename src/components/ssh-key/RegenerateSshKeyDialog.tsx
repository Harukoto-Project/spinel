import { useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { describeError } from '@/lib/errors';

type RegenerateSshKeyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
};

export function RegenerateSshKeyDialog({ open, onOpenChange, onConfirm }: RegenerateSshKeyDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (next: boolean) => {
    if (submitting) return;
    if (!next) setError(null);
    onOpenChange(next);
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (caught) {
      setError(describeError(caught));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>SSH 鍵を再生成しますか?</DialogTitle>
          <DialogDescription>
            現在の鍵は削除され、新しい鍵に置き換わります。GitHub
            に登録済みの公開鍵は使えなくなるため、新しい公開鍵を登録し直してください。
          </DialogDescription>
        </DialogHeader>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <DialogFooter>
          <Button
            className="cursor-pointer"
            variant="outline"
            disabled={submitting}
            onClick={() => handleOpenChange(false)}
          >
            キャンセル
          </Button>
          <Button
            className="cursor-pointer"
            variant="destructive"
            disabled={submitting}
            onClick={() => void handleConfirm()}
          >
            {submitting && <LoaderCircle className="animate-spin" />}
            再生成
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
