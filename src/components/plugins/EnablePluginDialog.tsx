import { useEffect, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { PluginPermissionList } from '@/components/plugins/PluginPermissionList';
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
import type { Plugin } from '@/types/plugin';

type EnablePluginDialogProps = {
  plugin: Plugin;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEnable: () => Promise<void>;
};

export function EnablePluginDialog({ plugin, open, onOpenChange, onEnable }: EnablePluginDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) setError(null);
  }, [open]);

  const handleConfirm = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await onEnable();
      onOpenChange(false);
    } catch (caught) {
      setError(describeError(caught));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !submitting && onOpenChange(next)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>「{plugin.name}」を有効にしますか?</DialogTitle>
          <DialogDescription>
            このプラグインは、ノード上で次の権限を使います。内容を確認して、問題なければ許可してください。
          </DialogDescription>
        </DialogHeader>
        <PluginPermissionList permissions={plugin.permissions} />
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
            onClick={() => onOpenChange(false)}
          >
            キャンセル
          </Button>
          <Button className="cursor-pointer" disabled={submitting} onClick={() => void handleConfirm()}>
            {submitting && <LoaderCircle className="animate-spin" />}
            許可して有効にする
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
