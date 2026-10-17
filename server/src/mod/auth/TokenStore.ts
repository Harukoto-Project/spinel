import { createHash, randomBytes } from 'node:crypto';

const TOKEN_TTL_MS = 30_000;
const MAX_TOKENS = 1000;

export interface IssuedToken {
  token: string;
  expiresAt: Date;
  ttlSec: number;
}

const digest = (token: string): string => createHash('sha256').update(token).digest('hex');

export class TokenStore {
  private readonly tokens = new Map<string, number>();

  public issue(now: number = Date.now()): IssuedToken {
    this.prune(now);
    while (this.tokens.size >= MAX_TOKENS) {
      const oldest = this.tokens.keys().next().value;
      if (oldest === undefined) break;
      this.tokens.delete(oldest);
    }

    const token = randomBytes(32).toString('base64url');
    const expiresAt = now + TOKEN_TTL_MS;
    this.tokens.set(digest(token), expiresAt);
    return { token, expiresAt: new Date(expiresAt), ttlSec: TOKEN_TTL_MS / 1000 };
  }

  public consume(token: string, now: number = Date.now()): boolean {
    this.prune(now);
    return this.tokens.delete(digest(token));
  }

  private prune(now: number): void {
    for (const [key, expiresAt] of this.tokens) {
      if (expiresAt <= now) this.tokens.delete(key);
    }
  }
}
