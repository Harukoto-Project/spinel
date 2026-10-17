import type { Logger } from '../../../logger.js';
import { HttpStatusError, ProviderAuthError } from '../../errors.js';

const TOKEN_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
const SCOPE = 'offline_access https://graph.microsoft.com/Mail.Read';
const AUTH_ERROR_CODES: ReadonlySet<string> = new Set(['invalid_grant', 'interaction_required', 'consent_required']);
const EXPIRY_MARGIN_MS = 60_000;
const REQUEST_TIMEOUT_MS = 30_000;
const DETAIL_MAX = 300;

export type RefreshTokenRotated = (previous: string, next: string) => Promise<void>;

interface CachedToken {
  value: string;
  expiresAt: number;
}

interface TokenError {
  code: string;
  description: string;
}

const parseTokenError = (body: string): TokenError => {
  try {
    const parsed: unknown = JSON.parse(body);
    if (typeof parsed === 'object' && parsed !== null) {
      const code = 'error' in parsed && typeof parsed.error === 'string' ? parsed.error : '';
      const description =
        'error_description' in parsed && typeof parsed.error_description === 'string'
          ? parsed.error_description.slice(0, DETAIL_MAX)
          : '';
      return { code, description };
    }
  } catch {
    return { code: '', description: body.slice(0, DETAIL_MAX) };
  }
  return { code: '', description: '' };
};

export class OutlookAccessTokens {
  private readonly cache = new Map<string, CachedToken>();

  public constructor(
    private readonly clientId: string,
    private readonly onRotated: RefreshTokenRotated,
    private readonly logger: Logger,
  ) {}

  public async get(refreshToken: string, forceRefresh = false): Promise<string> {
    const cached = this.cache.get(refreshToken);
    if (!forceRefresh && cached && cached.expiresAt - EXPIRY_MARGIN_MS > Date.now()) {
      return cached.value;
    }

    const { token, rotatedRefreshToken } = await this.refresh(refreshToken);
    this.cache.set(refreshToken, token);

    if (rotatedRefreshToken !== null && rotatedRefreshToken !== refreshToken) {
      this.cache.set(rotatedRefreshToken, token);
      try {
        await this.onRotated(refreshToken, rotatedRefreshToken);
      } catch (error) {
        this.logger.error('更新されたリフレッシュトークンの保存に失敗しました', error);
      }
    }
    return token.value;
  }

  private async refresh(refreshToken: string): Promise<{ token: CachedToken; rotatedRefreshToken: string | null }> {
    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.clientId,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
        scope: SCOPE,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      const error = parseTokenError(await response.text());
      if (AUTH_ERROR_CODES.has(error.code)) {
        throw new ProviderAuthError('Outlook のアクセス許可が失効しました。アプリからアカウントを再接続してください');
      }
      const detail = error.description ? `: ${error.description}` : '';
      throw new HttpStatusError(response.status, `Outlook のトークン更新に失敗しました (${response.status})${detail}`);
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
      throw new Error('Outlook のトークン応答の形式が正しくありません');
    }

    const rotated = 'refresh_token' in data && typeof data.refresh_token === 'string' ? data.refresh_token : null;
    return {
      token: { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 },
      rotatedRefreshToken: rotated,
    };
  }
}
