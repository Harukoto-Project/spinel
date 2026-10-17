import { useId, useState, type FormEvent } from 'react';
import { LoaderCircle } from 'lucide-react';
import { SecretInput } from '@/components/form/SecretInput';
import { Button } from '@/components/ui/button';
import { DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { NewNodeInput } from '@/types/node';

type AddNodeFormProps = {
  onSubmit: (input: NewNodeInput) => Promise<void>;
  onCancel: () => void;
};

export function AddNodeForm({ onSubmit, onCancel }: AddNodeFormProps) {
  const nameId = useId();
  const addressId = useId();
  const adminKeyId = useId();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = name.trim() !== '' && address.trim() !== '' && !submitting;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ name, address, adminKey });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'ノードを追加できませんでした');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <DialogHeader>
        <DialogTitle>ノードを追加</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-2">
        <Label htmlFor={nameId}>名前</Label>
        <Input
          id={nameId}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="main-node"
          autoComplete="off"
          autoFocus
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={addressId}>アドレス</Label>
        <Input
          id={addressId}
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          placeholder="192.168.0.10:8787"
          autoComplete="off"
          spellCheck={false}
          aria-invalid={error !== null}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={adminKeyId}>管理キー(任意)</Label>
        <SecretInput
          id={adminKeyId}
          value={adminKey}
          onChange={(event) => setAdminKey(event.target.value)}
          placeholder="spn_..."
        />
        <p className="text-sm text-muted-foreground">
          通知を受け取るための認証に使います。サーバーの初回起動時にコンソールへ表示されます。あとから設定することもできます。
        </p>
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <DialogFooter>
        <Button className="cursor-pointer" type="button" variant="outline" onClick={onCancel}>
          キャンセル
        </Button>
        <Button className="cursor-pointer" type="submit" disabled={!canSubmit}>
          {submitting && <LoaderCircle className="animate-spin" />}
          追加
        </Button>
      </DialogFooter>
    </form>
  );
}
