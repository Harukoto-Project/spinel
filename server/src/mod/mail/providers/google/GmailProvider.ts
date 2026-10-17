import { simpleParser } from 'mailparser';
import type { Logger } from '../../../logger.js';
import { HttpStatusError, ProviderAuthError } from '../../errors.js';
import type { Mail } from '../../types.js';
import { extractErrorDetail } from '../errorDetail.js';
import type { FetchResult, MailProvider, ProviderAccount } from '../MailProvider.js';
import type { GoogleAccessTokens } from './GoogleAccessTokens.js';

const API_BASE = 'https://gmail.googleapis.com/gmail/v1/users/me';
const REQUEST_TIMEOUT_MS = 30_000;
const EXCLUDED_LABELS: ReadonlySet<string> = new Set(['SENT', 'DRAFT', 'TRASH']);
const SCOPE_ERROR_PATTERN = /insufficientPermissions|ACCESS_TOKEN_SCOPE_INSUFFICIENT/;

const SERVICE_DISABLED_PATTERN = /SERVICE_DISABLED|accessNotConfigured|has not been used in project/;

interface HistoryPage {
  history?: { messagesAdded?: { message: { id: string; labelIds?: string[] } }[] }[];
  historyId?: string;
  nextPageToken?: string;
}

interface RawMessage {
  raw?: string;
  internalDate?: string;
}

export class GmailProvider implements MailProvider {
  public readonly id = 'google';
  public readonly label = 'Google';
  public readonly requiredEnv = 'GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET';

  public constructor(
    private readonly tokens: GoogleAccessTokens | null,
    private readonly logger: Logger,
  ) {}

  public get configured(): boolean {
    return this.tokens !== null;
  }

  public async initCursor(account: ProviderAccount): Promise<string> {
    const profile = await this.request<{ historyId?: string }>(account, '/profile');
    if (!profile.historyId) {
      throw new Error('Gmail のプロフィールから historyId を取得できませんでした');
    }
    return profile.historyId;
  }

  public async fetchNew(account: ProviderAccount, cursor: string): Promise<FetchResult> {
    const ids = new Set<string>();
    let latest = cursor;
    let pageToken: string | undefined;

    try {
      do {
        const params = new URLSearchParams({
          startHistoryId: cursor,
          historyTypes: 'messageAdded',
          maxResults: '500',
        });
        if (pageToken) params.set('pageToken', pageToken);

        const page = await this.request<HistoryPage>(account, `/history?${params.toString()}`);
        for (const record of page.history ?? []) {
          for (const added of record.messagesAdded ?? []) {
            const labels = added.message.labelIds ?? [];
            if (!labels.some((label) => EXCLUDED_LABELS.has(label))) ids.add(added.message.id);
          }
        }
        if (page.historyId) latest = page.historyId;
        pageToken = page.nextPageToken;
      } while (pageToken);
    } catch (error) {
      if (error instanceof HttpStatusError && error.status === 404) {
        this.logger.warn(`[${account.name}] 履歴の起点が失効したため、現在位置から取得し直します`);
        return { mails: [], cursor: await this.initCursor(account) };
      }
      throw error;
    }

    const mails: Mail[] = [];
    for (const id of ids) {
      const mail = await this.fetchMessage(account, id);
      if (mail) mails.push(mail);
    }
    return { mails, cursor: latest };
  }

  private async fetchMessage(account: ProviderAccount, messageId: string): Promise<Mail | null> {
    let message: RawMessage;
    try {
      message = await this.request<RawMessage>(account, `/messages/${encodeURIComponent(messageId)}?format=raw`);
    } catch (error) {
      if (error instanceof HttpStatusError && error.status === 404) return null;
      throw error;
    }
    if (!message.raw) return null;

    const parsed = await simpleParser(Buffer.from(message.raw, 'base64url'));
    const internal = Number(message.internalDate);
    const receivedAt = Number.isFinite(internal) && internal > 0 ? new Date(internal) : (parsed.date ?? new Date());

    return {
      id: `${account.id}:${messageId}`,
      account: account.name,
      from: parsed.from?.text ?? '',
      subject: parsed.subject ?? '',
      body: parsed.text ?? '',
      receivedAt,
    };
  }

  private async request<T>(account: ProviderAccount, path: string): Promise<T> {
    if (this.tokens === null) {
      throw new Error('Google のクライアントID/シークレットがサーバーに設定されていません');
    }

    for (let attempt = 0; ; attempt += 1) {
      const token = await this.tokens.get(account.refreshToken, attempt > 0);
      const response = await fetch(`${API_BASE}${path}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (response.status === 401) {
        if (attempt === 0) continue;
        throw new ProviderAuthError('Gmail への認証に失敗しました。アプリからアカウントを再接続してください');
      }
      if (!response.ok) {
        const body = await response.text();
        if (response.status === 403 && SCOPE_ERROR_PATTERN.test(body)) {
          throw new ProviderAuthError(
            'Gmail の読み取り権限が許可されていません。再接続して、すべての権限を許可してください',
          );
        }
        if (response.status === 403 && SERVICE_DISABLED_PATTERN.test(body)) {
          throw new HttpStatusError(
            response.status,
            'Google Cloud プロジェクトで Gmail API が有効になっていません。Google Cloud Console の「API とサービス」で Gmail API を有効にしてください',
          );
        }
        const detail = extractErrorDetail(body);
        throw new HttpStatusError(
          response.status,
          `Gmail API がエラーを返しました (${response.status})${detail ? `: ${detail}` : ''}`,
        );
      }
      return (await response.json()) as T;
    }
  }
}
