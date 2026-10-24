import { PageSection } from '@/components/common/PageSection';
import { Skeleton } from '@/components/ui/skeleton';

export function MailSettingsFormSkeleton() {
  return (
    <PageSection divided>
      <div className="flex flex-col gap-1">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-5 w-72 max-w-full" />
      </div>
      <div className="flex max-w-xl flex-col gap-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </div>
      <Skeleton className="h-9 w-24" />
    </PageSection>
  );
}
