import { randomUUID } from 'node:crypto';
import type { MailAccountStore } from './accounts/MailAccountStore.js';
import { MailError, ProviderAuthError } from './errors.js';
import type { MailHistoryStore } from './history/MailHistoryStore.js';
import type { ProviderRegistry } from './providers/ProviderRegistry.js';
import { isValidPollInterval, type MailSettingsStore } from './settings/MailSettingsStore.js';
import {
  POLL_INTERVAL_SEC_MAX,
  POLL_INTERVAL_SEC_MIN,
  toMailAccountView,
  type ConnectMailAccountInput,
  type MailAccountView,
  type MailHistoryEntry,
  type MailSettings,
} from './types.js';

export class MailService {
  public constructor(
    private readonly accounts: MailAccountStore,
    private readonly providers: ProviderRegistry,
    private readonly settings: MailSettingsStore,
    private readonly history: MailHistoryStore,
  ) {}

  public listHistory(): MailHistoryEntry[] {
    return this.history.list();
  }

  public async removeHistory(id: string): Promise<MailHistoryEntry[]> {
    if (!(await this.history.remove(id))) {
      throw new MailError(404, 'not_found', '履歴が見つかりません');
    }
    return this.history.list();
  }

  public async clearHistory(): Promise<MailHistoryEntry[]> {
    await this.history.clear();
    return [];
  }

  public listAccounts(): MailAccountView[] {
    return this.accounts.list().map(toMailAccountView);
  }

  public async connectAccount(input: ConnectMailAccountInput): Promise<MailAccountView[]> {
    const provider = this.providers.get(input.provider);
    if (!provider) {
      throw new MailError(400, 'unknown_provider', 'このノードは指定されたメールサービスに対応していません');
    }
    if (!provider.configured) {
      throw new MailError(
        503,
        'provider_not_configured',
        `このノードは ${provider.label} アカウントに対応していません(${provider.requiredEnv} が未設定です)`,
      );
    }

    const existing = this.accounts.findByEmail(input.provider, input.email);
    const id = existing?.id ?? randomUUID();

    let latest: string;
    try {
      latest = await provider.initCursor({ id, name: input.name, refreshToken: input.refreshToken });
    } catch (error) {
      if (error instanceof ProviderAuthError) throw new MailError(400, 'provider_rejected', error.message);
      const reason = error instanceof Error ? error.message : String(error);
      throw new MailError(502, 'provider_unreachable', `メールサービスに接続できませんでした: ${reason}`);
    }

    const cursor = existing?.connected && existing.cursor !== null ? existing.cursor : latest;
    await this.accounts.save({
      id,
      provider: input.provider,
      email: input.email,
      name: input.name,
      refreshToken: input.refreshToken,
      connectedAt: existing?.connectedAt ?? Date.now(),
      connected: true,
      lastError: null,
      lastCheckedAt: existing?.lastCheckedAt ?? null,
      cursor,
    });
    return this.listAccounts();
  }

  public async removeAccount(id: string): Promise<MailAccountView[]> {
    if (!(await this.accounts.remove(id))) {
      throw new MailError(404, 'not_found', 'メールアカウントが見つかりません');
    }
    return this.listAccounts();
  }

  public getSettings(): MailSettings {
    return this.settings.get();
  }

  public async updateSettings(settings: MailSettings): Promise<MailSettings> {
    if (!isValidPollInterval(settings.pollIntervalSec)) {
      throw new MailError(
        400,
        'invalid_settings',
        `取得間隔は ${POLL_INTERVAL_SEC_MIN}〜${POLL_INTERVAL_SEC_MAX} 秒の整数で指定してください`,
      );
    }
    await this.settings.update(settings);
    return this.settings.get();
  }
}
