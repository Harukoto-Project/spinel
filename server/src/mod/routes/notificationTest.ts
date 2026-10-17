import type { FastifyInstance } from 'fastify';
import { requireAdminKey } from '../auth/hooks.js';
import type { TestNotificationRequest, TestNotificationResponse } from '../notifications/protocol.js';
import { buildTestNotification } from '../notifications/testNotification.js';
import type { RouteDeps } from './index.js';

export const registerNotificationTestRoute = (app: FastifyInstance, { auth, hub }: RouteDeps): void => {
  app.post<{ Body: TestNotificationRequest | undefined }>(
    '/notifications/test',
    {
      preHandler: requireAdminKey(auth),
      schema: {
        body: {
          type: 'object',
          properties: { priority: { type: 'string', enum: ['normal', 'urgent'] } },
          additionalProperties: false,
        },
      },
    },
    async (request): Promise<TestNotificationResponse> => {
      const priority = request.body?.priority ?? 'normal';
      return { delivered: hub.publish(buildTestNotification(priority)) };
    },
  );
};
