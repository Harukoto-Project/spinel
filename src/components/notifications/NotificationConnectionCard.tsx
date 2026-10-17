import { useId, useState, type FormEvent } from 'react';
import { LoaderCircle } from 'lucide-react';
import { SecretInput } from '@/components/form/SecretInput';
import { NotificationConnectionBadge } from '@/components/notifications/NotificationConnectionBadge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { describeError } from '@/lib/errors';
import type { ConnectionStatus } from '@/types/notification';

type NotificationConnectionCardProps = {
  status: ConnectionStatus | null;
  statusLoading: boolean;
  adminKeySet: boolean;
  onSaveKey: (adminKey: string) => Promise<void>;
  onDeleteKey: () => Promise<void>;
};

export function NotificationConnectionCard({
  status,
  statusLoading,
  adminKeySet,
  onSaveKey,
  onDeleteKey,
}: NotificationConnectionCardProps) {
  const inputId = useId();
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const trimmed = value.trim();

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (caught) {
      setError(describeError(caught));
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (trimmed === '' || busy) return;
    void run(async () => {
      await onSaveKey(trimmed);
      setValue('');
    });
  };

  const message = status?.message ?? null;

  return (
    <Card>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <CardHeader>
          <CardTitle>ノードへの接続</CardTitle>
          <CardDescription>
            ノードの管理キーで認証し、通知を WebSocket
            で受け取ります。管理キーはサーバーの初回起動時にコンソールへ表示されます。
          </CardDescription>
          <CardAction>
            {statusLoading ? (
              <Skeleton className="h-5 w-24" />
            ) : (
              <NotificationConnectionBadge state={status?.state ?? 'disconnected'} />
            )}
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {message && (
            <p role="status" className="text-sm text-muted-foreground">
              {message}
            </p>
          )}
          <Label htmlFor={inputId}>{adminKeySet ? '新しい管理キーで上書き' : '管理キー'}</Label>
          <SecretInput
            id={inputId}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={adminKeySet ? '••••••••••••••••' : 'spn_...'}
          />
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex-wrap justify-end gap-2">
          {adminKeySet && (
            <Button
              className="cursor-pointer"
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => void run(onDeleteKey)}
            >
              削除
            </Button>
          )}
          <Button className="cursor-pointer" type="submit" disabled={trimmed === '' || busy}>
            {busy && <LoaderCircle className="animate-spin" />}
            保存
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
