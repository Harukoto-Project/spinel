import type { FastifyInstance } from 'fastify';
import { requireAdminKey } from '../auth/hooks.js';
import type { RouteDeps } from './index.js';

interface FrontParams {
  id: string;
  '*': string;
}

export const registerPluginFrontRoute = (app: FastifyInstance, { auth, plugins }: RouteDeps): void => {
  const preHandler = requireAdminKey(auth);

  app.get<{ Params: FrontParams }>('/plugins/:id/front/*', { preHandler }, async (request, reply) => {
    const asset = await plugins.readFrontAsset(request.params.id, request.params['*']);
    return reply.header('Cache-Control', 'no-store').type(asset.contentType).send(asset.data);
  });
};
