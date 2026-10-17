import { useId, useState, type FormEvent } from 'react';
import { LoaderCircle } from 'lucide-react';
import { SecretInput } from '@/components/form/SecretInput';
import { Button } from '@/components/ui/button';
import { DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { IMAP_DEFAULT_PORT } from '@/config/imap';
import { describeError } from '@/lib/errors';
import { defaultAccountName, defaultImapHost } from '@/lib/imap';
import type { ImapAccount, ImapAccountInput } from '@/types/imap';

type ImapAccountFormProps = {
  account: ImapAccount | null;
  onSubmit: (input: ImapAccountInput) => Promise<void>;
  onCancel: () => void;
};

function parsePort(value: string): number | null {
  const port = Number(value);
  return Number.isInteger(port) && port >= 1 && port <= 65535 ? port : null;
}

export function ImapAccountForm({ account, onSubmit, onCancel }: ImapAccountFormProps) {
  const isNew = account === null;
  const idPrefix = useId();
  const [user, setUser] = useState(account?.user ?? '');
  const [name, setName] = useState(account?.name ?? '');
  const [host, setHost] = useState(account?.host ?? '');
  const [port, setPort] = useState(String(account?.port ?? IMAP_DEFAULT_PORT));
  const [secure, setSecure] = useState(account?.secure ?? true);
  const [password, setPassword] = useState('');
  const [nameTouched, setNameTouched] = useState(!isNew);
  const [hostTouched, setHostTouched] = useState(!isNew);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const portNumber = parsePort(port);
  const portInvalid = port !== '' && portNumber === null;
  const canSubmit =
    user.trim() !== '' &&
    name.trim() !== '' &&
    host.trim() !== '' &&
    portNumber !== null &&
    (!isNew || password !== '') &&
    !submitting;

  const handleUserChange = (value: string) => {
    setUser(value);
    if (!nameTouched) setName(defaultAccountName(value));
    if (!hostTouched) setHost(defaultImapHost(value));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || portNumber === null) return;

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        id: account?.id ?? crypto.randomUUID(),
        name,
        host,
        port: portNumber,
        user,
        secure,
        password: password === '' ? undefined : password,
      });
    } catch (caught) {
      setError(describeError(caught));
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <DialogHeader>
        <DialogTitle>{isNew ? 'アカウントを追加' : 'アカウントを編集'}</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-user`}>メールアドレス</Label>
        <Input
          id={`${idPrefix}-user`}
          type="email"
          value={user}
          onChange={(event) => handleUserChange(event.target.value)}
          placeholder="you@gmail.com"
          autoComplete="off"
          spellCheck={false}
          autoFocus
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-name`}>アカウント名</Label>
        <Input
          id={`${idPrefix}-name`}
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setNameTouched(true);
          }}
          placeholder="gmail-main"
          autoComplete="off"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${idPrefix}-host`}>IMAPサーバー</Label>
          <Input
            id={`${idPrefix}-host`}
            value={host}
            onChange={(event) => {
              setHost(event.target.value);
              setHostTouched(true);
            }}
            placeholder="imap.gmail.com"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${idPrefix}-port`}>ポート</Label>
          <Input
            id={`${idPrefix}-port`}
            type="number"
            inputMode="numeric"
            min={1}
            max={65535}
            value={port}
            onChange={(event) => setPort(event.target.value)}
            aria-invalid={portInvalid}
          />
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 rounded-md border p-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor={`${idPrefix}-secure`}>SSL/TLS で接続する</Label>
          <p className="text-xs text-muted-foreground">993 番ポートなら有効、143 番ポートなら無効にします。</p>
        </div>
        <Switch id={`${idPrefix}-secure`} checked={secure} onCheckedChange={setSecure} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-password`}>パスワード</Label>
        <SecretInput
          id={`${idPrefix}-password`}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder={isNew ? '' : '変更する場合のみ入力'}
        />
        <p className="text-xs text-muted-foreground">
          Gmail などはアプリパスワードを使用してください。パスワードは OS の資格情報ストアに保存されます。
        </p>
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <DialogFooter>
        <Button
          className="cursor-pointer sm:mr-auto"
          type="button"
          variant="outline"
          disabled
          title="接続テストは今後対応します"
        >
          接続テスト
        </Button>
        <Button className="cursor-pointer" type="button" variant="outline" onClick={onCancel}>
          キャンセル
        </Button>
        <Button className="cursor-pointer" type="submit" disabled={!canSubmit}>
          {submitting && <LoaderCircle className="animate-spin" />}
          保存
        </Button>
      </DialogFooter>
    </form>
  );
}
