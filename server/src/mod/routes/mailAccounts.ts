import type { FastifyInstance } from 'fastify';
import { requireAdminKey } from '../auth/hooks.js';
import type { MailAccountView } from '../mail/types.js';
import type { RouteDeps } from './index.js';

interface AccountsResponse {
  accounts: MailAccountView[];
}

export const registerMailAccountsRoute = (app: FastifyInstance, { auth, mail }: RouteDeps): void => {
  const preHandler = requireAdminKey(auth);

  app.get('/mail/accounts', { preHandler }, async (): Promise<AccountsResponse> => ({
    accounts: await mail.listAccounts(),
  }));

  app.delete<{ Params: { id: string } }>(
    '/mail/accounts/:id',
    { preHandler },
    async (request): Promise<AccountsResponse> => ({
      accounts: await mail.removeAccount(request.params.id),
    }),
  );
};
