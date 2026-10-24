import type { ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  children?: ReactNode;
};

export function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <div className="sticky top-0 z-10 border-b border-border bg-card px-4 py-3 md:px-8">
      <div className="flex min-h-9 flex-wrap items-center justify-between gap-x-8 gap-y-3">
        <h1 className="min-w-0 text-xl font-semibold text-foreground">{title}</h1>
        {children ? <div className="flex min-w-0 flex-wrap items-center gap-x-6 gap-y-2">{children}</div> : null}
      </div>
    </div>
  );
}
