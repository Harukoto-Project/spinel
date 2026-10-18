import { Skeleton } from '@/components/ui/skeleton';

export function PluginPageSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-9 w-full sm:w-64" />
      </div>
      <Skeleton className="h-48 w-full" />
    </div>
  );
}
