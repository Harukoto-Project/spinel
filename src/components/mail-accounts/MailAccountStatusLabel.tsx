import { CircleCheck } from 'lucide-react';
import { StatusLabel } from '@/components/common/StatusLabel';

type MailAccountStatusLabelProps = {
  connected: boolean;
};

export function MailAccountStatusLabel({ connected }: MailAccountStatusLabelProps) {
  return connected ? (
    <StatusLabel icon={CircleCheck}>接続済み</StatusLabel>
  ) : (
    <StatusLabel tone="critical">要再接続</StatusLabel>
  );
}
