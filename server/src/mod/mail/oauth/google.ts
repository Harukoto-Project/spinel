import type { GoogleOAuthConfig } from '../../config.js';
import type { OAuthIdentity, OAuthProviderConfig } from './types.js';
import { nameFromEmail, readString } from './readString.js';

const parseIdentity = (value: unknown): OAuthIdentity | null => {
  const email = readString(value, 'email');
  if (email === null) return null;
  return { email, name: readString(value, 'name') ?? nameFromEmail(email) };
};

export const createGoogleOAuth = (config: GoogleOAuthConfig): OAuthProviderConfig => ({
  id: 'google',
  redirectHost: '127.0.0.1',
  clientId: config.clientId,
  clientSecret: config.clientSecret,
  authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenUrl: 'https://oauth2.googleapis.com/token',
  userinfoUrl: 'https://openidconnect.googleapis.com/v1/userinfo',
  scopes: ['openid', 'email', 'profile', 'https://www.googleapis.com/auth/gmail.readonly'],
  authParams: { access_type: 'offline', prompt: 'consent' },
  parseIdentity,
});
