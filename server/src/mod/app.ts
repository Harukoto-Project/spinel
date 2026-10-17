import cors from '@fastify/cors';
import Fastify, { type FastifyInstance } from 'fastify';
import { HealthService } from './health/HealthService.js';
import { registerRoutes } from './routes/index.js';
import { loadAppVersion } from './system/appVersion.js';

export const buildApp = async (): Promise<FastifyInstance> => {
  const app = Fastify({ logger: true });
  await app.register(cors, { origin: true });

  registerRoutes(app, { health: new HealthService(loadAppVersion()) });

  return app;
};
