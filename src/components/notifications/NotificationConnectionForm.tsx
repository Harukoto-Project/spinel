import { useId, useState, type FormEvent } from 'react';
import { LoaderCircle } from 'lucide-react';
import { PageSection } from '@/components/common/PageSection';
import { SecretInput } from '@/components/form/SecretInput';
import { NotificationConnectionLabel } from '@/components/notifications/NotificationConnectionLabel';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { describeError } from '@/lib/errors';
import type { ConnectionStatus } from '@/types/notification';

type NotificationConnectionFormProps = {
  status: ConnectionStatus | null;
  statusLoading: boolean;
  adminKeySet: boolean;
  onSaveKey: (adminKey: string) => Promise<void>;
  onDeleteKey: () => Promise<void>;
};

export function NotificationConnectionForm({
  status,
  statusLoading,
  adminKeySet,
  onSaveKey,
  onDeleteKey,
}: NotificationConnectionFormProps) {
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
    <PageSection
      title="ノードへの接続"
      description="ノードの管理キーで認証し、通知を WebSocket で受け取ります。管理キーはサーバーの初回起動時にコンソールへ表示されます。"
      action={
        statusLoading ? (
          <Skeleton className="h-5 w-24" />
        ) : (
          <NotificationConnectionLabel state={status?.state ?? 'disconnected'} />
        )
      }
    >
      <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-4">
        {message && (
          <p role="status" className="text-sm text-muted-foreground">
            {message}
          </p>
        )}
        <div className="flex flex-col gap-2">
          <Label htmlFor={inputId}>{adminKeySet ? '新しい管理キーで上書き' : '管理キー'}</Label>
          <SecretInput
            id={inputId}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={adminKeySet ? '••••••••••••••••' : 'spn_...'}
          />
        </div>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" variant="secondary" disabled={trimmed === '' || busy}>
            {busy && <LoaderCircle className="animate-spin" />}
            管理キーを保存
          </Button>
          {adminKeySet && (
            <Button type="button" variant="outline" disabled={busy} onClick={() => void run(onDeleteKey)}>
              管理キーを削除
            </Button>
          )}
        </div>
      </form>
    </PageSection>
  );
}
