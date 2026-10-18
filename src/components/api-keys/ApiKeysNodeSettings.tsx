import { ApiKeysSection } from '@/components/api-keys/ApiKeysSection';
import { useApiKeys } from '@/hooks/use-api-keys';

type ApiKeysNodeSettingsProps = {
  nodeId: string;
};

export function ApiKeysNodeSettings({ nodeId }: ApiKeysNodeSettingsProps) {
  const { status, loading, error, save, remove } = useApiKeys(nodeId);

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <ApiKeysSection status={status} loading={loading} onSave={save} onDelete={remove} />
    </div>
  );
}
