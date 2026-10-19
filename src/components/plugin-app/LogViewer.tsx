import { useLayoutEffect, useMemo, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { PluginLogEntry } from '@/types/pluginApp';

const ANSI_PATTERN = /\u001b\[[0-9;?]*[A-Za-z]/g;
const FOLLOW_THRESHOLD_PX = 24;

type LogViewerProps = {
  entries: PluginLogEntry[];
  loading?: boolean;
  error?: string | null;
  emptyText?: string;
  className?: string;
};

export function LogViewer({
  entries,
  loading = false,
  error = null,
  emptyText = 'ログはまだありません',
  className,
}: LogViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const followRef = useRef(true);

  const lines = useMemo(
    () => entries.map((entry) => ({ seq: entry.seq, text: entry.text.replace(ANSI_PATTERN, '') })),
    [entries],
  );

  useLayoutEffect(() => {
    const element = containerRef.current;
    if (element !== null && followRef.current) element.scrollTop = element.scrollHeight;
  }, [lines]);

  const handleScroll = () => {
    const element = containerRef.current;
    if (element === null) return;
    followRef.current = element.scrollHeight - element.scrollTop - element.clientHeight < FOLLOW_THRESHOLD_PX;
  };

  if (loading && lines.length === 0) {
    return <Skeleton className={cn('h-64 w-full md:h-80', className)} />;
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className={cn(
          'h-64 overflow-auto rounded-md border bg-muted/40 p-3 font-mono text-xs leading-relaxed md:h-80',
          className,
        )}
      >
        {lines.length === 0 ? (
          <p className="text-muted-foreground">{emptyText}</p>
        ) : (
          lines.map((line) => (
            <div key={line.seq} className="whitespace-pre-wrap break-all">
              {line.text === '' ? ' ' : line.text}
            </div>
          ))
        )}
      </div>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          ログを取得できませんでした: {error}
        </p>
      )}
    </div>
  );
}
