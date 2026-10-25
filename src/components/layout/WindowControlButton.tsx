import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

type WindowControlButtonProps = ComponentProps<'button'> & {
  label: string;
  danger?: boolean;
};

export function WindowControlButton({
  label,
  danger = false,
  className,
  children,
  ...props
}: WindowControlButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      tabIndex={-1}
      className={cn(
        'inline-flex h-full w-11.5 items-center justify-center text-neutral-600 transition-colors outline-none dark:text-neutral-300 [&_svg]:size-4',
        danger ? 'hover:bg-destructive hover:text-neutral-50' : 'hover:bg-accent hover:text-accent-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
