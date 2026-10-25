import type { ReactNode } from 'react';
import { PageSection } from '@/components/common/PageSection';

type PanelCardProps = {
  title: string;
  description: string | null;
  action?: ReactNode;
  children: ReactNode;
};

export function PanelCard({ title, description, action, children }: PanelCardProps) {
  return (
    <PageSection
      title={title}
      description={description}
      action={action}
      className="not-first:border-t not-first:border-border not-first:pt-8"
    >
      {children}
    </PageSection>
  );
}
