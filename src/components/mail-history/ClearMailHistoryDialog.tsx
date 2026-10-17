import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type ClearMailHistoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function ClearMailHistoryDialog({ open, onOpenChange, onConfirm }: ClearMailHistoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>履歴をすべて削除しますか?</DialogTitle>
          <DialogDescription>このノードに保存されているメールの処理履歴(通知・除外)をすべて削除します。</DialogDescription>
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
