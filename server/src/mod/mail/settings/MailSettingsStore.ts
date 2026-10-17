import { readJsonFile, SerialWriter, writeJsonFile } from '../../storage/jsonFile.js';
import {
  POLL_INTERVAL_SEC_DEFAULT,
  POLL_INTERVAL_SEC_MAX,
  POLL_INTERVAL_SEC_MIN,
  type MailSettings,
} from '../types.js';

type Listener = (settings: MailSettings) => void;

export const isValidPollInterval = (value: unknown): value is number =>
  typeof value === 'number' &&
  Number.isInteger(value) &&
  value >= POLL_INTERVAL_SEC_MIN &&
  value <= POLL_INTERVAL_SEC_MAX;

export class MailSettingsStore {
  private settings: MailSettings = { pollIntervalSec: POLL_INTERVAL_SEC_DEFAULT };
  private readonly writer = new SerialWriter();
  private readonly listeners = new Set<Listener>();

  public constructor(private readonly filePath: string) {}

  public async load(): Promise<void> {
    const parsed = await readJsonFile(this.filePath);
    if (parsed === undefined) return;

    const interval =
      typeof parsed === 'object' && parsed !== null && 'pollIntervalSec' in parsed ? parsed.pollIntervalSec : null;
    if (!isValidPollInterval(interval)) {
      throw new Error(`メール設定ファイルの形式が正しくありません: ${this.filePath}`);
    }
    this.settings = { pollIntervalSec: interval };
  }

  public get(): MailSettings {
    return { ...this.settings };
  }

  public subscribe(listener: Listener): void {
    this.listeners.add(listener);
  }

  public async update(settings: MailSettings): Promise<void> {
    this.settings = { ...settings };
    await this.writer.run(() => writeJsonFile(this.filePath, this.settings));
    for (const listener of this.listeners) listener(this.get());
  }
}
