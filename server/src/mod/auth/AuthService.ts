import type { AdminKeyStore } from './AdminKeyStore.js';
import type { FailureLimiter } from './FailureLimiter.js';
import type { IssuedToken, TokenStore } from './TokenStore.js';
import { parseBearer } from './bearer.js';

export type AuthResult = 'ok' | 'unauthorized' | 'limited';

export class AuthService {
  public constructor(
    private readonly adminKeys: AdminKeyStore,
    private readonly tokens: TokenStore,
    private readonly limiter: FailureLimiter,
  ) {}

  public authenticateAdmin(ip: string, authorization: string | undefined): AuthResult {
    return this.check(ip, authorization, (key) => this.adminKeys.verify(key));
  }

  public authenticateToken(ip: string, authorization: string | undefined): AuthResult {
    return this.check(ip, authorization, (token) => this.tokens.consume(token));
  }

  public issueToken(): IssuedToken {
    return this.tokens.issue();
  }

  private check(ip: string, authorization: string | undefined, verify: (secret: string) => boolean): AuthResult {
    if (this.limiter.isBlocked(ip)) return 'limited';

    const secret = parseBearer(authorization);
    if (secret !== null && verify(secret)) {
      this.limiter.reset(ip);
      return 'ok';
    }

    this.limiter.recordFailure(ip);
    return 'unauthorized';
  }
}
