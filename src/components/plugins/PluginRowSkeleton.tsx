import { Skeleton } from '@/components/ui/skeleton';

export function PluginRowSkeleton() {
  return (
    <li className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </div>
      <Skeleton className="h-5 w-9" />
    </li>
  );
}
