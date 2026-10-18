export interface ProcessExit {
  code: number | null;
  signal: string | null;
}

export interface SpawnOptions {
  cwd?: string;
  env?: Record<string, string>;
}

export interface ManagedProcess {
  readonly id: string;
  readonly pid: number | undefined;
  readonly command: string;
  readonly args: readonly string[];
  readonly startedAt: number;
  readonly running: boolean;
  readonly exit: ProcessExit | null;
  logs(limit?: number): string[];
  onLog(listener: (line: string) => void): () => void;
  onExit(listener: (exit: ProcessExit) => void): () => void;
  stop(): Promise<void>;
}

export interface PluginProcessApi {
  spawn(command: string, args?: readonly string[], options?: SpawnOptions): Promise<ManagedProcess>;
  list(): ManagedProcess[];
}
