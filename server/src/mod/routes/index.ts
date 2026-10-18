import type { FastifyInstance } from 'fastify';
import type { ApiKeyService } from '../apiKeys/ApiKeyService.js';
import type { AuthService } from '../auth/AuthService.js';
import type { HealthService } from '../health/HealthService.js';
import type { MailService } from '../mail/MailService.js';
import type { NotificationHub } from '../notifications/NotificationHub.js';
import { registerApiKeysRoute } from './apiKeys.js';
import { registerHealthRoute } from './health.js';
import { registerMailAccountsRoute } from './mailAccounts.js';
import { registerMailHistoryRoute } from './mailHistory.js';
import { registerMailOAuthRoute } from './mailOAuth.js';
import { registerMailSettingsRoute } from './mailSettings.js';
import { registerNotificationSocketRoute } from './notificationSocket.js';
import { registerNotificationTestRoute } from './notificationTest.js';
import { registerNotificationTokenRoute } from './notificationToken.js';

export interface RouteDeps {
  health: HealthService;
  auth: AuthService;
  hub: NotificationHub;
  mail: MailService;
  apiKeys: ApiKeyService;
}

export const registerRoutes = (app: FastifyInstance, deps: RouteDeps): void => {
  registerHealthRoute(app, deps);
  registerNotificationTokenRoute(app, deps);
  registerNotificationTestRoute(app, deps);
  registerNotificationSocketRoute(app, deps);
  registerMailAccountsRoute(app, deps);
  registerMailOAuthRoute(app, deps);
  registerMailSettingsRoute(app, deps);
  registerMailHistoryRoute(app, deps);
  registerApiKeysRoute(app, deps);
};
