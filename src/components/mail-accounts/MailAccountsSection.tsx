import { useMemo, useState } from 'react';
import { DataTable } from '@/components/data-table/DataTable';
import { AddMailAccountButton } from '@/components/mail-accounts/AddMailAccountButton';
import { AddMailAccountDialog } from '@/components/mail-accounts/AddMailAccountDialog';
import { DeleteMailAccountDialog } from '@/components/mail-accounts/DeleteMailAccountDialog';
import { MailAccountContextMenuContent } from '@/components/mail-accounts/MailAccountContextMenuContent';
import { MailAccountsEmptyState } from '@/components/mail-accounts/MailAccountsEmptyState';
import type { MailAccountActionHandlers } from '@/components/mail-accounts/mailAccountActions';
import { createMailAccountColumns } from '@/components/mail-accounts/mailAccountColumns';
import type { MailAccount, MailProviderId } from '@/types/mailAccount';

type MailAccountsSectionProps = {
  accounts: MailAccount[];
  loading?: boolean;
  onConnect: (provider: MailProviderId) => Promise<void>;
  onDeleteAccount: (accountId: string) => Promise<void>;
};

export function MailAccountsSection({
  accounts,
  loading = false,
  onConnect,
  onDeleteAccount,
}: MailAccountsSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handlers = useMemo<MailAccountActionHandlers>(
    () => ({
      onDelete: (account) => setDeleteId(account.id),
    }),
    [],
  );
  const columns = useMemo(() => createMailAccountColumns(handlers), [handlers]);

  const deleteAccount = accounts.find((account) => account.id === deleteId) ?? null;
  const showEmpty = !loading && accounts.length === 0;
  const openAdd = () => setDialogOpen(true);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">アカウント</h2>
        {!showEmpty && <AddMailAccountButton onClick={openAdd} />}
      </div>
      {showEmpty ? (
        <MailAccountsEmptyState onAddAccount={openAdd} />
      ) : (
        <DataTable
          columns={columns}
          data={accounts}
          loading={loading}
          emptyMessage="メールアカウントがありません"
          renderRowContextMenu={(account) => <MailAccountContextMenuContent account={account} handlers={handlers} />}
        />
      )}
      <AddMailAccountDialog open={dialogOpen} onOpenChange={setDialogOpen} onConnect={onConnect} />
      <DeleteMailAccountDialog
        account={deleteAccount}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={async (account) => {
          setDeleteId(null);
          await onDeleteAccount(account.id);
        }}
      />
    </section>
  );
}
