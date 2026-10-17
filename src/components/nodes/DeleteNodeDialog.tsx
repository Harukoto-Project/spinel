import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { NodeInfo } from '@/types/node';

type DeleteNodeDialogProps = {
  node: NodeInfo | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (node: NodeInfo) => void;
};

export function DeleteNodeDialog({ node, onOpenChange, onConfirm }: DeleteNodeDialogProps) {
  return (
    <Dialog open={node !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        {node && (
          <>
            <DialogHeader>
              <DialogTitle>ノードを削除しますか?</DialogTitle>
              <DialogDescription>
                「{node.name}」({node.address})を一覧から削除します。ノード側のサーバーには影響しません。
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                キャンセル
              </Button>
              <Button variant="destructive" onClick={() => onConfirm(node)}>
                削除
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
