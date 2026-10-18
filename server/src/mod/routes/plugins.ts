import type { FastifyInstance } from 'fastify';
import { requireAdminKey } from '../auth/hooks.js';
import type { PluginPermissions, PluginView } from '../plugins/types.js';
import type { RouteDeps } from './index.js';

interface PluginsResponse {
  plugins: PluginView[];
}

interface PluginParams {
  id: string;
}

const paramsSchema = {
  type: 'object',
  required: ['id'],
  properties: { id: { type: 'string', minLength: 1, maxLength: 64 } },
} as const;

const enableSchema = {
  params: paramsSchema,
  body: {
    type: 'object',
    required: ['grantedPermissions'],
    properties: {
      grantedPermissions: {
        type: 'object',
        required: ['routes', 'storage', 'notify', 'process', 'build', 'network'],
        properties: {
          routes: { type: 'boolean' },
          storage: { type: 'boolean' },
          notify: { type: 'boolean' },
          process: { type: 'boolean' },
          build: { type: 'boolean' },
          network: { type: 'array', maxItems: 32, items: { type: 'string', minLength: 1, maxLength: 512 } },
        },
        additionalProperties: false,
      },
    },
    additionalProperties: false,
  },
} as const;

export const registerPluginsRoute = (app: FastifyInstance, { auth, plugins }: RouteDeps): void => {
  const preHandler = requireAdminKey(auth);

  app.get('/plugins', { preHandler }, async (): Promise<PluginsResponse> => ({
    plugins: await plugins.listPlugins(),
  }));

  app.post<{ Params: PluginParams; Body: { grantedPermissions: PluginPermissions } }>(
    '/plugins/:id/enable',
    { preHandler, schema: enableSchema },
    async (request): Promise<PluginsResponse> => ({
      plugins: await plugins.enablePlugin(request.params.id, request.body.grantedPermissions),
    }),
  );

  app.post<{ Params: PluginParams }>(
    '/plugins/:id/disable',
    { preHandler, schema: { params: paramsSchema } },
    async (request): Promise<PluginsResponse> => ({
      plugins: await plugins.disablePlugin(request.params.id),
    }),
  );
};
