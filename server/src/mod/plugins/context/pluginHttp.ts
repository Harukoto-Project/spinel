import type { PluginHttp } from './contextTypes.js';

const REDIRECT_MAX = 5;
const TIMEOUT_MS = 30_000;
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

const toUrl = (input: string | URL): URL => {
  const url = new URL(input);
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error(`http / https 以外のプロトコルは使えません: ${url.protocol}`);
  }
  return url;
};

export const createPluginHttp = (allowedOrigins: readonly string[]): PluginHttp => {
  const allowAll = allowedOrigins.includes('*');

  const assertAllowed = (url: URL): void => {
    if (!allowAll && !allowedOrigins.includes(url.origin)) {
      throw new Error(`許可されていないオリジンへのアクセスです: ${url.origin}`);
    }
  };

  return {
    async fetch(input, init = {}) {
      let url = toUrl(input);
      let current: RequestInit = {
        ...init,
        redirect: 'manual',
        signal: init.signal ?? AbortSignal.timeout(TIMEOUT_MS),
      };

      for (let hop = 0; hop <= REDIRECT_MAX; hop += 1) {
        assertAllowed(url);
        const response = await fetch(url, current);
        const location = response.headers.get('location');
        if (!REDIRECT_STATUSES.has(response.status) || location === null) return response;

        url = toUrl(new URL(location, url));
        const method = (current.method ?? 'GET').toUpperCase();
        const toGet =
          response.status === 303 || ((response.status === 301 || response.status === 302) && method === 'POST');
        current = toGet ? { ...current, method: 'GET', body: undefined } : current;
      }
      throw new Error(`リダイレクトが ${REDIRECT_MAX} 回を超えました`);
    },
  };
};
