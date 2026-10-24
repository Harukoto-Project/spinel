import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type PageSectionProps = {
  title?: string;
  description?: ReactNode;
  action?: ReactNode;
  divided?: boolean;
  className?: string;
  children?: ReactNode;
};

export function PageSection({ title, description, action, divided = false, className, children }: PageSectionProps) {
  const hasHeader = title || description || action;

  return (
    <section className={cn('flex flex-col gap-4', divided && 'border-t border-border pt-8', className)}>
      {hasHeader ? (
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            {title ? <h2 className="text-base font-semibold break-words text-foreground">{title}</h2> : null}
            {description ? <div className="text-sm text-muted-foreground">{description}</div> : null}
          </div>
          {action ? <div className="flex flex-wrap items-center gap-2">{action}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
