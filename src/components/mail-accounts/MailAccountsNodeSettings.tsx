import { MailAccountsSection } from '@/components/mail-accounts/MailAccountsSection';
import { useMailAccounts } from '@/hooks/use-mail-accounts';

type MailAccountsNodeSettingsProps = {
  nodeId: string;
};

export function MailAccountsNodeSettings({ nodeId }: MailAccountsNodeSettingsProps) {
  const { accounts, loading, error, connect, deleteAccount } = useMailAccounts(nodeId);

  return (
    <div className="flex flex-col gap-8">
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <MailAccountsSection
        accounts={accounts}
        loading={loading}
        onConnect={connect}
        onDeleteAccount={deleteAccount}
      />
    </div>
  );
}
