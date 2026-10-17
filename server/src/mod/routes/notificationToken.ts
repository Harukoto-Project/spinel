import type { FastifyInstance } from 'fastify';
import { requireAdminKey } from '../auth/hooks.js';
import { NOTIFICATION_SOCKET_PATH, type TokenResponse } from '../notifications/protocol.js';
import type { RouteDeps } from './index.js';

export const registerNotificationTokenRoute = (app: FastifyInstance, { auth }: RouteDeps): void => {
  app.post(
    '/notifications/token',
    { preHandler: requireAdminKey(auth) },
    async (_request, reply): Promise<TokenResponse> => {
      reply.header('Cache-Control', 'no-store');
      const issued = auth.issueToken();
      return {
        token: issued.token,
        expiresAt: issued.expiresAt.toISOString(),
        ttlSec: issued.ttlSec,
        socketPath: NOTIFICATION_SOCKET_PATH,
      };
    },
  );
};
