import type { ReactNode } from 'react';

type NodeDetailRowProps = {
  label: string;
  children: ReactNode;
};

export function NodeDetailRow({ label, children }: NodeDetailRowProps) {
  return (
    <div className="grid gap-1 py-2 sm:grid-cols-[8rem_1fr] sm:gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-sm break-words">{children}</dd>
    </div>
  );
}
