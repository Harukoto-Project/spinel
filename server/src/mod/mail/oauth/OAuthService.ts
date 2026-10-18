import { MailError } from '../errors.js';
import type { MailProviderId } from '../types.js';
import type { OAuthCompleteInput, OAuthGrant, OAuthProviderConfig, OAuthStartInput } from './types.js';

const REQUEST_TIMEOUT_MS = 30_000;
const DETAIL_MAX = 300;
const REDIRECT_URI_PATTERN = /^http:\/\/([^:/]+):(\d{1,5})$/;

interface TokenResponse {
  accessToken: string;
  refreshToken: string | null;
}

const describeFailure = (body: string): string => {
  try {
    const parsed: unknown = JSON.parse(body);
    if (typeof parsed === 'object' && parsed !== null) {
      const record = parsed as Record<string, unknown>;
      const description = typeof record.error_description === 'string' ? record.error_description : '';
      const code = typeof record.error === 'string' ? record.error : '';
      const detail = description || code;
      if (detail) return detail.slice(0, DETAIL_MAX);
    }
  } catch {
    return body.slice(0, DETAIL_MAX);
  }
  return body.slice(0, DETAIL_MAX);
};

const reachabilityError = (error: unknown): MailError => {
  const reason = error instanceof Error ? error.message : String(error);
  return new MailError(502, 'provider_unreachable', `認証サービスに接続できませんでした: ${reason}`);
};

export class OAuthService {
  private readonly configs = new Map<MailProviderId, OAuthProviderConfig>();

  public constructor(configs: OAuthProviderConfig[]) {
    for (const config of configs) this.configs.set(config.id, config);
  }

  public buildAuthUrl(input: OAuthStartInput): string {
    const config = this.config(input.provider);
    this.assertRedirectUri(config, input.redirectUri);

    const url = new URL(config.authUrl);
    url.searchParams.set('client_id', config.clientId);
    url.searchParams.set('redirect_uri', input.redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', config.scopes.join(' '));
    url.searchParams.set('state', input.state);
    url.searchParams.set('code_challenge', input.codeChallenge);
    url.searchParams.set('code_challenge_method', 'S256');
    for (const [key, value] of Object.entries(config.authParams)) url.searchParams.set(key, value);
    return url.toString();
  }

  public async exchange(input: OAuthCompleteInput): Promise<OAuthGrant> {
    const config = this.config(input.provider);
    this.assertRedirectUri(config, input.redirectUri);

    const tokens = await this.requestTokens(config, input);
    const identity = await this.fetchIdentity(config, tokens.accessToken);
    if (tokens.refreshToken === null) {
      throw new MailError(
        400,
        'no_refresh_token',
        'リフレッシュトークンを取得できませんでした。アカウントのアクセス許可を解除してから、もう一度お試しください',
      );
    }
    return { ...identity, refreshToken: tokens.refreshToken };
  }

  private config(provider: MailProviderId): OAuthProviderConfig {
    const config = this.configs.get(provider);
    if (config === undefined) {
      throw new MailError(503, 'provider_not_configured', 'このノードは指定されたメールサービスに対応していません');
    }
    return config;
  }

  private assertRedirectUri(config: OAuthProviderConfig, redirectUri: string): void {
    const match = REDIRECT_URI_PATTERN.exec(redirectUri);
    const port = match ? Number(match[2]) : 0;
    if (match === null || match[1] !== config.redirectHost || port < 1 || port > 65_535) {
      throw new MailError(400, 'invalid_redirect_uri', 'リダイレクトURIの形式が正しくありません');
    }
  }

  private async requestTokens(config: OAuthProviderConfig, input: OAuthCompleteInput): Promise<TokenResponse> {
    const form = new URLSearchParams({
      grant_type: 'authorization_code',
      code: input.code,
      redirect_uri: input.redirectUri,
      client_id: config.clientId,
      code_verifier: input.codeVerifier,
    });
    if (config.clientSecret !== null) form.set('client_secret', config.clientSecret);

    let response: Response;
    try {
      response = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (error) {
      throw reachabilityError(error);
    }

    if (!response.ok) {
      const detail = describeFailure(await response.text());
      throw new MailError(
        400,
        'oauth_failed',
        `トークンの取得に失敗しました (${response.status})${detail ? `: ${detail}` : ''}`,
      );
    }

    const data: unknown = await response.json().catch(() => null);
    if (typeof data !== 'object' || data === null) {
      throw new MailError(502, 'oauth_invalid_response', 'トークンの応答を解釈できません');
    }
    const record = data as Record<string, unknown>;
    if (typeof record.access_token !== 'string') {
      throw new MailError(502, 'oauth_invalid_response', 'トークンの応答にアクセストークンが含まれていません');
    }
    return {
      accessToken: record.access_token,
      refreshToken:
        typeof record.refresh_token === 'string' && record.refresh_token !== '' ? record.refresh_token : null,
    };
  }

  private async fetchIdentity(
    config: OAuthProviderConfig,
    accessToken: string,
  ): Promise<{ email: string; name: string }> {
    let response: Response;
    try {
      response = await fetch(config.userinfoUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (error) {
      throw reachabilityError(error);
    }

    if (!response.ok) {
      throw new MailError(502, 'userinfo_failed', `アカウント情報の取得に失敗しました (${response.status})`);
    }

    const identity = config.parseIdentity(await response.json().catch(() => null));
    if (identity === null) {
      throw new MailError(502, 'userinfo_failed', 'アカウントのメールアドレスを取得できませんでした');
    }
    return identity;
  }
}
