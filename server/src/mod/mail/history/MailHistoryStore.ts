import { readJsonFile, SerialWriter, writeJsonFile } from '../../storage/jsonFile.js';
import { MAIL_PROVIDER_IDS, type MailHistoryEntry } from '../types.js';

const MAX_ENTRIES = 1000;

interface MailHistoryFile {
  history: MailHistoryEntry[];
}

const isStringOrNull = (value: unknown): value is string | null => value === null || typeof value === 'string';

const isHistoryEntry = (value: unknown): value is MailHistoryEntry => {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.accountId === 'string' &&
    typeof v.accountName === 'string' &&
    typeof v.accountEmail === 'string' &&
    typeof v.provider === 'string' &&
    (MAIL_PROVIDER_IDS as readonly string[]).includes(v.provider) &&
    typeof v.from === 'string' &&
    typeof v.subject === 'string' &&
    typeof v.receivedAt === 'number' &&
    typeof v.processedAt === 'number' &&
    (v.decision === 'notify' || v.decision === 'ignore') &&
    (v.priority === null || v.priority === 'normal' || v.priority === 'urgent') &&
    isStringOrNull(v.summary) &&
    isStringOrNull(v.deadline)
  );
};

export class MailHistoryStore {
  private entries: MailHistoryEntry[] = [];
  private readonly writer = new SerialWriter();

  public constructor(private readonly filePath: string) {}

  public async load(): Promise<void> {
    const parsed = await readJsonFile(this.filePath);
    if (parsed === undefined) return;

    const list = typeof parsed === 'object' && parsed !== null && 'history' in parsed ? parsed.history : null;
    if (!Array.isArray(list) || !list.every(isHistoryEntry)) {
      throw new Error(`メール履歴ファイルの形式が正しくありません: ${this.filePath}`);
    }
    this.entries = list;
  }

  public list(): MailHistoryEntry[] {
    return this.entries.map((entry) => ({ ...entry }));
  }

  public async add(entry: MailHistoryEntry): Promise<void> {
    this.entries = [{ ...entry }, ...this.entries].slice(0, MAX_ENTRIES);
    await this.persist();
  }

  public async remove(id: string): Promise<boolean> {
    const before = this.entries.length;
    this.entries = this.entries.filter((entry) => entry.id !== id);
    if (this.entries.length === before) return false;
    await this.persist();
    return true;
  }

  public async clear(): Promise<void> {
    this.entries = [];
    await this.persist();
  }

  private persist(): Promise<void> {
    return this.writer.run(() => writeJsonFile(this.filePath, { history: this.entries } satisfies MailHistoryFile));
  }
}
