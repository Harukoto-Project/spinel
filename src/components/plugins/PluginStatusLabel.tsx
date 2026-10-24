import { StatusLabel } from '@/components/common/StatusLabel';
import { CircleCheck, CircleOff } from 'lucide-react';
import type { PluginStatus } from '@/types/plugin';

type PluginStatusLabelProps = {
  status: PluginStatus;
};

export function PluginStatusLabel({ status }: PluginStatusLabelProps) {
  switch (status) {
    case 'active':
      return <StatusLabel icon={CircleCheck}>有効</StatusLabel>;
    case 'error':
      return <StatusLabel tone="critical">エラー</StatusLabel>;
    default:
      return (
        <StatusLabel icon={CircleOff} className="text-muted-foreground">
          無効
        </StatusLabel>
      );
  }
}
