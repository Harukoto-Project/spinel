import { DetailRow } from '@/components/form/DetailRow';
import { EMPTY_VALUE, formatDateTime } from '@/components/nodes/nodeFormat';
import { NotificationPriorityBadge } from '@/components/notifications/NotificationPriorityBadge';
import { formatReceivedAt } from '@/components/notifications/notificationHistoryFormat';
import { UNKNOWN_NODE_NAME } from '@/components/notifications/notificationHistorySearch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { KIND_LABELS } from '@/config/notifications';
import type { ReceivedNotification } from '@/types/notification';

type NotificationDetailsDialogProps = {
  notification: ReceivedNotification | null;
  nodeName: string | undefined;
  onOpenChange: (open: boolean) => void;
};

export function NotificationDetailsDialog({ notification, nodeName, onOpenChange }: NotificationDetailsDialogProps) {
  const mail = notification?.mail ?? null;

  return (
    <Dialog open={notification !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        {notification && (
          <>
            <DialogHeader>
              <DialogTitle className="wrap-break-word">{notification.title}</DialogTitle>
              <DialogDescription>{formatReceivedAt(notification.receivedAt)} に受信</DialogDescription>
            </DialogHeader>
            <dl className="divide-y">
              <DetailRow label="本文">{notification.body || EMPTY_VALUE}</DetailRow>
              <DetailRow label="優先度">
                <NotificationPriorityBadge priority={notification.priority} />
              </DetailRow>
              <DetailRow label="種別">{KIND_LABELS[notification.kind]}</DetailRow>
              <DetailRow label="ノード">{nodeName ?? UNKNOWN_NODE_NAME}</DetailRow>
              <DetailRow label="Windows通知">{notification.shown ? '表示済み' : EMPTY_VALUE}</DetailRow>
              <DetailRow label="送信日時">{formatDateTime(notification.sentAt, { seconds: true })}</DetailRow>
              {mail && (
                <>
                  <DetailRow label="アカウント">{mail.account}</DetailRow>
                  <DetailRow label="差出人">{mail.from}</DetailRow>
                  <DetailRow label="件名">{mail.subject}</DetailRow>
                  <DetailRow label="メール受信日時">{formatDateTime(mail.receivedAt, { seconds: true })}</DetailRow>
                  <DetailRow label="要約">{mail.summary || EMPTY_VALUE}</DetailRow>
                  <DetailRow label="期限">{mail.deadline ?? EMPTY_VALUE}</DetailRow>
                </>
              )}
            </dl>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
