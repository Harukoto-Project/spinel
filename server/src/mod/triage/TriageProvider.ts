import type { ApiKeyService } from '../apiKeys/ApiKeyService.js';
import { Triage } from './Triage.js';
import type { TriageConfig } from './types.js';

export class TriageProvider {
  private cached: Triage | null = null;
  private version = 0;

  public constructor(
    private readonly config: TriageConfig,
    private readonly keys: ApiKeyService,
  ) {
    keys.subscribe(() => {
      this.version += 1;
      this.cached = null;
    });
  }

  public async get(): Promise<Triage | null> {
    if (this.cached !== null) return this.cached;

    const version = this.version;
    const typesafe = await this.keys.resolve('typesafe');
    const anthropic = await this.keys.resolve('anthropic');
    if (typesafe === null || anthropic === null) return null;

    const triage = new Triage(this.config, { typesafe, anthropic });
    if (version === this.version) this.cached = triage;
    return triage;
  }
}
