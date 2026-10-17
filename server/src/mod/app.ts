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
import { registerErrorHandler } from './http/errorHandler.js';
import type { Logger } from './logger.js';
import { MailAccountStore } from './mail/accounts/MailAccountStore.js';
import { MailPoller } from './mail/MailPoller.js';
import { MailService } from './mail/MailService.js';
import { ProcessedStore } from './mail/ProcessedStore.js';
import { GmailProvider } from './mail/providers/google/GmailProvider.js';
import { GoogleAccessTokens } from './mail/providers/google/GoogleAccessTokens.js';
import { ProviderRegistry } from './mail/providers/ProviderRegistry.js';
import { MailSettingsStore } from './mail/settings/MailSettingsStore.js';
import { NotificationHub } from './notifications/NotificationHub.js';
import { registerRoutes } from './routes/index.js';
import { loadAppVersion } from './system/appVersion.js';
import { Triage } from './triage/Triage.js';

const ADMIN_KEY_FILE = 'admin-key.json';
const MAIL_ACCOUNTS_FILE = 'mail-accounts.json';
const MAIL_SETTINGS_FILE = 'mail-settings.json';
const MAIL_PROCESSED_FILE = 'mail-processed.json';
const SOCKET_MAX_PAYLOAD_BYTES = 1024;
const REQUIRED_AI_KEYS = ['TYPESAFE_API_KEY', 'ANTHROPIC_API_KEY'] as const;

export const buildApp = async (config: Config): Promise<FastifyInstance> => {
  const app = Fastify({ logger: true });
  await app.register(cors, { origin: true });
  await app.register(websocket, { options: { maxPayload: SOCKET_MAX_PAYLOAD_BYTES } });
  registerErrorHandler(app);

  const logger: Logger = {
    info: (message) => app.log.info(message),
    warn: (message) => app.log.warn(message),
    error: (message, error) => app.log.error({ err: error }, message),
  };

  const version = loadAppVersion();
  const dataPath = (file: string) => path.resolve(config.dataDir, file);

  const adminKeyFile = dataPath(ADMIN_KEY_FILE);
  const adminKeys = new AdminKeyStore(adminKeyFile, config.adminKey);
  const createdKey = await adminKeys.ensure();
  if (createdKey) announceAdminKey(createdKey, adminKeyFile);

  const hub = new NotificationHub(version);
  app.addHook('onClose', async () => hub.close());

  const accounts = new MailAccountStore(dataPath(MAIL_ACCOUNTS_FILE));
  const settings = new MailSettingsStore(dataPath(MAIL_SETTINGS_FILE));
  const processed = new ProcessedStore(dataPath(MAIL_PROCESSED_FILE));
  await Promise.all([accounts.load(), settings.load(), processed.load()]);

  const googleTokens = config.google ? new GoogleAccessTokens(config.google.clientId, config.google.clientSecret) : null;
  const providers = new ProviderRegistry([new GmailProvider(googleTokens, logger)]);
  if (googleTokens === null) {
    logger.warn('GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET が未設定のため、Google アカウントは利用できません');
  }
  for (const key of REQUIRED_AI_KEYS) {
    if (!process.env[key]) logger.warn(`${key} が未設定のため、メールの判定に失敗します`);
  }

  let triage: Triage | null = null;
  const poller = new MailPoller({
    accounts,
    providers,
    settings,
    processed,
    getTriage: () => (triage ??= new Triage(config.triage)),
    publish: (payload) => hub.publish(payload),
    logger,
  });
  app.addHook('onReady', async () => poller.start());
  app.addHook('onClose', async () => poller.stop());

  registerRoutes(app, {
    health: new HealthService(version),
    auth: new AuthService(adminKeys, new TokenStore(), new FailureLimiter()),
    hub,
    mail: new MailService(accounts, providers, settings),
  });

  return app;
};
