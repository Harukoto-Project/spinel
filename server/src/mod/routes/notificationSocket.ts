import type { FastifyInstance } from 'fastify';
import { requireSocketToken } from '../auth/hooks.js';
import { NOTIFICATION_SOCKET_PATH } from '../notifications/protocol.js';
import type { RouteDeps } from './index.js';

export const registerNotificationSocketRoute = (app: FastifyInstance, { auth, hub }: RouteDeps): void => {
  app.get(NOTIFICATION_SOCKET_PATH, { websocket: true, preValidation: requireSocketToken(auth) }, (socket) => {
    hub.attach(socket);
  });
};
