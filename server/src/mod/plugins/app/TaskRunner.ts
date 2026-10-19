import { HttpError } from '../../http/HttpError.js';
import type { ManagedProcessImpl } from '../process/ManagedProcessImpl.js';
import type { PluginProcessManager } from '../process/PluginProcessManager.js';
import type { PluginRecord } from '../types.js';
import { AppLogBuffer } from './AppLogBuffer.js';
import { loadAppEnvironment, type AppEnvironmentDeps } from './AppEnvironment.js';
import type { InputValues, LogChunk, TaskStatus, TaskView } from './appRuntimeTypes.js';
import type { PluginCommand } from './appTypes.js';
import { buildInputArgs, resolveInputValues } from './commandInputs.js';
import { spawnSpec, waitForExit } from './processRun.js';
import { resolveTemplate, resolveTemplates } from './resolvePlaceholders.js';

interface TaskRun {
  commandId: string;
  status: TaskStatus;
  startedAt: number;
  finishedAt: number | null;
  exitCode: number | null;
  inputs: InputValues;
  logs: AppLogBuffer;
  child: ManagedProcessImpl;
  stopRequested: boolean;
}

const toView = (run: TaskRun): TaskView => ({
  commandId: run.commandId,
  status: run.status,
  startedAt: run.startedAt,
  finishedAt: run.finishedAt,
  exitCode: run.exitCode,
  inputs: run.inputs,
});

const idleView = (commandId: string): TaskView => ({
  commandId,
  status: 'idle',
  startedAt: null,
  finishedAt: null,
  exitCode: null,
  inputs: {},
});

const describeRun = (run: TaskRun, signal: string | null): string => {
  switch (run.status) {
    case 'success':
      return '正常に終了しました';
    case 'stopped':
      return '停止しました';
    case 'timeout':
      return 'タイムアウトしました';
    default:
      return `失敗しました(終了コード ${run.exitCode ?? signal ?? '不明'})`;
  }
};

export class TaskRunner {
  private readonly runs = new Map<string, Map<string, TaskRun>>();
  private readonly starting = new Map<string, Set<string>>();

  public constructor(
    private readonly environment: AppEnvironmentDeps,
    private readonly processes: PluginProcessManager,
  ) {}

  public list(record: PluginRecord): TaskView[] {
    const runs = this.runs.get(record.id);
    return record.manifest.app.commands
      .filter((command) => command.kind === 'task')
      .map((command) => {
        const run = runs?.get(command.id);
        return run === undefined ? idleView(command.id) : toView(run);
      });
  }

  public isAnyRunning(pluginId: string): boolean {
    for (const run of this.runs.get(pluginId)?.values() ?? []) {
      if (run.status === 'running') return true;
    }
    return (this.starting.get(pluginId)?.size ?? 0) > 0;
  }

  public readLogs(pluginId: string, commandId: string, after: number): { logs: LogChunk; task: TaskView } {
    const run = this.runs.get(pluginId)?.get(commandId);
    if (run === undefined) return { logs: { entries: [], next: 0 }, task: idleView(commandId) };
    return { logs: run.logs.read(after), task: toView(run) };
  }

  public async start(record: PluginRecord, commandId: string, rawInputs: Record<string, unknown>): Promise<TaskView> {
    const command = this.requireTask(record, commandId);
    this.assertNoConflict(record, command);

    const starting = this.starting.get(record.id) ?? new Set<string>();
    starting.add(command.id);
    this.starting.set(record.id, starting);

    try {
      const values = resolveInputValues(command, rawInputs);
      const environment = await loadAppEnvironment(this.environment, record);
      const plain = environment.contextFor(values, false);
      const secret = environment.contextFor(values, true);

      const child = await spawnSpec(this.processes, record.id, {
        argv: [...resolveTemplates(command.run, plain), ...buildInputArgs(command, values)],
        cwd: environment.cwdFor(command.cwd),
        env: Object.fromEntries(Object.entries(command.env).map(([key, text]) => [key, resolveTemplate(text, secret)])),
        stdin: resolveTemplates(command.stdin, secret),
        maskValues: environment.secretValues,
      });

      const run: TaskRun = {
        commandId: command.id,
        status: 'running',
        startedAt: Date.now(),
        finishedAt: null,
        exitCode: null,
        inputs: values,
        logs: new AppLogBuffer(),
        child,
        stopRequested: false,
      };
      const runs = this.runs.get(record.id) ?? new Map<string, TaskRun>();
      runs.set(command.id, run);
      this.runs.set(record.id, runs);

      child.onLog((line) => run.logs.push(line));
      void waitForExit(child, command.timeoutSec).then((result) => {
        run.finishedAt = Date.now();
        run.exitCode = result.exit.code;
        if (result.timedOut) run.status = 'timeout';
        else if (run.stopRequested) run.status = 'stopped';
        else run.status = result.exit.code === 0 ? 'success' : 'failed';
        run.logs.push(`[終了] ${describeRun(run, result.exit.signal)}`);
      });
      return toView(run);
    } finally {
      starting.delete(command.id);
    }
  }

  public async stop(record: PluginRecord, commandId: string): Promise<TaskView> {
    this.requireTask(record, commandId);
    const run = this.runs.get(record.id)?.get(commandId);
    if (run === undefined || run.status !== 'running') {
      throw new HttpError(409, 'not_running', '実行中ではありません');
    }
    run.stopRequested = true;
    await run.child.stop();
    return toView(run);
  }

  public release(pluginId: string): void {
    this.runs.delete(pluginId);
  }

  private requireTask(record: PluginRecord, commandId: string): PluginCommand {
    const command = record.manifest.app.commands.find((item) => item.id === commandId);
    if (command === undefined || command.kind !== 'task') {
      throw new HttpError(404, 'command_not_found', 'コマンドが見つかりません');
    }
    return command;
  }

  private isActive(pluginId: string, commandId: string): boolean {
    return (
      this.runs.get(pluginId)?.get(commandId)?.status === 'running' ||
      this.starting.get(pluginId)?.has(commandId) === true
    );
  }

  private assertNoConflict(record: PluginRecord, command: PluginCommand): void {
    if (this.isActive(record.id, command.id)) {
      throw new HttpError(409, 'command_running', `「${command.label}」はすでに実行中です`);
    }
    if (command.exclusive === null) return;
    for (const other of record.manifest.app.commands) {
      if (other.id === command.id || other.kind !== 'task' || other.exclusive !== command.exclusive) continue;
      if (this.isActive(record.id, other.id)) {
        throw new HttpError(
          409,
          'command_conflict',
          `「${other.label}」が実行中のため、「${command.label}」は実行できません`,
        );
      }
    }
  }
}
