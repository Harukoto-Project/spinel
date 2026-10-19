import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import Fastify, { type FastifyInstance } from 'fastify';
import path from 'node:path';
import { ApiKeyService } from './apiKeys/ApiKeyService.js';
import { ApiKeyStore } from './apiKeys/ApiKeyStore.js';
import { AdminKeyStore } from './auth/AdminKeyStore.js';
import { AuthService } from './auth/AuthService.js';
import { FailureLimiter } from './auth/FailureLimiter.js';
import { TokenStore } from './auth/TokenStore.js';
import { announceAdminKey } from './auth/announceAdminKey.js';
import type { Config } from './config.js';
import { createDatabase } from './db/Database.js';
import { importLegacyData } from './db/legacy/importLegacyData.js';
import { runMigrations } from './db/runMigrations.js';
import { HealthService } from './health/HealthService.js';
import { registerErrorHandler } from './http/errorHandler.js';
import type { Logger } from './logger.js';
import { MailAccountStore } from './mail/accounts/MailAccountStore.js';
import { MailHistoryStore } from './mail/history/MailHistoryStore.js';
import { MailPoller } from './mail/MailPoller.js';
import { MailService } from './mail/MailService.js';
import { createGoogleOAuth } from './mail/oauth/google.js';
import { OAuthService } from './mail/oauth/OAuthService.js';
import { createOutlookOAuth } from './mail/oauth/outlook.js';
import { ProcessedStore } from './mail/ProcessedStore.js';
import { GmailProvider } from './mail/providers/google/GmailProvider.js';
import { GoogleAccessTokens } from './mail/providers/google/GoogleAccessTokens.js';
import { OutlookAccessTokens } from './mail/providers/outlook/OutlookAccessTokens.js';
import { OutlookProvider } from './mail/providers/outlook/OutlookProvider.js';
import { ProviderRegistry } from './mail/providers/ProviderRegistry.js';
import { MailSettingsStore } from './mail/settings/MailSettingsStore.js';
import { NotificationHub } from './notifications/NotificationHub.js';
import { GitClient } from './plugins/GitClient.js';
import { SshKeyService } from './ssh/SshKeyService.js';
import { PluginAppRuntime } from './plugins/app/PluginAppRuntime.js';
import { PluginSourceManager } from './plugins/app/PluginSourceManager.js';
import { PluginInstaller } from './plugins/PluginInstaller.js';
import { PluginLoader } from './plugins/PluginLoader.js';
import { PluginProcessManager } from './plugins/process/PluginProcessManager.js';
import { PluginService } from './plugins/PluginService.js';
import { registerRoutes } from './routes/index.js';
import { loadAppVersion } from './system/appVersion.js';
import { TriageProvider } from './triage/TriageProvider.js';

const SOCKET_MAX_PAYLOAD_BYTES = 1024;

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

  const db = createDatabase(config.databaseUrl);
  app.addHook('onClose', async () => db.end());
  try {
    await runMigrations(db, logger);
    await importLegacyData(db, config.dataDir, logger);
  } catch (error) {
    await db.end().catch(() => undefined);
    throw error;
  }

  const adminKeys = new AdminKeyStore(db, config.adminKey);
  const createdKey = await adminKeys.ensure();
  if (createdKey) announceAdminKey(createdKey);

  const hub = new NotificationHub(version);
  app.addHook('onClose', async () => hub.close());

  const accounts = new MailAccountStore(db);
  const settings = new MailSettingsStore(db);
  const processed = new ProcessedStore(db);
  const history = new MailHistoryStore(db);

  const googleTokens = config.google
    ? new GoogleAccessTokens(config.google.clientId, config.google.clientSecret)
    : null;
  const outlookTokens = config.outlook
    ? new OutlookAccessTokens(
        config.outlook.clientId,
        async (previous, next) => {
          const account = (await accounts.list()).find((candidate) => candidate.refreshToken === previous);
          if (account) await accounts.update(account.id, { refreshToken: next });
        },
        logger,
      )
    : null;
  const providers = new ProviderRegistry([
    new GmailProvider(googleTokens, logger),
    new OutlookProvider(outlookTokens, logger),
  ]);
  if (googleTokens === null) {
    logger.warn('GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET が未設定のため、Google アカウントは利用できません');
  }
  if (outlookTokens === null) {
    logger.warn('OUTLOOK_CLIENT_ID が未設定のため、Outlook アカウントは利用できません');
  }

  const oauth = new OAuthService([
    ...(config.google ? [createGoogleOAuth(config.google)] : []),
    ...(config.outlook ? [createOutlookOAuth(config.outlook)] : []),
  ]);

  const apiKeys = new ApiKeyService(new ApiKeyStore(db), config.apiKeys);
  const triageProvider = new TriageProvider(config.triage, apiKeys);

  const poller = new MailPoller({
    accounts,
    providers,
    settings,
    processed,
    history,
    getTriage: () => triageProvider.get(),
    publish: (payload) => hub.publish(payload),
    logger,
  });
  app.addHook('onReady', async () => poller.start());
  app.addHook('onClose', async () => poller.stop());

  const sshKey = new SshKeyService(path.resolve(config.dataDir, 'ssh'), logger);
  const gitClient = new GitClient(sshKey);
  const pluginInstaller = new PluginInstaller(path.resolve(config.dataDir, 'plugins', 'repos'), gitClient);
  const pluginProcesses = new PluginProcessManager(logger);
  const pluginApp = new PluginAppRuntime({
    db,
    installer: pluginInstaller,
    sources: new PluginSourceManager(path.resolve(config.dataDir, 'plugins', 'sources'), gitClient, db),
    processes: pluginProcesses,
    dataRoot: path.resolve(config.dataDir, 'plugins', 'data'),
    logger,
  });
  const pluginLoader = new PluginLoader({
    db,
    installer: pluginInstaller,
    processes: pluginProcesses,
    app: pluginApp,
    publish: (payload) => hub.publish(payload),
    logger,
  });
  const pluginService = new PluginService(db, pluginInstaller, pluginLoader, pluginApp, logger);
  app.addHook('onReady', async () => pluginLoader.loadAll());
  app.addHook('onClose', async () => pluginLoader.unloadAll());

  registerRoutes(app, {
    health: new HealthService(version),
    auth: new AuthService(adminKeys, new TokenStore(), new FailureLimiter()),
    hub,
    mail: new MailService(accounts, providers, settings, history, oauth),
    apiKeys,
    plugins: pluginService,
    sshKey,
  });

  return app;
};
