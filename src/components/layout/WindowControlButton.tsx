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
        'text-muted-foreground inline-flex h-full w-11.5 items-center justify-center transition-colors outline-none [&_svg]:size-4',
        danger ? 'hover:bg-destructive hover:text-white' : 'hover:bg-accent hover:text-accent-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
