import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { requireAdminKey } from '../auth/hooks.js';
import { HttpError } from '../http/HttpError.js';
import type { RouteDeps } from './index.js';

type DispatchRequest = FastifyRequest<{ Params: { id: string; '*'?: string } }>;

const METHODS = ['GET', 'POST', 'PUT', 'DELETE'] as const;

export const registerPluginDispatchRoute = (app: FastifyInstance, { auth, plugins }: RouteDeps): void => {
  const preHandler = requireAdminKey(auth);

  const handler = async (request: DispatchRequest, reply: FastifyReply): Promise<unknown> => {
    const { id } = request.params;
    const match = plugins.findRoute(id, request.method, request.params['*'] ?? '');
    if (match === null) throw new HttpError(404, 'plugin_route_not_found', 'プラグインのエンドポイントが見つかりません');

    (request as { params: unknown }).params = { ...match.params };
    try {
      const result = await match.handler(request, reply);
      if (reply.sent) return reply;
      if (result === undefined) return reply.code(204).send();
      return result;
    } catch (error) {
      if (error instanceof HttpError) throw error;
      request.log.error({ err: error, plugin: id }, 'プラグインのエンドポイントでエラーが発生しました');
      throw new HttpError(500, 'plugin_error', 'プラグインの処理中にエラーが発生しました');
    }
  };

  app.route({ method: [...METHODS], url: '/plugins/:id', preHandler, handler });
  app.route({ method: [...METHODS], url: '/plugins/:id/*', preHandler, handler });
};
