import { Circle, OctagonAlert, TriangleAlert, type LucideIcon } from 'lucide-react';

export type StatusTone = 'normal' | 'warning' | 'critical';

type StatusToneStyle = {
  icon: LucideIcon;
  className: string;
};

export const STATUS_TONES: Record<StatusTone, StatusToneStyle> = {
  normal: {
    icon: Circle,
    className: 'text-neutral-600 dark:text-neutral-300',
  },
  warning: {
    icon: TriangleAlert,
    className: 'font-medium text-warning',
  },
  critical: {
    icon: OctagonAlert,
    className: 'font-medium text-destructive',
  },
};
