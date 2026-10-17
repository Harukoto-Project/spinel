import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type ClearHistoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function ClearHistoryDialog({ open, onOpenChange, onConfirm }: ClearHistoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>通知履歴を削除しますか?</DialogTitle>
          <DialogDescription>このアプリに保存されているすべてのノードの通知履歴を削除します。</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button className="cursor-pointer" variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button className="cursor-pointer" variant="destructive" onClick={onConfirm}>
            削除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
