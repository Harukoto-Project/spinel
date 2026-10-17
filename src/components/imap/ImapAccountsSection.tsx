import { useMemo, useState } from 'react';
import { DataTable } from '@/components/data-table/DataTable';
import { AddImapAccountButton } from '@/components/imap/AddImapAccountButton';
import { DeleteImapAccountDialog } from '@/components/imap/DeleteImapAccountDialog';
import { ImapAccountContextMenuContent } from '@/components/imap/ImapAccountContextMenuContent';
import { ImapAccountDialog } from '@/components/imap/ImapAccountDialog';
import { ImapAccountsEmptyState } from '@/components/imap/ImapAccountsEmptyState';
import type { ImapAccountActionHandlers } from '@/components/imap/imapAccountActions';
import { createImapAccountColumns } from '@/components/imap/imapAccountColumns';
import type { ImapAccount, ImapAccountInput } from '@/types/imap';

type ImapAccountsSectionProps = {
  accounts: ImapAccount[];
  loading?: boolean;
  onSaveAccount: (input: ImapAccountInput) => Promise<void>;
  onDeleteAccount: (accountId: string) => Promise<void>;
};

export function ImapAccountsSection({
  accounts,
  loading = false,
  onSaveAccount,
  onDeleteAccount,
}: ImapAccountsSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handlers = useMemo<ImapAccountActionHandlers>(
    () => ({
      onEdit: (account) => {
        setEditingId(account.id);
        setDialogOpen(true);
      },
      onDelete: (account) => setDeleteId(account.id),
    }),
    [],
  );
  const columns = useMemo(() => createImapAccountColumns(handlers), [handlers]);

  const editingAccount = accounts.find((account) => account.id === editingId) ?? null;
  const deleteAccount = accounts.find((account) => account.id === deleteId) ?? null;

  const openAdd = () => {
    setEditingId(null);
    setDialogOpen(true);
  };

  const showEmpty = !loading && accounts.length === 0;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">アカウント</h2>
        {!showEmpty && <AddImapAccountButton onClick={openAdd} />}
      </div>
      {showEmpty ? (
        <ImapAccountsEmptyState onAddAccount={openAdd} />
      ) : (
        <DataTable
          columns={columns}
          data={accounts}
          loading={loading}
          emptyMessage="IMAPアカウントがありません"
          renderRowContextMenu={(account) => <ImapAccountContextMenuContent account={account} handlers={handlers} />}
        />
      )}
      <ImapAccountDialog
        open={dialogOpen}
        account={editingAccount}
        onOpenChange={setDialogOpen}
        onSave={onSaveAccount}
      />
      <DeleteImapAccountDialog
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
