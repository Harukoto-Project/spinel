import type { FastifyInstance } from 'fastify';
import type { HealthService } from '../health/HealthService.js';
import { registerHealthRoute } from './health.js';

export interface RouteDeps {
  health: HealthService;
}

export const registerRoutes = (app: FastifyInstance, deps: RouteDeps): void => {
  registerHealthRoute(app, deps);
};
