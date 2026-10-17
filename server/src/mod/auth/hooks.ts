import type { FastifyReply, FastifyRequest } from 'fastify';
import { apiError } from '../http/apiError.js';
import type { AuthResult, AuthService } from './AuthService.js';

const reject = (reply: FastifyReply, result: Exclude<AuthResult, 'ok'>, message: string): FastifyReply => {
  if (result === 'limited') {
    return reply
      .code(429)
      .header('Retry-After', '60')
      .send(apiError('too_many_attempts', '認証の失敗が続いたため、しばらくお待ちください'));
  }
  return reply.code(401).header('WWW-Authenticate', 'Bearer').send(apiError('unauthorized', message));
};

export const requireAdminKey = (auth: AuthService) => async (request: FastifyRequest, reply: FastifyReply) => {
  const result = auth.authenticateAdmin(request.ip, request.headers.authorization);
  if (result !== 'ok') return reject(reply, result, '管理キーが正しくありません');
};

export const requireSocketToken = (auth: AuthService) => async (request: FastifyRequest, reply: FastifyReply) => {
  const result = auth.authenticateToken(request.ip, request.headers.authorization);
  if (result !== 'ok') return reject(reply, result, 'トークンが無効か、有効期限が切れています');
};
