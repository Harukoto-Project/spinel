import { PageSection } from '@/components/common/PageSection';
import { Skeleton } from '@/components/ui/skeleton';

type ApiKeyFormSkeletonProps = {
  divided?: boolean;
};

export function ApiKeyFormSkeleton({ divided = false }: ApiKeyFormSkeletonProps) {
  return (
    <PageSection divided={divided}>
      <div className="flex flex-col gap-1">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-5 w-64 max-w-full" />
      </div>
      <div className="flex max-w-xl flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-9 w-full" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>
    </PageSection>
  );
}
