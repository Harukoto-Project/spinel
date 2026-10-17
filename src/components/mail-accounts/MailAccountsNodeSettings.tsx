import { MailAccountsSection } from '@/components/mail-accounts/MailAccountsSection';
import { MailSettingsCard } from '@/components/mail-accounts/MailSettingsCard';
import { MailSettingsCardSkeleton } from '@/components/mail-accounts/MailSettingsCardSkeleton';
import { useMailAccounts } from '@/hooks/use-mail-accounts';
import { useMailSettings } from '@/hooks/use-mail-settings';

type MailAccountsNodeSettingsProps = {
  nodeId: string;
};

export function MailAccountsNodeSettings({ nodeId }: MailAccountsNodeSettingsProps) {
  const accounts = useMailAccounts(nodeId);
  const mailSettings = useMailSettings(nodeId);
  const error = accounts.error ?? mailSettings.error;

  return (
    <div className="flex flex-col gap-8">
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <MailAccountsSection
        accounts={accounts.accounts}
        loading={accounts.loading}
        onConnect={accounts.connect}
        onDeleteAccount={accounts.deleteAccount}
      />
      {mailSettings.loading ? (
        <MailSettingsCardSkeleton />
      ) : (
        mailSettings.settings && <MailSettingsCard settings={mailSettings.settings} onSave={mailSettings.save} />
      )}
    </div>
  );
}
