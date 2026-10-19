import { useId, useState, type FormEvent } from 'react';
import { LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { describeError } from '@/lib/errors';

type AddRepositoryFormProps = {
  onSubmit: (url: string) => Promise<void>;
  onCancel: () => void;
};

export function AddRepositoryForm({ onSubmit, onCancel }: AddRepositoryFormProps) {
  const urlId = useId();
  const [url, setUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = url.trim();
  const canSubmit = trimmed !== '' && !submitting;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(trimmed);
    } catch (caught) {
      setError(describeError(caught));
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-4">
      <DialogHeader>
        <DialogTitle>リポジトリを追加</DialogTitle>
        <DialogDescription>
          ノードが GitHub のリポジトリ(https または SSH)を取得し、含まれるプラグインをインストールします。インストール直後は無効の状態です。
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col gap-2">
        <Label htmlFor={urlId}>リポジトリの URL</Label>
        <Input
          id={urlId}
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://github.com/owner/repository"
          autoComplete="off"
          spellCheck={false}
          disabled={submitting}
          aria-invalid={error !== null}
          autoFocus
        />
        <p className="text-sm text-muted-foreground">
          private リポジトリは <code className="text-xs">git@github.com:owner/repository</code> の形式で指定し、設定ページの SSH
          公開鍵を GitHub に登録してください。取得には時間がかかることがあります。
        </p>
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <DialogFooter>
        <Button className="cursor-pointer" type="button" variant="outline" disabled={submitting} onClick={onCancel}>
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
