import { ImapAccountsSection } from '@/components/imap/ImapAccountsSection';
import { ImapFetchSettingsCard } from '@/components/imap/ImapFetchSettingsCard';
import { ImapFetchSettingsCardSkeleton } from '@/components/imap/ImapFetchSettingsCardSkeleton';
import { useImapConfig } from '@/hooks/use-imap-config';

type ImapNodeSettingsProps = {
  nodeId: string;
};

export function ImapNodeSettings({ nodeId }: ImapNodeSettingsProps) {
  const { config, loading, error, saveAccount, deleteAccount, saveSettings } = useImapConfig(nodeId);

  return (
    <div className="flex flex-col gap-8">
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <ImapAccountsSection
        accounts={config?.accounts ?? []}
        loading={loading}
        onSaveAccount={saveAccount}
        onDeleteAccount={deleteAccount}
      />
      {loading ? (
        <ImapFetchSettingsCardSkeleton />
      ) : (
        config && <ImapFetchSettingsCard settings={config.settings} onSave={saveSettings} />
      )}
    </div>
  );
}
