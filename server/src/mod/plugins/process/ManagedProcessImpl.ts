import type { ChildProcess } from 'node:child_process';
import { killTree } from './killTree.js';
import type { ManagedProcess, ProcessExit } from './types.js';

const LOG_LINES_MAX = 1000;
const LOG_LINE_CHARS_MAX = 2000;
const STOP_WAIT_MS = 10_000;

type LogListener = (line: string) => void;
type ExitListener = (exit: ProcessExit) => void;

export class ManagedProcessImpl implements ManagedProcess {
  public readonly startedAt = Date.now();
  public exit: ProcessExit | null = null;

  private readonly lines: string[] = [];
  private readonly logListeners = new Set<LogListener>();
  private readonly exitListeners = new Set<ExitListener>();
  private readonly partial = { stdout: '', stderr: '' };

  public constructor(
    public readonly id: string,
    public readonly command: string,
    public readonly args: readonly string[],
    private readonly child: ChildProcess,
    onFinished: (process: ManagedProcessImpl) => void,
  ) {
    child.stdout?.setEncoding('utf8');
    child.stderr?.setEncoding('utf8');
    child.stdout?.on('data', (chunk: string) => this.collect('stdout', chunk));
    child.stderr?.on('data', (chunk: string) => this.collect('stderr', chunk));
    child.on('error', (error) => this.append(`[error] ${error.message}`));
    child.once('exit', (code, signal) => {
      this.flush('stdout');
      this.flush('stderr');
      this.exit = { code, signal };
      onFinished(this);
      for (const listener of [...this.exitListeners]) this.safely(() => listener(this.exit as ProcessExit));
      this.exitListeners.clear();
    });
  }

  public get pid(): number | undefined {
    return this.child.pid;
  }

  public get running(): boolean {
    return this.exit === null;
  }

  public logs(limit = LOG_LINES_MAX): string[] {
    return limit >= this.lines.length ? [...this.lines] : this.lines.slice(-Math.max(0, limit));
  }

  public onLog(listener: LogListener): () => void {
    this.logListeners.add(listener);
    return () => this.logListeners.delete(listener);
  }

  public onExit(listener: ExitListener): () => void {
    if (this.exit !== null) {
      const exit = this.exit;
      queueMicrotask(() => this.safely(() => listener(exit)));
      return () => undefined;
    }
    this.exitListeners.add(listener);
    return () => this.exitListeners.delete(listener);
  }

  public async stop(): Promise<void> {
    if (!this.running || this.child.pid === undefined) return;
    const exited = new Promise<void>((resolve) => this.onExit(() => resolve()));
    await killTree(this.child.pid);
    await Promise.race([exited, new Promise<void>((resolve) => setTimeout(resolve, STOP_WAIT_MS).unref())]);
  }

  private collect(stream: 'stdout' | 'stderr', chunk: string): void {
    const parts = (this.partial[stream] + chunk).split(/\r?\n/);
    this.partial[stream] = parts.pop() ?? '';
    for (const line of parts) this.append(line);
  }

  private flush(stream: 'stdout' | 'stderr'): void {
    if (this.partial[stream] !== '') this.append(this.partial[stream]);
    this.partial[stream] = '';
  }

  private append(rawLine: string): void {
    const line = rawLine.length > LOG_LINE_CHARS_MAX ? `${rawLine.slice(0, LOG_LINE_CHARS_MAX)}…` : rawLine;
    this.lines.push(line);
    if (this.lines.length > LOG_LINES_MAX) this.lines.shift();
    for (const listener of [...this.logListeners]) this.safely(() => listener(line));
  }

  private safely(task: () => void): void {
    try {
      task();
    } catch {
      return;
    }
  }
}
