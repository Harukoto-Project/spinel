import { Skeleton } from '@/components/ui/skeleton';

export function SshKeySkeleton() {
  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-5 w-64 max-w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-28" />
      </div>
    </div>
  );
}
