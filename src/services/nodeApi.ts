import type { NodeHealth, NodeLiveState } from '@/types/node';

const HEALTH_TIMEOUT_MS = 5000;
const DEFAULT_NODE_PORT = '8787';

export type NodeApiErrorKind = 'unreachable' | 'invalid';

export class NodeApiError extends Error {
  readonly kind: NodeApiErrorKind;

  constructor(kind: NodeApiErrorKind, message: string) {
    super(message);
    this.kind = kind;
  }
}

export function normalizeNodeAddress(input: string): string {
  const trimmed = input.trim();
  if (trimmed === '') {
    throw new Error('アドレスを入力してください');
  }

  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`;

  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    throw new Error('アドレスの形式が正しくありません');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('http または https のアドレスを指定してください');
  }
  if (url.protocol === 'http:' && url.port === '') {
    url.port = DEFAULT_NODE_PORT;
  }

  return url.origin;
}

function isNodeHealth(value: unknown): value is NodeHealth {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  const os = v.os as Record<string, unknown> | null | undefined;
  return (
    v.status === 'ok' &&
    typeof v.version === 'string' &&
    typeof v.startedAt === 'string' &&
    typeof v.updatedAt === 'string' &&
    typeof os === 'object' &&
    os !== null &&
    typeof os.name === 'string' &&
    typeof os.platform === 'string' &&
    typeof os.release === 'string' &&
    typeof os.arch === 'string'
  );
}

export async function fetchNodeHealth(address: string): Promise<{ health: NodeHealth; pingMs: number }> {
  const startedAt = performance.now();

  let response: Response;
  try {
    response = await fetch(`${address}/health`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS),
    });
  } catch {
    throw new NodeApiError('unreachable', 'ノードに接続できません');
  }
  const pingMs = Math.round((performance.now() - startedAt) * 10) / 10;

  if (!response.ok) {
    throw new NodeApiError('invalid', `ノードがエラーを返しました (${response.status})`);
  }

  const data: unknown = await response.json().catch(() => null);
  if (!isNodeHealth(data)) {
    throw new NodeApiError('invalid', 'Spinel のノードではないか、応答の形式が正しくありません');
  }

  return { health: data, pingMs };
}

export async function probeNode(address: string): Promise<NodeLiveState> {
  try {
    const { health, pingMs } = await fetchNodeHealth(address);
    return { status: 'online', health, pingMs };
  } catch (error) {
    const invalid = error instanceof NodeApiError && error.kind === 'invalid';
    return {
      status: invalid ? 'error' : 'offline',
      health: null,
      pingMs: null,
    };
  }
}
