import type { FastifyInstance } from 'fastify';
import { requireAdminKey } from '../auth/hooks.js';
import type { AppOverview, LogChunk, SetupView, SourceView, TaskView } from '../plugins/app/appRuntimeTypes.js';
import type { RouteDeps } from './index.js';

interface PluginParams {
  id: string;
}

interface StepParams extends PluginParams {
  stepId: string;
}

interface CommandParams extends PluginParams {
  commandId: string;
}

interface LogsQuery {
  after?: number;
}

interface RunBody {
  inputs?: Record<string, unknown>;
}

const idSchema = { type: 'string', minLength: 1, maxLength: 64 } as const;

const pluginParams = {
  type: 'object',
  required: ['id'],
  properties: { id: idSchema },
} as const;

const stepParams = {
  type: 'object',
  required: ['id', 'stepId'],
  properties: { id: idSchema, stepId: idSchema },
} as const;

const commandParams = {
  type: 'object',
  required: ['id', 'commandId'],
  properties: { id: idSchema, commandId: idSchema },
} as const;

const logsQuery = {
  type: 'object',
  properties: { after: { type: 'integer', minimum: 0 } },
  additionalProperties: false,
} as const;

const runBody = {
  type: 'object',
  properties: { inputs: { type: 'object', maxProperties: 16 } },
  additionalProperties: false,
} as const;

export const registerPluginAppRoute = (app: FastifyInstance, { auth, plugins }: RouteDeps): void => {
  const preHandler = requireAdminKey(auth);

  app.get<{ Params: PluginParams }>(
    '/plugins/:id/app',
    { preHandler, schema: { params: pluginParams } },
    (request): Promise<AppOverview> => plugins.appOverview(request.params.id),
  );

  app.post<{ Params: PluginParams }>(
    '/plugins/:id/app/source/update',
    { preHandler, schema: { params: pluginParams } },
    async (request): Promise<{ source: SourceView }> => ({ source: await plugins.updateAppSource(request.params.id) }),
  );

  app.post<{ Params: PluginParams }>(
    '/plugins/:id/app/setup/run',
    { preHandler, schema: { params: pluginParams } },
    async (request): Promise<{ setup: SetupView }> => ({ setup: await plugins.runAppSetup(request.params.id) }),
  );

  app.get<{ Params: StepParams; Querystring: LogsQuery }>(
    '/plugins/:id/app/setup/steps/:stepId/logs',
    { preHandler, schema: { params: stepParams, querystring: logsQuery } },
    (request): Promise<LogChunk> =>
      plugins.readAppSetupLogs(request.params.id, request.params.stepId, request.query.after ?? 0),
  );

  app.post<{ Params: CommandParams; Body: RunBody | undefined }>(
    '/plugins/:id/app/commands/:commandId/run',
    { preHandler, schema: { params: commandParams, body: runBody } },
    async (request): Promise<{ task: TaskView }> => ({
      task: await plugins.runAppTask(request.params.id, request.params.commandId, request.body?.inputs ?? {}),
    }),
  );

  app.post<{ Params: CommandParams }>(
    '/plugins/:id/app/commands/:commandId/stop',
    { preHandler, schema: { params: commandParams } },
    async (request): Promise<{ task: TaskView }> => ({
      task: await plugins.stopAppTask(request.params.id, request.params.commandId),
    }),
  );

  app.get<{ Params: CommandParams; Querystring: LogsQuery }>(
    '/plugins/:id/app/commands/:commandId/logs',
    { preHandler, schema: { params: commandParams, querystring: logsQuery } },
    (request): Promise<{ logs: LogChunk; task: TaskView }> =>
      plugins.readAppTaskLogs(request.params.id, request.params.commandId, request.query.after ?? 0),
  );

  app.post<{ Params: CommandParams; Body: RunBody | undefined }>(
    '/plugins/:id/app/commands/:commandId/query',
    { preHandler, schema: { params: commandParams, body: runBody } },
    async (request): Promise<{ data: unknown }> => ({
      data: await plugins.runAppQuery(request.params.id, request.params.commandId, request.body?.inputs ?? {}),
    }),
  );
};
