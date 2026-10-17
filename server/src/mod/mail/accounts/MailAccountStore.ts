import { readJsonFile, SerialWriter, writeJsonFile } from '../../storage/jsonFile.js';
import { MAIL_PROVIDER_IDS, type StoredMailAccount } from '../types.js';

interface MailAccountFile {
  accounts: StoredMailAccount[];
}

const isStringOrNull = (value: unknown): value is string | null => value === null || typeof value === 'string';

const isNumberOrNull = (value: unknown): value is number | null => value === null || typeof value === 'number';

const isStoredAccount = (value: unknown): value is StoredMailAccount => {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.provider === 'string' &&
    (MAIL_PROVIDER_IDS as readonly string[]).includes(v.provider) &&
    typeof v.email === 'string' &&
    typeof v.name === 'string' &&
    typeof v.refreshToken === 'string' &&
    typeof v.connectedAt === 'number' &&
    typeof v.connected === 'boolean' &&
    isStringOrNull(v.lastError) &&
    isNumberOrNull(v.lastCheckedAt) &&
    isStringOrNull(v.cursor)
  );
};

export class MailAccountStore {
  private accounts: StoredMailAccount[] = [];
  private readonly writer = new SerialWriter();

  public constructor(private readonly filePath: string) {}

  public async load(): Promise<void> {
    const parsed = await readJsonFile(this.filePath);
    if (parsed === undefined) return;

    const list = typeof parsed === 'object' && parsed !== null && 'accounts' in parsed ? parsed.accounts : null;
    if (!Array.isArray(list) || !list.every(isStoredAccount)) {
      throw new Error(`メールアカウントファイルの形式が正しくありません: ${this.filePath}`);
    }
    this.accounts = list;
  }

  public list(): StoredMailAccount[] {
    return this.accounts.map((account) => ({ ...account }));
  }

  public get(id: string): StoredMailAccount | undefined {
    const account = this.accounts.find((candidate) => candidate.id === id);
    return account ? { ...account } : undefined;
  }

  public findByEmail(provider: StoredMailAccount['provider'], email: string): StoredMailAccount | undefined {
    const lowered = email.toLowerCase();
    const account = this.accounts.find(
      (candidate) => candidate.provider === provider && candidate.email.toLowerCase() === lowered,
    );
    return account ? { ...account } : undefined;
  }

  public async save(account: StoredMailAccount): Promise<void> {
    const index = this.accounts.findIndex((candidate) => candidate.id === account.id);
    if (index >= 0) this.accounts[index] = { ...account };
    else this.accounts.push({ ...account });
    await this.persist();
  }

  public async update(id: string, patch: Partial<Omit<StoredMailAccount, 'id'>>): Promise<void> {
    const index = this.accounts.findIndex((candidate) => candidate.id === id);
    const current = this.accounts[index];
    if (current === undefined) return;
    this.accounts[index] = { ...current, ...patch };
    await this.persist();
  }

  public async remove(id: string): Promise<boolean> {
    const before = this.accounts.length;
    this.accounts = this.accounts.filter((candidate) => candidate.id !== id);
    if (this.accounts.length === before) return false;
    await this.persist();
    return true;
  }

  private persist(): Promise<void> {
    return this.writer.run(() => writeJsonFile(this.filePath, { accounts: this.accounts } satisfies MailAccountFile));
  }
}
