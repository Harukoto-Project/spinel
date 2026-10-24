import { PageSection } from '@/components/common/PageSection';
import { Skeleton } from '@/components/ui/skeleton';

export function NotificationNodeSettingsSkeleton() {
  return (
    <>
      <PageSection>
        <div className="flex flex-col gap-1">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-5 w-72 max-w-full" />
        </div>
        <div className="flex max-w-xl flex-col gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-9 w-full" />
        </div>
        <Skeleton className="h-9 w-32" />
      </PageSection>
      <PageSection divided>
        <div className="flex flex-col gap-1">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-5 w-72 max-w-full" />
        </div>
        <div className="flex max-w-3xl flex-col gap-6">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="flex items-center justify-between gap-6">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-56 max-w-full" />
              </div>
              <Skeleton className="h-5 w-9" />
            </div>
          ))}
        </div>
      </PageSection>
    </>
  );
}
