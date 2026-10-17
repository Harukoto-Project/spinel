import { useState } from 'react';
import { ApiKeysSection } from '@/components/api-keys/ApiKeysSection';
import { PageHeader } from '@/components/layout/PageHeader';
import { MOCK_API_KEY_STATUS } from '@/data/mockApiKeyStatus';
import type { ApiKeyId, ApiKeyStatusMap } from '@/types/apiKey';

export function ApiSettingsPage() {
  const [status, setStatus] = useState<ApiKeyStatusMap>(MOCK_API_KEY_STATUS);

  const updateStatus = (id: ApiKeyId, configured: boolean) => {
    setStatus((current) => ({ ...current, [id]: configured }));
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <PageHeader title="APIキーの設定" />
      <ApiKeysSection
        status={status}
        onSave={(id) => updateStatus(id, true)}
        onDelete={(id) => updateStatus(id, false)}
      />
    </div>
  );
}
