import { Badge } from '@/components/ui/badge';

type MailAccountStatusBadgeProps = {
  connected: boolean;
};

export function MailAccountStatusBadge({ connected }: MailAccountStatusBadgeProps) {
  return connected ? <Badge variant="secondary">接続済み</Badge> : <Badge variant="destructive">要再接続</Badge>;
}
