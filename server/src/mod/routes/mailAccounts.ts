import type { FastifyInstance } from 'fastify';
import { requireAdminKey } from '../auth/hooks.js';
import { MAIL_PROVIDER_IDS, type ConnectMailAccountInput, type MailAccountView } from '../mail/types.js';
import type { RouteDeps } from './index.js';

interface AccountsResponse {
  accounts: MailAccountView[];
}

const connectSchema = {
  body: {
    type: 'object',
    required: ['provider', 'email', 'name', 'refreshToken'],
    properties: {
      provider: { type: 'string', enum: [...MAIL_PROVIDER_IDS] },
      email: { type: 'string', minLength: 3, maxLength: 320 },
      name: { type: 'string', minLength: 1, maxLength: 200 },
      refreshToken: { type: 'string', minLength: 1, maxLength: 8192 },
    },
    additionalProperties: false,
  },
} as const;

export const registerMailAccountsRoute = (app: FastifyInstance, { auth, mail }: RouteDeps): void => {
  const preHandler = requireAdminKey(auth);

  app.get('/mail/accounts', { preHandler }, async (): Promise<AccountsResponse> => ({
    accounts: mail.listAccounts(),
  }));

  app.post<{ Body: ConnectMailAccountInput }>(
    '/mail/accounts',
    { preHandler, schema: connectSchema },
    async (request): Promise<AccountsResponse> => ({
      accounts: await mail.connectAccount(request.body),
    }),
  );

  app.delete<{ Params: { id: string } }>(
    '/mail/accounts/:id',
    { preHandler },
    async (request): Promise<AccountsResponse> => ({
      accounts: await mail.removeAccount(request.params.id),
    }),
  );
};
