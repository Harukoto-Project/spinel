import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { PluginRepository } from '@/types/plugin';

type DeleteRepositoryDialogProps = {
  repository: PluginRepository | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (repository: PluginRepository) => void;
};

export function DeleteRepositoryDialog({ repository, onOpenChange, onConfirm }: DeleteRepositoryDialogProps) {
  return (
    <Dialog open={repository !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        {repository && (
          <>
            <DialogHeader>
              <DialogTitle>リポジトリを削除しますか?</DialogTitle>
              <DialogDescription>
                「{repository.name}」に含まれる {repository.plugins.length} 件のプラグインを無効にして、ノードから削除します。
                プラグインが保存した設定やデータも削除されます。
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button className="cursor-pointer" variant="outline" onClick={() => onOpenChange(false)}>
                キャンセル
              </Button>
              <Button className="cursor-pointer" variant="destructive" onClick={() => onConfirm(repository)}>
                削除
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
