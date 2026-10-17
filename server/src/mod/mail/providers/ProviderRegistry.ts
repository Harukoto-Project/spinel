import type { MailProviderId } from '../types.js';
import type { MailProvider } from './MailProvider.js';

export class ProviderRegistry {
  private readonly providers = new Map<MailProviderId, MailProvider>();

  public constructor(providers: MailProvider[]) {
    for (const provider of providers) this.providers.set(provider.id, provider);
  }

  public get(id: MailProviderId): MailProvider | undefined {
    return this.providers.get(id);
  }
}
