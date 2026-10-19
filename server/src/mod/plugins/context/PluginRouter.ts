import type { PluginRouteHandler } from './contextTypes.js';

export type RouteMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export const RESERVED_FIRST_SEGMENTS: readonly string[] = ['enable', 'disable', 'settings', 'front', 'app'];

const LITERAL_PATTERN = /^[A-Za-z0-9._~-]+$/;
const PARAM_PATTERN = /^:([A-Za-z_][A-Za-z0-9_]*)$/;

type Segment = { kind: 'literal'; value: string } | { kind: 'param'; name: string } | { kind: 'wildcard' };

interface RouteEntry {
  method: RouteMethod;
  key: string;
  segments: Segment[];
  score: number;
  handler: PluginRouteHandler;
}

export interface RouteMatch {
  handler: PluginRouteHandler;
  params: Record<string, string>;
}

const parsePattern = (pattern: string): Segment[] => {
  if (!pattern.startsWith('/')) throw new Error(`ルートのパスは / で始めてください: ${pattern}`);
  if (pattern === '/') return [];

  const names = new Set<string>();
  const parts = pattern.slice(1).split('/');
  return parts.map((part, index) => {
    if (part === '*') {
      if (index !== parts.length - 1) throw new Error(`* はパスの末尾にだけ使えます: ${pattern}`);
      return { kind: 'wildcard' };
    }
    const param = PARAM_PATTERN.exec(part);
    if (param?.[1] !== undefined) {
      if (names.has(param[1])) throw new Error(`パラメーター名が重複しています: ${pattern}`);
      names.add(param[1]);
      return { kind: 'param', name: param[1] };
    }
    if (!LITERAL_PATTERN.test(part)) throw new Error(`ルートのパスに使えない文字があります: ${pattern}`);
    return { kind: 'literal', value: part };
  });
};

const keyOf = (method: RouteMethod, segments: readonly Segment[]): string =>
  `${method} /${segments
    .map((segment) => (segment.kind === 'literal' ? segment.value : segment.kind === 'param' ? ':' : '*'))
    .join('/')}`;

const scoreOf = (segments: readonly Segment[]): number =>
  segments.reduce((sum, segment) => sum + (segment.kind === 'literal' ? 3 : segment.kind === 'param' ? 2 : 1), 0);

const matchSegments = (segments: readonly Segment[], parts: readonly string[]): Record<string, string> | null => {
  const wildcard = segments.at(-1)?.kind === 'wildcard';
  const fixed = wildcard ? segments.length - 1 : segments.length;
  if (wildcard ? parts.length < fixed : parts.length !== fixed) return null;

  const params: Record<string, string> = {};
  for (let index = 0; index < fixed; index += 1) {
    const segment = segments[index];
    const part = parts[index];
    if (segment === undefined || part === undefined) return null;
    if (segment.kind === 'literal' && segment.value !== part) return null;
    if (segment.kind === 'param') params[segment.name] = part;
  }
  if (wildcard) params['*'] = parts.slice(fixed).join('/');
  return params;
};

export class PluginRouter {
  private readonly routes: RouteEntry[] = [];
  private disposed = false;

  public add(method: RouteMethod, pattern: string, handler: PluginRouteHandler): void {
    if (this.disposed) throw new Error('このプラグインはすでに無効化されています');
    if (typeof handler !== 'function') throw new Error('ルートのハンドラーは関数で指定してください');

    const segments = parsePattern(pattern);
    const first = segments[0];
    if (first?.kind === 'literal' && RESERVED_FIRST_SEGMENTS.includes(first.value)) {
      throw new Error(`"/${first.value}" はホストが使うため、プラグインのルートには使えません`);
    }

    const key = keyOf(method, segments);
    if (this.routes.some((route) => route.key === key)) throw new Error(`ルートが重複しています: ${key}`);
    this.routes.push({ method, key, segments, score: scoreOf(segments), handler });
  }

  public match(method: string, subPath: string): RouteMatch | null {
    const parts = subPath.split('/').filter((part) => part !== '');
    let best: { entry: RouteEntry; params: Record<string, string> } | null = null;
    for (const entry of this.routes) {
      if (entry.method !== method) continue;
      const params = matchSegments(entry.segments, parts);
      if (params !== null && (best === null || entry.score > best.entry.score)) best = { entry, params };
    }
    return best === null ? null : { handler: best.entry.handler, params: best.params };
  }

  public dispose(): void {
    this.disposed = true;
    this.routes.length = 0;
  }
}
