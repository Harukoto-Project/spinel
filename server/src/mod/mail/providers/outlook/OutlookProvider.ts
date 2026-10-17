import type { Logger } from '../../../logger.js';
import { HttpStatusError, ProviderAuthError } from '../../errors.js';
import type { Mail } from '../../types.js';
import { extractErrorDetail } from '../errorDetail.js';
import type { FetchResult, MailProvider, ProviderAccount } from '../MailProvider.js';
import type { OutlookAccessTokens } from './OutlookAccessTokens.js';

const GRAPH_ORIGIN = 'https://graph.microsoft.com';
const DELTA_PATH = '/v1.0/me/mailFolders/inbox/messages/delta';
const SELECT_FIELDS = 'id,subject,from,receivedDateTime,body,isDraft';
const PREFER = 'outlook.body-content-type="text", IdType="ImmutableId", odata.maxpagesize=50';
const REQUEST_TIMEOUT_MS = 30_000;

interface GraphMessage {
  id: string;
  subject?: string | null;
  from?: { emailAddress?: { name?: string | null; address?: string | null } } | null;
  receivedDateTime?: string | null;
  body?: { contentType?: string; content?: string | null } | null;
  isDraft?: boolean;
  '@removed'?: unknown;
}

interface DeltaPage {
  value?: GraphMessage[];
  '@odata.nextLink'?: string;
  '@odata.deltaLink'?: string;
}

const formatSender = (from: GraphMessage['from']): string => {
  const name = from?.emailAddress?.name?.trim() ?? '';
  const address = from?.emailAddress?.address?.trim() ?? '';
  if (name && address && name !== address) return `${name} <${address}>`;
  return address || name;
};

const htmlToText = (html: string): string =>
  html
    .replace(/<(style|script)[\s\S]*?<\/\1>/gi, '')
    .replace(/<br\s*\/?>|<\/(p|div|tr|li|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const bodyText = (body: GraphMessage['body']): string => {
  const content = body?.content ?? '';
  return body?.contentType?.toLowerCase() === 'html' ? htmlToText(content) : content;
};

const assertGraphUrl = (url: string): void => {
  if (!url.startsWith(`${GRAPH_ORIGIN}/`)) {
    throw new Error('Microsoft Graph 以外の URL が指定されたため、リクエストを中止しました');
  }
};

export class OutlookProvider implements MailProvider {
  public readonly id = 'outlook';
  public readonly label = 'Outlook';
  public readonly requiredEnv = 'OUTLOOK_CLIENT_ID';

  public constructor(
    private readonly tokens: OutlookAccessTokens | null,
    private readonly logger: Logger,
  ) {}

  public get configured(): boolean {
    return this.tokens !== null;
  }

  public async initCursor(account: ProviderAccount): Promise<string> {
    const filter = `receivedDateTime ge ${new Date().toISOString()}`;
    const params = new URLSearchParams({ $select: SELECT_FIELDS, $filter: filter });
    const { cursor } = await this.collect(account, `${GRAPH_ORIGIN}${DELTA_PATH}?${params.toString()}`);
    return cursor;
  }

  public async fetchNew(account: ProviderAccount, cursor: string): Promise<FetchResult> {
    try {
      const { messages, cursor: latest } = await this.collect(account, cursor);
      const mails: Mail[] = [];
      for (const message of messages) {
        if (message['@removed'] !== undefined || message.isDraft) continue;
        mails.push(this.toMail(account, message));
      }
      return { mails, cursor: latest };
    } catch (error) {
      if (error instanceof HttpStatusError && error.status === 410) {
        this.logger.warn(`[${account.name}] 差分の起点が失効したため、現在位置から取得し直します`);
        return { mails: [], cursor: await this.initCursor(account) };
      }
      throw error;
    }
  }

  private async collect(
    account: ProviderAccount,
    startUrl: string,
  ): Promise<{ messages: GraphMessage[]; cursor: string }> {
    const messages: GraphMessage[] = [];
    let url = startUrl;

    for (;;) {
      const page = await this.request<DeltaPage>(account, url);
      messages.push(...(page.value ?? []));

      const next = page['@odata.nextLink'];
      if (next) {
        url = next;
        continue;
      }

      const delta = page['@odata.deltaLink'];
      if (!delta) {
        throw new Error('Microsoft Graph の応答に deltaLink が含まれていません');
      }
      assertGraphUrl(delta);
      return { messages, cursor: delta };
    }
  }

  private toMail(account: ProviderAccount, message: GraphMessage): Mail {
    const received = message.receivedDateTime ? new Date(message.receivedDateTime) : new Date();
    return {
      id: `${account.id}:${message.id}`,
      account: account.name,
      from: formatSender(message.from),
      subject: message.subject ?? '',
      body: bodyText(message.body),
      receivedAt: Number.isNaN(received.getTime()) ? new Date() : received,
    };
  }

  private async request<T>(account: ProviderAccount, url: string): Promise<T> {
    if (this.tokens === null) {
      throw new Error('Outlook のクライアントIDがサーバーに設定されていません');
    }
    assertGraphUrl(url);

    for (let attempt = 0; ; attempt += 1) {
      const token = await this.tokens.get(account.refreshToken, attempt > 0);
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}`, Prefer: PREFER },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (response.status === 401) {
        if (attempt === 0) continue;
        throw new ProviderAuthError('Outlook への認証に失敗しました。アプリからアカウントを再接続してください');
      }
      if (!response.ok) {
        const body = await response.text();
        if (response.status === 403) {
          throw new ProviderAuthError(
            'Outlook のメール読み取り権限が許可されていません。再接続して、すべての権限を許可してください(組織のアカウントは管理者の承認が必要な場合があります)',
          );
        }
        const detail = extractErrorDetail(body);
        throw new HttpStatusError(
          response.status,
          `Microsoft Graph がエラーを返しました (${response.status})${detail ? `: ${detail}` : ''}`,
        );
      }
      return (await response.json()) as T;
    }
  }
}
