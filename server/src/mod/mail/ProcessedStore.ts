import { readJsonFile, SerialWriter, writeJsonFile } from '../storage/jsonFile.js';

const MAX_ENTRIES = 5000;

export class ProcessedStore {
  private ids = new Set<string>();
  private readonly writer = new SerialWriter();

  public constructor(private readonly filePath: string) {}

  public async load(): Promise<void> {
    const parsed = await readJsonFile(this.filePath);
    if (Array.isArray(parsed)) {
      this.ids = new Set(parsed.filter((value): value is string => typeof value === 'string'));
    }
  }

  public has(id: string): boolean {
    return this.ids.has(id);
  }

  public async add(id: string): Promise<void> {
    this.ids.add(id);
    this.ids = new Set([...this.ids].slice(-MAX_ENTRIES));
    await this.writer.run(() => writeJsonFile(this.filePath, [...this.ids]));
  }
}
