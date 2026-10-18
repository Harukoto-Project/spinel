import { useId, useState, type FormEvent } from 'react';
import { SecretInput } from '@/components/form/SecretInput';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import type { ApiKeyDefinition, ApiKeyStatus } from '@/types/apiKey';

type ApiKeyCardProps = {
  definition: ApiKeyDefinition;
  status: ApiKeyStatus;
  onSave: (value: string) => Promise<boolean>;
  onDelete: () => Promise<boolean>;
};

export function ApiKeyCard({ definition, status, onSave, onDelete }: ApiKeyCardProps) {
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
    <Card>
      <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-6">
        <CardHeader>
          <CardTitle>{definition.label}</CardTitle>
          <CardDescription>{definition.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
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
        </CardContent>
        <CardFooter className="flex-wrap justify-end gap-2">
          {status.source === 'app' && (
            <Button type="button" variant="outline" disabled={pending} onClick={() => void handleDelete()}>
              削除
            </Button>
          )}
          <Button type="submit" disabled={trimmed === '' || pending}>
            保存
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
