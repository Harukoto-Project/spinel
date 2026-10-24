import type { ReactNode } from 'react';

type PageBodyProps = {
  children: ReactNode;
};

export function PageBody({ children }: PageBodyProps) {
  return (
    <main className="px-4 py-6 md:px-8 md:py-8">
      <div className="flex max-w-6xl flex-col gap-8">{children}</div>
    </main>
  );
}
