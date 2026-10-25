import { ApiKeyForm } from '@/components/api-keys/ApiKeyForm';
import { ApiKeyFormSkeleton } from '@/components/api-keys/ApiKeyFormSkeleton';
import { API_KEYS } from '@/config/apiKeys';
import type { ApiKeyId, ApiKeyStatusMap } from '@/types/apiKey';

type ApiKeysSectionProps = {
  status: ApiKeyStatusMap | null;
  loading?: boolean;
  onSave: (id: ApiKeyId, value: string) => Promise<boolean>;
  onDelete: (id: ApiKeyId) => Promise<boolean>;
};

export function ApiKeysSection({ status, loading = false, onSave, onDelete }: ApiKeysSectionProps) {
  return (
    <>
      <p className="max-w-3xl text-sm text-muted-foreground">
        キーはノード(サーバー)に保存され、このアプリには残りません。保存したキーは画面に再表示されません。上書きする場合は新しいキーを入力して保存してください。
      </p>
      {loading || status === null
        ? API_KEYS.map((definition, index) => <ApiKeyFormSkeleton key={definition.id} divided={index > 0} />)
        : API_KEYS.map((definition, index) => (
            <ApiKeyForm
              key={definition.id}
              definition={definition}
              status={status[definition.id]}
              divided={index > 0}
              onSave={(value) => onSave(definition.id, value)}
              onDelete={() => onDelete(definition.id)}
            />
          ))}
    </>
  );
}
