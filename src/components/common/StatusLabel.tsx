import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { STATUS_TONES, type StatusTone } from '@/config/statusTones';
import { cn } from '@/lib/utils';

type StatusLabelProps = {
  tone?: StatusTone;
  icon?: LucideIcon;
  className?: string;
  children: ReactNode;
};

export function StatusLabel({ tone = 'normal', icon, className, children }: StatusLabelProps) {
  const style = STATUS_TONES[tone];
  const Icon = icon ?? style.icon;

  return (
    <span className={cn('inline-flex items-center gap-1.5 text-sm whitespace-nowrap', style.className, className)}>
      <Icon className="size-4 shrink-0" aria-hidden />
      {children}
    </span>
  );
}
