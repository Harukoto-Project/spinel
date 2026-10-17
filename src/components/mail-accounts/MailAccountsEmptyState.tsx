import { Mail } from 'lucide-react';
import { AddMailAccountButton } from '@/components/mail-accounts/AddMailAccountButton';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';

type MailAccountsEmptyStateProps = {
  onAddAccount?: () => void;
};

export function MailAccountsEmptyState({ onAddAccount }: MailAccountsEmptyStateProps) {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Mail />
        </EmptyMedia>
        <EmptyTitle>メールアカウントがありません</EmptyTitle>
        <EmptyDescription>このノードで取得するメールアカウントを追加してください。</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <AddMailAccountButton onClick={onAddAccount} />
      </EmptyContent>
    </Empty>
  );
}
