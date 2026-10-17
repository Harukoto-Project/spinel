import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchNodeHealth, normalizeNodeAddress, probeNode } from '@/services/nodeApi';
import { describeStorageError, loadStoredNodes, saveStoredNodes } from '@/services/nodeStorage';
import type { NewNodeInput, NodeInfo, NodeLiveState, StoredNode } from '@/types/node';

export const NODE_POLL_INTERVAL_MS = 30_000;

const INITIAL_LIVE_STATE: NodeLiveState = {
  status: 'offline',
  health: null,
  pingMs: null,
};

export function useNodes() {
  const [stored, setStored] = useState<StoredNode[]>([]);
  const [live, setLive] = useState<Record<string, NodeLiveState>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const storedRef = useRef<StoredNode[]>([]);
  const loadedRef = useRef(false);

  const commit = useCallback((next: StoredNode[]) => {
    storedRef.current = next;
    setStored(next);
    saveStoredNodes(next).then(
      () => setError(null),
      (caught) => setError(`ノードの保存に失敗しました: ${describeStorageError(caught)}`),
    );
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | undefined;

    const poll = async () => {
      const targets = storedRef.current;
      const results = await Promise.all(
        targets.map(async (node) => ({
          id: node.id,
          state: await probeNode(node.address),
        })),
      );
      if (cancelled) return;

      const now = new Date().toISOString();
      const activeIds = new Set(storedRef.current.map((node) => node.id));
      const reachedIds = new Set(
        results.filter(({ id, state }) => activeIds.has(id) && state.status === 'online').map(({ id }) => id),
      );

      setLive((current) => {
        const next = { ...current };
        for (const { id, state } of results) {
          if (activeIds.has(id)) next[id] = state;
        }
        return next;
      });
      if (reachedIds.size > 0) {
        commit(storedRef.current.map((node) => (reachedIds.has(node.id) ? { ...node, lastSeenAt: now } : node)));
      }
      setLoading(false);
    };

    const start = async () => {
      try {
        const nodes = await loadStoredNodes();
        if (cancelled) return;
        storedRef.current = nodes;
        loadedRef.current = true;
        setStored(nodes);
      } catch (caught) {
        if (cancelled) return;
        setError(`ノードの読み込みに失敗しました: ${describeStorageError(caught)}`);
        setLoading(false);
        return;
      }

      await poll();
      if (cancelled) return;
      timer = setInterval(() => void poll(), NODE_POLL_INTERVAL_MS);
    };

    void start();
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [commit]);

  const addNode = useCallback(
    async (input: NewNodeInput) => {
      if (!loadedRef.current) {
        throw new Error('保存済みのノードを読み込めていないため、追加できません');
      }
      const name = input.name.trim();
      if (name === '') {
        throw new Error('名前を入力してください');
      }
      const address = normalizeNodeAddress(input.address);
      if (storedRef.current.some((node) => node.address === address)) {
        throw new Error('このアドレスは既に登録されています');
      }

      const { health, pingMs } = await fetchNodeHealth(address);

      const node: StoredNode = {
        id: crypto.randomUUID(),
        name,
        address,
        lastSeenAt: new Date().toISOString(),
      };
      setLive((current) => ({
        ...current,
        [node.id]: { status: 'online', health, pingMs },
      }));
      commit([...storedRef.current, node]);
    },
    [commit],
  );

  const removeNode = useCallback(
    (id: string) => {
      setLive((current) => {
        const { [id]: _removed, ...rest } = current;
        return rest;
      });
      commit(storedRef.current.filter((node) => node.id !== id));
    },
    [commit],
  );

  const nodes = useMemo<NodeInfo[]>(
    () =>
      stored.map((node) => ({
        ...node,
        ...(live[node.id] ?? INITIAL_LIVE_STATE),
      })),
    [stored, live],
  );

  return { nodes, loading, error, addNode, removeNode };
}
