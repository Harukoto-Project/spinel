import type { LogChunk } from './appRuntimeTypes.js';

const LOG_BUFFER_MAX = 2000;

export class AppLogBuffer {
  private entries: { seq: number; text: string }[] = [];
  private nextSeq = 0;

  public push(text: string): void {
    this.entries.push({ seq: this.nextSeq, text });
    this.nextSeq += 1;
    if (this.entries.length > LOG_BUFFER_MAX) this.entries.shift();
  }

  public read(after: number): LogChunk {
    return { entries: this.entries.filter((entry) => entry.seq >= after), next: this.nextSeq };
  }

  public tail(count: number): string[] {
    return this.entries.slice(-count).map((entry) => entry.text);
  }
}
