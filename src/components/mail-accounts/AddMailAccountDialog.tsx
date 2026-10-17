import { useState } from 'react';
import { LoaderCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MAIL_PROVIDERS } from '@/config/mailProviders';
import { describeError } from '@/lib/errors';
import type { MailProviderId } from '@/types/mailAccount';

type AddMailAccountDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (provider: MailProviderId) => Promise<void>;
};

export function AddMailAccountDialog({ open, onOpenChange, onConnect }: AddMailAccountDialogProps) {
  const [pending, setPending] = useState<MailProviderId | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (next: boolean) => {
    if (next) setError(null);
    onOpenChange(next);
  };

  const handleConnect = async (provider: MailProviderId) => {
    setPending(provider);
    setError(null);
    try {
      await onConnect(provider);
      onOpenChange(false);
    } catch (caught) {
      setError(describeError(caught));
    } finally {
      setPending(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>メールアカウントを追加</DialogTitle>
          <DialogDescription>追加するアカウントのプロバイダーを選んでください。</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          {MAIL_PROVIDERS.map((provider) => (
            <Button
              key={provider.id}
              type="button"
              variant="outline"
              className="h-auto cursor-pointer justify-start gap-3 px-4 py-3 text-left whitespace-normal"
              disabled={pending !== null}
              onClick={() => void handleConnect(provider.id)}
            >
              {pending === provider.id ? <LoaderCircle className="animate-spin" /> : <Mail />}
              <span className="flex flex-col items-start gap-0.5">
                <span className="font-medium">{provider.label}</span>
                <span className="text-sm font-normal text-muted-foreground">{provider.description}</span>
              </span>
            </Button>
          ))}
        </div>
        {pending !== null && (
          <p className="text-sm text-muted-foreground">
            ブラウザで認証を完了してください。完了すると自動的にこの画面へ戻ります。
          </p>
        )}
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
