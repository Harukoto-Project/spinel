import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ImapAccount } from '@/types/imap';

type DeleteImapAccountDialogProps = {
  account: ImapAccount | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (account: ImapAccount) => void;
};

export function DeleteImapAccountDialog({ account, onOpenChange, onConfirm }: DeleteImapAccountDialogProps) {
  return (
    <Dialog open={account !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        {account && (
          <>
            <DialogHeader>
              <DialogTitle>アカウントを削除しますか?</DialogTitle>
              <DialogDescription>
                「{account.name}」({account.user})の設定を削除します。保存済みのパスワードも削除されます。
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
