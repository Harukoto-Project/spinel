import type { FastifyInstance } from 'fastify';
import { requireAdminKey } from '../auth/hooks.js';
import type { MailHistoryEntry } from '../mail/types.js';
import type { RouteDeps } from './index.js';

interface HistoryResponse {
  history: MailHistoryEntry[];
}

export const registerMailHistoryRoute = (app: FastifyInstance, { auth, mail }: RouteDeps): void => {
  const preHandler = requireAdminKey(auth);

  app.get('/mail/history', { preHandler }, async (): Promise<HistoryResponse> => ({
    history: await mail.listHistory(),
  }));

  app.delete('/mail/history', { preHandler }, async (): Promise<HistoryResponse> => ({
    history: await mail.clearHistory(),
  }));

  app.delete<{ Params: { id: string } }>(
    '/mail/history/:id',
    { preHandler },
    async (request): Promise<HistoryResponse> => ({
      history: await mail.removeHistory(request.params.id),
    }),
  );
};
