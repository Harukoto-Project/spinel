import { Badge } from '@/components/ui/badge';
import type { PluginStatus } from '@/types/plugin';

type PluginStatusBadgeProps = {
  status: PluginStatus;
};

export function PluginStatusBadge({ status }: PluginStatusBadgeProps) {
  switch (status) {
    case 'active':
      return <Badge variant="secondary">有効</Badge>;
    case 'error':
      return <Badge variant="destructive">エラー</Badge>;
    default:
      return <Badge variant="outline">無効</Badge>;
  }
}
