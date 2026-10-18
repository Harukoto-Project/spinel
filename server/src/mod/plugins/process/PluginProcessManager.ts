import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import type { Logger } from '../../logger.js';
import { ManagedProcessImpl } from './ManagedProcessImpl.js';
import type { ManagedProcess, PluginProcessApi, SpawnOptions } from './types.js';

const RUNNING_MAX_PER_PLUGIN = 8;

const DEFAULT_ENV: Record<string, string> = {
  PYTHONIOENCODING: 'utf-8',
  PYTHONUNBUFFERED: '1',
};

export class PluginProcessManager {
  private readonly running = new Map<string, Set<ManagedProcessImpl>>();

  public constructor(private readonly logger: Logger) {}

  public createApi(pluginId: string): PluginProcessApi {
    return {
      spawn: (command, args = [], options = {}) => this.start(pluginId, command, args, options),
      list: () => [...(this.running.get(pluginId) ?? [])],
    };
  }

  public async stopPlugin(pluginId: string): Promise<void> {
    const processes = [...(this.running.get(pluginId) ?? [])];
    await Promise.all(processes.map((item) => item.stop()));
  }

  public async stopAll(): Promise<void> {
    await Promise.all([...this.running.keys()].map((pluginId) => this.stopPlugin(pluginId)));
  }

  private async start(
    pluginId: string,
    command: string,
    args: readonly string[],
    options: SpawnOptions,
  ): Promise<ManagedProcess> {
    const set = this.running.get(pluginId) ?? new Set<ManagedProcessImpl>();
    if (set.size >= RUNNING_MAX_PER_PLUGIN) {
      throw new Error(`同時に起動できるプロセスは ${RUNNING_MAX_PER_PLUGIN} 個までです`);
    }

    const child = spawn(command, [...args], {
      cwd: options.cwd,
      env: { ...process.env, ...DEFAULT_ENV, ...options.env },
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
      detached: process.platform !== 'win32',
      shell: false,
    });

    await new Promise<void>((resolve, reject) => {
      child.once('spawn', resolve);
      child.once('error', reject);
    });

    const managed = new ManagedProcessImpl(randomUUID(), command, args, child, (finished) => {
      set.delete(finished);
      if (set.size === 0) this.running.delete(pluginId);
    });
    set.add(managed);
    this.running.set(pluginId, set);
    this.logger.info(`プラグイン ${pluginId} がプロセスを起動しました: ${command}(pid ${child.pid ?? '?'})`);
    return managed;
  }
}
