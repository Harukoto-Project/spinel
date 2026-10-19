import { createHash } from 'node:crypto';

export const PUBLIC_KEY_PREFIX = 'ssh-ed25519 ';

export const fingerprintOf = (publicKey: string): string => {
  const blob = Buffer.from(publicKey.trim().split(/\s+/)[1] ?? '', 'base64');
  return `SHA256:${createHash('sha256').update(blob).digest('base64').replace(/=+$/, '')}`;
};
