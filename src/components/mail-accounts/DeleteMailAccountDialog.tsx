import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { MailAccount } from '@/types/mailAccount';

type DeleteMailAccountDialogProps = {
  account: MailAccount | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (account: MailAccount) => void;
};

export function DeleteMailAccountDialog({ account, onOpenChange, onConfirm }: DeleteMailAccountDialogProps) {
  return (
    <Dialog open={account !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        {account && (
          <>
            <DialogHeader>
              <DialogTitle>アカウントを削除しますか?</DialogTitle>
              <DialogDescription>
                「{account.name}」({account.email})の新着メール確認を止め、ノードに保存されている認証情報を削除します。Google
                アカウント側のアクセス許可は、Google アカウントの設定から解除できます。
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button className="cursor-pointer" variant="outline" onClick={() => onOpenChange(false)}>
                キャンセル
              </Button>
              <Button className="cursor-pointer" variant="destructive" onClick={() => onConfirm(account)}>
                削除
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
