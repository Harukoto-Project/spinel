import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { WidgetTone } from '@/types/pluginApp';

const TONE_CLASSES: Record<WidgetTone, string> = {
  neutral: 'bg-muted text-muted-foreground',
  info: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
  success: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  warning: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  danger: 'bg-destructive/15 text-destructive',
};

type ToneBadgeProps = {
  tone: WidgetTone;
  className?: string;
  children: ReactNode;
};

export function ToneBadge({ tone, className, children }: ToneBadgeProps) {
  return <Badge className={cn(TONE_CLASSES[tone], className)}>{children}</Badge>;
}
