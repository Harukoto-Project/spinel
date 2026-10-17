import { HttpStatusError, ProviderAuthError } from '../../errors.js';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const EXPIRY_MARGIN_MS = 60_000;
const REQUEST_TIMEOUT_MS = 30_000;

interface CachedToken {
  value: string;
  expiresAt: number;
}

const isInvalidGrant = (body: string): boolean => {
  try {
    const parsed: unknown = JSON.parse(body);
    return typeof parsed === 'object' && parsed !== null && 'error' in parsed && parsed.error === 'invalid_grant';
  } catch {
    return false;
  }
};

export class GoogleAccessTokens {
  private readonly cache = new Map<string, CachedToken>();

  public constructor(
    private readonly clientId: string,
    private readonly clientSecret: string,
  ) {}

  public async get(refreshToken: string, forceRefresh = false): Promise<string> {
    const cached = this.cache.get(refreshToken);
    if (!forceRefresh && cached && cached.expiresAt - EXPIRY_MARGIN_MS > Date.now()) {
      return cached.value;
    }

    const fresh = await this.refresh(refreshToken);
    this.cache.set(refreshToken, fresh);
    return fresh.value;
  }

  private async refresh(refreshToken: string): Promise<CachedToken> {
    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      const body = await response.text();
      if (isInvalidGrant(body)) {
        throw new ProviderAuthError('Google のアクセス許可が失効しました。アプリからアカウントを再接続してください');
      }
      throw new HttpStatusError(response.status, `Google のトークン更新に失敗しました (${response.status})`);
    }

    const data: unknown = await response.json();
    if (
      typeof data !== 'object' ||
      data === null ||
      !('access_token' in data) ||
      typeof data.access_token !== 'string' ||
      !('expires_in' in data) ||
      typeof data.expires_in !== 'number'
    ) {
      throw new Error('Google のトークン応答の形式が正しくありません');
    }

    return { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  }
}
