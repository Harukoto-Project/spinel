import type { FastifyInstance } from 'fastify';
import { requireAdminKey } from '../auth/hooks.js';
import type { SshKeyInfo } from '../ssh/types.js';
import type { RouteDeps } from './index.js';

export const registerSshKeyRoute = (app: FastifyInstance, { auth, sshKey }: RouteDeps): void => {
  const preHandler = requireAdminKey(auth);

  app.get('/ssh-key', { preHandler }, (): Promise<SshKeyInfo> => sshKey.get());

  app.post('/ssh-key/regenerate', { preHandler }, (): Promise<SshKeyInfo> => sshKey.regenerate());
};
