import type { FastifyInstance } from 'fastify';
import { requireAdminKey } from '../auth/hooks.js';
import { API_KEY_IDS, API_KEY_VALUE_MAX, type ApiKeyId, type ApiKeyStatusMap } from '../apiKeys/types.js';
import type { RouteDeps } from './index.js';

interface KeysResponse {
  keys: ApiKeyStatusMap;
}

interface KeyParams {
  id: ApiKeyId;
}

const paramsSchema = {
  type: 'object',
  required: ['id'],
  properties: { id: { type: 'string', enum: [...API_KEY_IDS] } },
} as const;

const saveSchema = {
  params: paramsSchema,
  body: {
    type: 'object',
    required: ['value'],
    properties: { value: { type: 'string', minLength: 1, maxLength: API_KEY_VALUE_MAX + 64 } },
    additionalProperties: false,
  },
} as const;

export const registerApiKeysRoute = (app: FastifyInstance, { auth, apiKeys }: RouteDeps): void => {
  const preHandler = requireAdminKey(auth);

  app.get('/api-keys', { preHandler }, async (): Promise<KeysResponse> => ({
    keys: await apiKeys.status(),
  }));

  app.put<{ Params: KeyParams; Body: { value: string } }>(
    '/api-keys/:id',
    { preHandler, schema: saveSchema },
    async (request): Promise<KeysResponse> => ({
      keys: await apiKeys.set(request.params.id, request.body.value),
    }),
  );

  app.delete<{ Params: KeyParams }>(
    '/api-keys/:id',
    { preHandler, schema: { params: paramsSchema } },
    async (request): Promise<KeysResponse> => ({
      keys: await apiKeys.remove(request.params.id),
    }),
  );
};
