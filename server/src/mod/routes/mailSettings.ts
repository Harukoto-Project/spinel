import type { FastifyInstance } from 'fastify';
import { requireAdminKey } from '../auth/hooks.js';
import { POLL_INTERVAL_SEC_MAX, POLL_INTERVAL_SEC_MIN, type MailSettings } from '../mail/types.js';
import type { RouteDeps } from './index.js';

const updateSchema = {
  body: {
    type: 'object',
    required: ['pollIntervalSec'],
    properties: {
      pollIntervalSec: { type: 'integer', minimum: POLL_INTERVAL_SEC_MIN, maximum: POLL_INTERVAL_SEC_MAX },
    },
    additionalProperties: false,
  },
} as const;

export const registerMailSettingsRoute = (app: FastifyInstance, { auth, mail }: RouteDeps): void => {
  const preHandler = requireAdminKey(auth);

  app.get('/mail/settings', { preHandler }, async (): Promise<MailSettings> => mail.getSettings());

  app.put<{ Body: MailSettings }>(
    '/mail/settings',
    { preHandler, schema: updateSchema },
    async (request): Promise<MailSettings> => mail.updateSettings(request.body),
  );
};
