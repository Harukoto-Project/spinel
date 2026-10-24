import { useId, useState, type FormEvent } from 'react';
import { PageSection } from '@/components/common/PageSection';
import { SecretInput } from '@/components/form/SecretInput';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { ApiKeyDefinition, ApiKeyStatus } from '@/types/apiKey';

type ApiKeyFormProps = {
  definition: ApiKeyDefinition;
  status: ApiKeyStatus;
  divided?: boolean;
  onSave: (value: string) => Promise<boolean>;
  onDelete: () => Promise<boolean>;
};

export function ApiKeyForm({ definition, status, divided = false, onSave, onDelete }: ApiKeyFormProps) {
  const inputId = useId();
  const [value, setValue] = useState('');
  const [pending, setPending] = useState(false);
  const trimmed = value.trim();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (trimmed === '' || pending) return;
    setPending(true);
    try {
      if (await onSave(trimmed)) setValue('');
    } finally {
      setPending(false);
    }
  };

  const handleDelete = async () => {
    setPending(true);
    try {
      await onDelete();
    } finally {
      setPending(false);
    }
  };

  return (
    <PageSection title={definition.label} description={definition.description} divided={divided}>
      <form onSubmit={(event) => void handleSubmit(event)} className="flex max-w-xl flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor={inputId}>{status.configured ? '新しいキーで上書き' : 'APIキー'}</Label>
          <SecretInput
            id={inputId}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={status.configured ? '••••••••••••••••' : definition.placeholder}
            disabled={pending}
          />
          {status.source === 'env' && (
            <p className="text-sm text-muted-foreground">
              サーバーの環境変数で設定済みです。ここで保存すると、保存したキーが優先されます。
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" variant="secondary" disabled={trimmed === '' || pending}>
            キーを保存
          </Button>
          {status.source === 'app' && (
            <Button type="button" variant="outline" disabled={pending} onClick={() => void handleDelete()}>
              キーを削除
            </Button>
          )}
        </div>
      </form>
    </PageSection>
  );
}
