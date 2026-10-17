import { useId, useState, type FormEvent } from 'react';
import { SecretInput } from '@/components/form/SecretInput';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import type { ApiKeyDefinition } from '@/types/apiKey';

type ApiKeyCardProps = {
  definition: ApiKeyDefinition;
  configured: boolean;
  onSave: (value: string) => void;
  onDelete: () => void;
};

export function ApiKeyCard({ definition, configured, onSave, onDelete }: ApiKeyCardProps) {
  const inputId = useId();
  const [value, setValue] = useState('');
  const trimmed = value.trim();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (trimmed === '') return;
    onSave(trimmed);
    setValue('');
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <CardHeader>
          <CardTitle>{definition.label}</CardTitle>
          <CardDescription>{definition.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Label htmlFor={inputId}>{configured ? '新しいキーで上書き' : 'APIキー'}</Label>
          <SecretInput
            id={inputId}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={configured ? '••••••••••••••••' : definition.placeholder}
          />
        </CardContent>
        <CardFooter className="flex-wrap justify-end gap-2">
          {configured && (
            <Button type="button" variant="outline" onClick={onDelete}>
              削除
            </Button>
          )}
          <Button type="submit" disabled={trimmed === ''}>
            保存
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
