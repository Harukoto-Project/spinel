import { randomUUID } from 'node:crypto';

export const PROTOCOL_VERSION = 1;

export const NOTIFICATION_SOCKET_PATH = '/notifications/ws';

export type NotificationPriority = 'normal' | 'urgent';

export type NotificationKind = 'mail' | 'test';

export interface MailDetail {
  account: string;
  from: string;
  subject: string;
  receivedAt: string;
  summary: string;
  deadline: string | null;
}

export interface NotificationPayload {
  kind: NotificationKind;
  priority: NotificationPriority;
  title: string;
  body: string;
  mail: MailDetail | null;
}

export interface HelloData {
  connectionId: string;
  serverVersion: string;
  heartbeatIntervalSec: number;
}

export interface Envelope<TType extends string, TData> {
  v: typeof PROTOCOL_VERSION;
  type: TType;
  id: string;
  sentAt: string;
  data: TData;
}

export type HelloMessage = Envelope<'hello', HelloData>;

export type NotificationMessage = Envelope<'notification', NotificationPayload>;

export type ServerMessage = HelloMessage | NotificationMessage;

export const createEnvelope = <TType extends ServerMessage['type'], TData>(
  type: TType,
  data: TData,
): Envelope<TType, TData> => ({
  v: PROTOCOL_VERSION,
  type,
  id: randomUUID(),
  sentAt: new Date().toISOString(),
  data,
});

export interface TokenResponse {
  token: string;
  expiresAt: string;
  ttlSec: number;
  socketPath: typeof NOTIFICATION_SOCKET_PATH;
}

export interface TestNotificationRequest {
  priority?: NotificationPriority;
}

export interface TestNotificationResponse {
  delivered: number;
}
