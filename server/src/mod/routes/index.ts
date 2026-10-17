import type { FastifyInstance } from 'fastify';
import type { AuthService } from '../auth/AuthService.js';
import type { HealthService } from '../health/HealthService.js';
import type { NotificationHub } from '../notifications/NotificationHub.js';
import { registerHealthRoute } from './health.js';
import { registerNotificationSocketRoute } from './notificationSocket.js';
import { registerNotificationTestRoute } from './notificationTest.js';
import { registerNotificationTokenRoute } from './notificationToken.js';

export interface RouteDeps {
  health: HealthService;
  auth: AuthService;
  hub: NotificationHub;
}

export const registerRoutes = (app: FastifyInstance, deps: RouteDeps): void => {
  registerHealthRoute(app, deps);
  registerNotificationTokenRoute(app, deps);
  registerNotificationTestRoute(app, deps);
  registerNotificationSocketRoute(app, deps);
};
