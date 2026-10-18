import type { FastifyError, FastifyInstance } from 'fastify';
import { apiError } from './apiError.js';
import { HttpError } from './HttpError.js';

export const registerErrorHandler = (app: FastifyInstance): void => {
  app.setErrorHandler<FastifyError>((error, _request, reply) => {
    if (error instanceof HttpError) {
      return reply.code(error.status).send(apiError(error.code, error.message));
    }
    if (error.validation) {
      return reply.code(400).send(apiError('invalid_request', error.message));
    }
    return reply.send(error);
  });
};
