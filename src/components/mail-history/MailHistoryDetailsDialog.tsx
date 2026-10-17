import { DetailRow } from '@/components/form/DetailRow';
import { MailDecisionBadge } from '@/components/mail-history/MailDecisionBadge';
import { formatAccountLabel, formatHistoryTime, formatSubject } from '@/components/mail-history/mailHistoryFormat';
import { EMPTY_VALUE } from '@/components/nodes/nodeFormat';
import { NotificationPriorityBadge } from '@/components/notifications/NotificationPriorityBadge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getMailProviderLabel } from '@/config/mailProviders';
import type { MailHistoryEntry } from '@/types/mailHistory';

type MailHistoryDetailsDialogProps = {
  entry: MailHistoryEntry | null;
  onOpenChange: (open: boolean) => void;
};

export function MailHistoryDetailsDialog({ entry, onOpenChange }: MailHistoryDetailsDialogProps) {
  return (
    <Dialog open={entry !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        {entry && (
          <>
            <DialogHeader>
              <DialogTitle className="wrap-break-word">{formatSubject(entry.subject)}</DialogTitle>
              <DialogDescription>{formatHistoryTime(entry.processedAt)} に処理</DialogDescription>
            </DialogHeader>
            <dl className="divide-y">
              <DetailRow label="判定">
                <MailDecisionBadge decision={entry.decision} />
              </DetailRow>
              {entry.priority && (
                <DetailRow label="優先度">
                  <NotificationPriorityBadge priority={entry.priority} />
                </DetailRow>
              )}
              <DetailRow label="差出人">{entry.from || EMPTY_VALUE}</DetailRow>
              <DetailRow label="アカウント">{formatAccountLabel(entry.accountName, entry.accountEmail)}</DetailRow>
              <DetailRow label="プロバイダー">{getMailProviderLabel(entry.provider)}</DetailRow>
              <DetailRow label="メール受信日時">{formatHistoryTime(entry.receivedAt)}</DetailRow>
              {entry.decision === 'notify' && (
                <>
                  <DetailRow label="要約">{entry.summary || EMPTY_VALUE}</DetailRow>
                  <DetailRow label="期限">{entry.deadline ?? EMPTY_VALUE}</DetailRow>
                </>
              )}
            </dl>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
