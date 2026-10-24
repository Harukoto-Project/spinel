import { CircleCheck, Info, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { StatusLabel } from '@/components/common/StatusLabel';
import type { StatusTone } from '@/config/statusTones';
import type { WidgetTone } from '@/types/pluginApp';

type ToneStyle = {
  tone: StatusTone;
  icon?: LucideIcon;
};

const TONE_STYLES: Record<WidgetTone, ToneStyle> = {
  neutral: { tone: 'normal' },
  info: { tone: 'normal', icon: Info },
  success: { tone: 'normal', icon: CircleCheck },
  warning: { tone: 'warning' },
  danger: { tone: 'critical' },
};

type ToneLabelProps = {
  tone: WidgetTone;
  className?: string;
  children: ReactNode;
};

export function ToneLabel({ tone, className, children }: ToneLabelProps) {
  const style = TONE_STYLES[tone];

  return (
    <StatusLabel tone={style.tone} icon={style.icon} className={className}>
      {children}
    </StatusLabel>
  );
}
