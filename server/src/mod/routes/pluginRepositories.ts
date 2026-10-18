import type { FastifyInstance } from 'fastify';
import { requireAdminKey } from '../auth/hooks.js';
import { REPOSITORY_URL_MAX } from '../plugins/repositoryUrl.js';
import type { PluginRepositoryView } from '../plugins/types.js';
import type { RouteDeps } from './index.js';

interface RepositoriesResponse {
  repositories: PluginRepositoryView[];
}

interface RepositoryParams {
  id: string;
}

const paramsSchema = {
  type: 'object',
  required: ['id'],
  properties: { id: { type: 'string', minLength: 1, maxLength: 32 } },
} as const;

const addSchema = {
  body: {
    type: 'object',
    required: ['url'],
    properties: { url: { type: 'string', minLength: 1, maxLength: REPOSITORY_URL_MAX + 64 } },
    additionalProperties: false,
  },
} as const;

export const registerPluginRepositoriesRoute = (app: FastifyInstance, { auth, plugins }: RouteDeps): void => {
  const preHandler = requireAdminKey(auth);

  app.get('/plugin-repositories', { preHandler }, async (): Promise<RepositoriesResponse> => ({
    repositories: await plugins.listRepositories(),
  }));

  app.post<{ Body: { url: string } }>(
    '/plugin-repositories',
    { preHandler, schema: addSchema },
    async (request): Promise<RepositoriesResponse> => ({
      repositories: await plugins.addRepository(request.body.url),
    }),
  );

  app.post<{ Params: RepositoryParams }>(
    '/plugin-repositories/:id/refresh',
    { preHandler, schema: { params: paramsSchema } },
    async (request): Promise<RepositoriesResponse> => ({
      repositories: await plugins.refreshRepository(request.params.id),
    }),
  );

  app.delete<{ Params: RepositoryParams }>(
    '/plugin-repositories/:id',
    { preHandler, schema: { params: paramsSchema } },
    async (request): Promise<RepositoriesResponse> => ({
      repositories: await plugins.removeRepository(request.params.id),
    }),
  );
};
