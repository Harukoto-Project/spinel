import type { MailProviderId } from '../types.js';

export interface OAuthIdentity {
  email: string;
  name: string;
}

export interface OAuthGrant extends OAuthIdentity {
  refreshToken: string;
}

export type OAuthRedirectHost = '127.0.0.1' | 'localhost';

export interface OAuthProviderConfig {
  id: MailProviderId;
  redirectHost: OAuthRedirectHost;
  clientId: string;
  clientSecret: string | null;
  authUrl: string;
  tokenUrl: string;
  userinfoUrl: string;
  scopes: readonly string[];
  authParams: Readonly<Record<string, string>>;
  parseIdentity: (value: unknown) => OAuthIdentity | null;
}

export interface OAuthStartInput {
  provider: MailProviderId;
  redirectUri: string;
  state: string;
  codeChallenge: string;
}

export interface OAuthCompleteInput {
  provider: MailProviderId;
  code: string;
  codeVerifier: string;
  redirectUri: string;
}
