import type { FastifyInstance } from 'fastify';
import { requireAdminKey } from '../auth/hooks.js';
import type { OAuthCompleteInput, OAuthStartInput } from '../mail/oauth/types.js';
import { MAIL_PROVIDER_IDS, type MailAccountView } from '../mail/types.js';
import type { RouteDeps } from './index.js';

interface StartResponse {
  authUrl: string;
}

interface AccountsResponse {
  accounts: MailAccountView[];
}

const providerSchema = { type: 'string', enum: [...MAIL_PROVIDER_IDS] } as const;
const redirectUriSchema = { type: 'string', minLength: 1, maxLength: 64 } as const;

const startSchema = {
  body: {
    type: 'object',
    required: ['provider', 'redirectUri', 'state', 'codeChallenge'],
    properties: {
      provider: providerSchema,
      redirectUri: redirectUriSchema,
      state: { type: 'string', minLength: 16, maxLength: 256 },
      codeChallenge: { type: 'string', pattern: '^[A-Za-z0-9_-]{43,128}$' },
    },
    additionalProperties: false,
  },
} as const;

const completeSchema = {
  body: {
    type: 'object',
    required: ['provider', 'code', 'codeVerifier', 'redirectUri'],
    properties: {
      provider: providerSchema,
      code: { type: 'string', minLength: 1, maxLength: 2048 },
      codeVerifier: { type: 'string', minLength: 32, maxLength: 256 },
      redirectUri: redirectUriSchema,
    },
    additionalProperties: false,
  },
} as const;

export const registerMailOAuthRoute = (app: FastifyInstance, { auth, mail }: RouteDeps): void => {
  const preHandler = requireAdminKey(auth);

  app.post<{ Body: OAuthStartInput }>(
    '/mail/oauth/start',
    { preHandler, schema: startSchema },
    async (request): Promise<StartResponse> => mail.startOAuth(request.body),
  );

  app.post<{ Body: OAuthCompleteInput }>(
    '/mail/oauth/complete',
    { preHandler, schema: completeSchema },
    async (request): Promise<AccountsResponse> => ({
      accounts: await mail.completeOAuth(request.body),
    }),
  );
};
