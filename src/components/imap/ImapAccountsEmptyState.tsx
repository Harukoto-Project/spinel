import { Mail } from 'lucide-react';
import { AddImapAccountButton } from '@/components/imap/AddImapAccountButton';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';

type ImapAccountsEmptyStateProps = {
  onAddAccount?: () => void;
};

export function ImapAccountsEmptyState({ onAddAccount }: ImapAccountsEmptyStateProps) {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Mail />
        </EmptyMedia>
        <EmptyTitle>IMAPアカウントがありません</EmptyTitle>
        <EmptyDescription>このノードで取得するメールアカウントを追加してください。</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <AddImapAccountButton onClick={onAddAccount} />
      </EmptyContent>
    </Empty>
  );
}
