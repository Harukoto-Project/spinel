import { ApiKeyCard } from '@/components/api-keys/ApiKeyCard';
import { ApiKeyCardSkeleton } from '@/components/api-keys/ApiKeyCardSkeleton';
import { API_KEYS } from '@/config/apiKeys';
import type { ApiKeyId, ApiKeyStatusMap } from '@/types/apiKey';

type ApiKeysSectionProps = {
  status: ApiKeyStatusMap;
  loading?: boolean;
  onSave: (id: ApiKeyId, value: string) => void;
  onDelete: (id: ApiKeyId) => void;
};

export function ApiKeysSection({ status, loading = false, onSave, onDelete }: ApiKeysSectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        保存したキーは画面に再表示されません。上書きする場合は新しいキーを入力して保存してください。
      </p>
      <div className="grid gap-4 xl:grid-cols-2">
        {loading
          ? API_KEYS.map((definition) => <ApiKeyCardSkeleton key={definition.id} />)
          : API_KEYS.map((definition) => (
              <ApiKeyCard
                key={definition.id}
                definition={definition}
                configured={status[definition.id]}
                onSave={(value) => onSave(definition.id, value)}
                onDelete={() => onDelete(definition.id)}
              />
            ))}
      </div>
    </section>
  );
}
