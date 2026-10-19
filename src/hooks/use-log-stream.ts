import { useEffect, useRef, useState } from 'react';
import { describeError } from '@/lib/errors';
import type { PluginLogChunk, PluginLogEntry } from '@/types/pluginApp';

const POLL_INTERVAL_MS = 1000;
const MAX_ENTRIES = 2000;

export type LogReader = (after: number) => Promise<PluginLogChunk>;

export function useLogStream(read: LogReader, live: boolean, resetKey: number | null) {
  const [entries, setEntries] = useState<PluginLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const afterRef = useRef(0);

  useEffect(() => {
    afterRef.current = 0;
    setEntries([]);
    setLoading(true);
  }, [read, resetKey]);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const poll = async (): Promise<void> => {
      if (!document.hidden || afterRef.current === 0) {
        try {
          const chunk = await read(afterRef.current);
          if (cancelled) return;
          if (chunk.next < afterRef.current) {
            afterRef.current = 0;
            setEntries([]);
            void poll();
            return;
          }
          if (chunk.entries.length > 0) {
            setEntries((current) => [...current, ...chunk.entries].slice(-MAX_ENTRIES));
          }
          afterRef.current = chunk.next;
          setError(null);
        } catch (caught) {
          if (cancelled) return;
          setError(describeError(caught));
        }
        setLoading(false);
      }
      if (!cancelled && live) timer = setTimeout(() => void poll(), POLL_INTERVAL_MS);
    };

    void poll();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [read, live, resetKey]);

  return { entries, loading, error };
}
