import { Skeleton } from '@/components/ui/skeleton';

export function PageHeaderSkeleton() {
  return (
    <div className="sticky top-0 z-10 border-b border-border bg-card px-4 py-3 md:px-8">
      <div className="flex min-h-9 flex-wrap items-center justify-between gap-x-8 gap-y-3">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-9 w-full sm:w-56" />
      </div>
    </div>
  );
}
