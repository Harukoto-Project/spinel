import path from 'node:path';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import Fastify, { type FastifyInstance } from 'fastify';
import { AdminKeyStore } from './auth/AdminKeyStore.js';
import { AuthService } from './auth/AuthService.js';
import { FailureLimiter } from './auth/FailureLimiter.js';
import { TokenStore } from './auth/TokenStore.js';
import { announceAdminKey } from './auth/announceAdminKey.js';
import type { Config } from './config.js';
import { HealthService } from './health/HealthService.js';
import { NotificationHub } from './notifications/NotificationHub.js';
import { registerRoutes } from './routes/index.js';
import { loadAppVersion } from './system/appVersion.js';

const ADMIN_KEY_FILE = 'admin-key.json';
const SOCKET_MAX_PAYLOAD_BYTES = 1024;

export const buildApp = async (config: Config): Promise<FastifyInstance> => {
  const app = Fastify({ logger: true });
  await app.register(cors, { origin: true });
  await app.register(websocket, { options: { maxPayload: SOCKET_MAX_PAYLOAD_BYTES } });

  const version = loadAppVersion();

  const adminKeyFile = path.resolve(config.dataDir, ADMIN_KEY_FILE);
  const adminKeys = new AdminKeyStore(adminKeyFile, config.adminKey);
  const createdKey = await adminKeys.ensure();
  if (createdKey) announceAdminKey(createdKey, adminKeyFile);

  const hub = new NotificationHub(version);
  app.addHook('onClose', async () => hub.close());

  registerRoutes(app, {
    health: new HealthService(version),
    auth: new AuthService(adminKeys, new TokenStore(), new FailureLimiter()),
    hub,
  });

  return app;
};
