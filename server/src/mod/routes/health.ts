import type { FastifyInstance } from 'fastify';
import type { RouteDeps } from './index.js';

export const registerHealthRoute = (app: FastifyInstance, { health }: RouteDeps): void => {
  app.get('/health', async (_request, reply) => {
    reply.header('Cache-Control', 'no-store');
    return health.report();
  });
};
