import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import type { Logger } from '../../logger.js';
import { ManagedProcessImpl } from './ManagedProcessImpl.js';
import type { PluginProcessApi, SpawnOptions } from './types.js';

const RUNNING_MAX_PER_PLUGIN = 8;

const DEFAULT_ENV: Record<string, string> = {
  PYTHONIOENCODING: 'utf-8',
  PYTHONUNBUFFERED: '1',
};

export interface HostSpawnOptions extends SpawnOptions {
  stdin?: readonly string[];
  maskValues?: readonly string[];
  captureStdout?: boolean;
}

export class PluginProcessManager {
  private readonly running = new Map<string, Set<ManagedProcessImpl>>();

  public constructor(private readonly logger: Logger) {}

  public createApi(pluginId: string): PluginProcessApi {
    return {
      spawn: (command, args = [], options = {}) => this.start(pluginId, command, args, options),
      list: () => [...(this.running.get(pluginId) ?? [])],
    };
  }

  public spawnForHost(
    pluginId: string,
    command: string,
    args: readonly string[],
    options: HostSpawnOptions,
  ): Promise<ManagedProcessImpl> {
    return this.start(pluginId, command, args, options);
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
    options: HostSpawnOptions,
  ): Promise<ManagedProcessImpl> {
    if ((this.running.get(pluginId)?.size ?? 0) >= RUNNING_MAX_PER_PLUGIN) {
      throw new Error(`同時に起動できるプロセスは ${RUNNING_MAX_PER_PLUGIN} 個までです`);
    }

    const child = spawn(command, [...args], {
      cwd: options.cwd,
      env: { ...process.env, ...DEFAULT_ENV, ...options.env },
      stdio: [options.stdin === undefined ? 'ignore' : 'pipe', 'pipe', 'pipe'],
      windowsHide: true,
      detached: process.platform !== 'win32',
      shell: false,
    });

    await new Promise<void>((resolve, reject) => {
      child.once('spawn', resolve);
      child.once('error', reject);
    });

    if (options.stdin !== undefined && child.stdin !== null) {
      child.stdin.on('error', () => undefined);
      child.stdin.end(options.stdin.map((line) => `${line}\n`).join(''));
    }

    const managed = new ManagedProcessImpl(
      randomUUID(),
      command,
      args,
      child,
      (finished) => {
        const current = this.running.get(pluginId);
        current?.delete(finished);
        if (current !== undefined && current.size === 0) this.running.delete(pluginId);
      },
      { maskValues: options.maskValues, captureStdout: options.captureStdout },
    );
    const registered = this.running.get(pluginId) ?? new Set<ManagedProcessImpl>();
    registered.add(managed);
    this.running.set(pluginId, registered);
    this.logger.info(`プラグイン ${pluginId} がプロセスを起動しました: ${command}(pid ${child.pid ?? '?'})`);
    return managed;
  }
}
