import { MailAccountsSection } from '@/components/mail-accounts/MailAccountsSection';
import { MailSettingsForm } from '@/components/mail-accounts/MailSettingsForm';
import { MailSettingsFormSkeleton } from '@/components/mail-accounts/MailSettingsFormSkeleton';
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
    <>
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
        <MailSettingsFormSkeleton />
      ) : (
        mailSettings.settings && <MailSettingsForm settings={mailSettings.settings} onSave={mailSettings.save} />
      )}
    </>
  );
}
