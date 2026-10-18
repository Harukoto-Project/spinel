import type { OutlookOAuthConfig } from '../../config.js';
import type { OAuthIdentity, OAuthProviderConfig } from './types.js';
import { nameFromEmail, readString } from './readString.js';

const parseIdentity = (value: unknown): OAuthIdentity | null => {
  const email = readString(value, 'mail') ?? readString(value, 'userPrincipalName');
  if (email === null) return null;
  return { email, name: readString(value, 'displayName') ?? nameFromEmail(email) };
};

export const createOutlookOAuth = (config: OutlookOAuthConfig): OAuthProviderConfig => ({
  id: 'outlook',
  redirectHost: 'localhost',
  clientId: config.clientId,
  clientSecret: null,
  authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
  tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
  userinfoUrl: 'https://graph.microsoft.com/v1.0/me?$select=displayName,mail,userPrincipalName',
  scopes: [
    'openid',
    'offline_access',
    'https://graph.microsoft.com/User.Read',
    'https://graph.microsoft.com/Mail.Read',
  ],
  authParams: { prompt: 'select_account' },
  parseIdentity,
});
