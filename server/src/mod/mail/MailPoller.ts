import type { Logger } from '../logger.js';
import { buildMailNotification } from '../notifications/mailNotification.js';
import type { NotificationPayload } from '../notifications/protocol.js';
import type { Triage } from '../triage/Triage.js';
import type { MailAccountStore } from './accounts/MailAccountStore.js';
import { ProviderAuthError } from './errors.js';
import { buildHistoryEntry } from './history/buildHistoryEntry.js';
import type { MailHistoryStore } from './history/MailHistoryStore.js';
import type { ProcessedStore } from './ProcessedStore.js';
import type { MailProvider } from './providers/MailProvider.js';
import type { ProviderRegistry } from './providers/ProviderRegistry.js';
import type { MailSettingsStore } from './settings/MailSettingsStore.js';
import { POLL_INTERVAL_SEC_DEFAULT, type Mail, type MailDecision, type StoredMailAccount } from './types.js';

const INITIAL_DELAY_MS = 5_000;
const MAX_ATTEMPTS = 3;

export interface MailPollerDeps {
  accounts: MailAccountStore;
  providers: ProviderRegistry;
  settings: MailSettingsStore;
  processed: ProcessedStore;
  history: MailHistoryStore;
  getTriage: () => Promise<Triage | null>;
  publish: (payload: NotificationPayload) => number;
  logger: Logger;
}

const describe = (error: unknown): string => (error instanceof Error ? error.message : String(error));

export class MailPoller {
  private timer: NodeJS.Timeout | null = null;
  private running = false;
  private stopped = true;
  private readonly attempts = new Map<string, number>();

  public constructor(private readonly deps: MailPollerDeps) {
    deps.settings.subscribe((settings) => this.reschedule(settings.pollIntervalSec * 1000));
  }

  public start(): void {
    this.stopped = false;
    this.schedule(INITIAL_DELAY_MS);
  }

  public stop(): void {
    this.stopped = true;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }

  private reschedule(delayMs: number): void {
    if (this.stopped || this.running) return;
    this.schedule(delayMs);
  }

  private async intervalMs(): Promise<number> {
    try {
      return (await this.deps.settings.get()).pollIntervalSec * 1000;
    } catch (error) {
      this.deps.logger.error('メール設定を読み込めなかったため、既定の取得間隔を使います', error);
      return POLL_INTERVAL_SEC_DEFAULT * 1000;
    }
  }

  private schedule(delayMs: number): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => void this.tick(), delayMs);
  }

  private async tick(): Promise<void> {
    this.running = true;
    try {
      await this.pollAll();
    } catch (error) {
      this.deps.logger.error('メール取得の処理で予期しないエラーが発生しました', error);
    } finally {
      this.running = false;
      if (!this.stopped) this.schedule(await this.intervalMs());
    }
  }

  private async pollAll(): Promise<void> {
    const triage = await this.deps.getTriage();
    if (triage === null) {
      this.deps.logger.warn(
        'TypeSafe / Anthropic の API キーが未設定のため、メールの確認を保留します(アプリの「APIキーの設定」から保存してください)',
      );
      return;
    }

    for (const account of await this.deps.accounts.list()) {
      if (this.stopped) return;
      if (!account.connected) continue;

      const provider = this.deps.providers.get(account.provider);
      if (!provider || !provider.configured) continue;

      try {
        await this.pollAccount(account, provider, triage);
      } catch (error) {
        await this.recordFailure(account, error);
      }
    }
  }

  private async recordFailure(account: StoredMailAccount, error: unknown): Promise<void> {
    const message = describe(error);
    const authFailed = error instanceof ProviderAuthError;
    this.deps.logger.error(`[${account.name}] メール取得に失敗しました`, error);
    await this.deps.accounts.update(account.id, {
      connected: authFailed ? false : account.connected,
      lastError: message,
      lastCheckedAt: Date.now(),
    });
  }

  private async pollAccount(account: StoredMailAccount, provider: MailProvider, triage: Triage): Promise<void> {
    if (account.cursor === null) {
      const cursor = await provider.initCursor(account);
      await this.deps.accounts.update(account.id, { cursor, lastCheckedAt: Date.now(), lastError: null });
      return;
    }

    const { mails, cursor: next } = await provider.fetchNew(account, account.cursor);
    if (mails.length > 0) this.deps.logger.info(`[${account.name}] 新着メール: ${mails.length}件`);

    let complete = true;
    for (const mail of mails) {
      if (this.stopped) return;
      if (await this.deps.processed.has(mail.id)) continue;
      if (!(await this.process(account, mail, triage))) complete = false;
    }

    await this.deps.accounts.update(account.id, {
      cursor: complete ? next : account.cursor,
      lastCheckedAt: Date.now(),
      lastError: null,
    });
  }

  private async process(account: StoredMailAccount, mail: Mail, triage: Triage): Promise<boolean> {
    try {
      await this.judge(account, mail, triage);
      this.attempts.delete(mail.id);
      await this.deps.processed.add(mail.id);
      return true;
    } catch (error) {
      const count = (this.attempts.get(mail.id) ?? 0) + 1;
      if (count >= MAX_ATTEMPTS) {
        this.deps.logger.error(`[${account.name}] 判定を諦めます(${count}回失敗): ${mail.subject}`, error);
        this.attempts.delete(mail.id);
        await this.deps.processed.add(mail.id);
        return true;
      }
      this.attempts.set(mail.id, count);
      this.deps.logger.warn(`[${account.name}] 判定に失敗したため次回再試行します(${count}回目): ${describe(error)}`);
      return false;
    }
  }

  private async judge(account: StoredMailAccount, mail: Mail, triage: Triage): Promise<void> {
    const result = await triage.run(mail);
    this.deps.logger.info(
      `[${result.decision}] by ${result.decidedBy} relevance=${result.jev.relevance.toFixed(2)} junk=${result.jev.junk.toFixed(2)} action=${result.jev.actionRequired.toFixed(2)} deadline=${result.jev.hasDeadline.toFixed(2)} importance=${result.jev.importance.toFixed(2)} | ${mail.from} | ${mail.subject}`,
    );

    if (result.decision !== 'notify') {
      await this.record(account, mail, 'ignore', null);
      return;
    }

    const payload = buildMailNotification(result);
    const delivered = this.deps.publish(payload);
    if (delivered === 0) {
      this.deps.logger.warn(`通知の配信先(接続中のクライアント)がありません: ${mail.subject}`);
    }
    await this.record(account, mail, 'notify', payload);
  }

  private async record(
    account: StoredMailAccount,
    mail: Mail,
    decision: MailDecision,
    payload: NotificationPayload | null,
  ): Promise<void> {
    try {
      await this.deps.history.add(buildHistoryEntry(account, mail, decision, payload));
    } catch (error) {
      this.deps.logger.error(`[${account.name}] メール履歴を保存できませんでした: ${mail.subject}`, error);
    }
  }
}
