import { PageBody } from '@/components/common/PageBody';
import { PageHeaderSkeleton } from '@/components/common/PageHeaderSkeleton';
import { Skeleton } from '@/components/ui/skeleton';

export function PluginPageSkeleton() {
  return (
    <>
      <PageHeaderSkeleton />
      <PageBody>
        <Skeleton className="h-48 w-full" />
      </PageBody>
    </>
  );
}
