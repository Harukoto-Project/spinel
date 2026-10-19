import { stat } from 'node:fs/promises';
import { HttpError } from '../../http/HttpError.js';
import type { Logger } from '../../logger.js';
import type { PluginProcessManager } from '../process/PluginProcessManager.js';
import type { PluginRecord } from '../types.js';
import { AppLogBuffer } from './AppLogBuffer.js';
import { loadAppEnvironment, resolveInside, type AppEnvironment, type AppEnvironmentDeps } from './AppEnvironment.js';
import type { LogChunk, SetupStatus, SetupStepStatus, SetupView } from './appRuntimeTypes.js';
import type { PluginSetupStep } from './appTypes.js';
import { spawnSpec, waitForExit } from './processRun.js';
import { resolveTemplates } from './resolvePlaceholders.js';
import { SetupStateStore, type CompletedSteps } from './SetupStateStore.js';

interface StepRuntime {
  status: SetupStepStatus;
  error: string | null;
  startedAt: number | null;
  finishedAt: number | null;
  logs: AppLogBuffer;
}

interface SetupRuntime {
  running: boolean;
  aborted: boolean;
  steps: Map<string, StepRuntime>;
}

const messageOf = (error: unknown): string => (error instanceof Error ? error.message : String(error));

const exists = (target: string): Promise<boolean> =>
  stat(target).then(
    () => true,
    (error: NodeJS.ErrnoException) => {
      if (error.code === 'ENOENT') return false;
      throw error;
    },
  );

const isDone = (status: SetupStepStatus): boolean => status === 'success' || status === 'skipped';

export class SetupRunner {
  private readonly runtimes = new Map<string, SetupRuntime>();

  public constructor(
    private readonly environment: AppEnvironmentDeps,
    private readonly processes: PluginProcessManager,
    private readonly logger: Logger,
  ) {}

  public isRunning(pluginId: string): boolean {
    return this.runtimes.get(pluginId)?.running === true;
  }

  public async view(record: PluginRecord): Promise<SetupView> {
    const completed = await new SetupStateStore(this.environment.db).get(record.id);
    const runtime = this.runtimes.get(record.id);

    const steps = record.manifest.app.setup.map((step) => {
      const live = runtime?.steps.get(step.id);
      const saved = completed[step.id];
      return {
        id: step.id,
        label: step.label,
        status: live?.status ?? saved?.status ?? ('pending' as SetupStepStatus),
        error: live?.error ?? null,
        startedAt: live?.startedAt ?? null,
        finishedAt: live?.finishedAt ?? saved?.finishedAt ?? null,
      };
    });

    let status: SetupStatus = 'idle';
    if (runtime?.running === true) status = 'running';
    else if (steps.some((step) => step.status === 'failed')) status = 'failed';
    else if (steps.every((step) => isDone(step.status))) status = 'success';

    return { status, steps };
  }

  public async isComplete(record: PluginRecord): Promise<boolean> {
    return (await this.view(record)).status === 'success';
  }

  public readLogs(pluginId: string, stepId: string, after: number): LogChunk {
    return this.runtimes.get(pluginId)?.steps.get(stepId)?.logs.read(after) ?? { entries: [], next: 0 };
  }

  public async start(record: PluginRecord, force: boolean): Promise<void> {
    const steps = record.manifest.app.setup;
    if (steps.length === 0) return;
    if (this.isRunning(record.id)) throw new HttpError(409, 'setup_running', 'セットアップを実行中です');

    const environment = await loadAppEnvironment(this.environment, record);
    const store = new SetupStateStore(this.environment.db);
    if (force) await store.save(record.id, {});
    const completed = force ? {} : await store.get(record.id);

    const runtime: SetupRuntime = { running: true, aborted: false, steps: new Map() };
    for (const step of steps) {
      const saved = completed[step.id];
      runtime.steps.set(step.id, {
        status: saved?.status ?? 'pending',
        error: null,
        startedAt: null,
        finishedAt: saved?.finishedAt ?? null,
        logs: new AppLogBuffer(),
      });
    }
    this.runtimes.set(record.id, runtime);

    void this.execute(record, environment, runtime, completed).catch((error: unknown) => {
      this.logger.error(`プラグインのセットアップで予期しないエラーが発生しました: ${record.id}`, error);
    });
  }

  public release(pluginId: string): void {
    const runtime = this.runtimes.get(pluginId);
    if (runtime === undefined) return;
    runtime.aborted = true;
    if (!runtime.running) this.runtimes.delete(pluginId);
  }

  private async execute(
    record: PluginRecord,
    environment: AppEnvironment,
    runtime: SetupRuntime,
    completed: CompletedSteps,
  ): Promise<void> {
    const store = new SetupStateStore(this.environment.db);
    try {
      for (const step of record.manifest.app.setup) {
        if (runtime.aborted) break;
        const state = runtime.steps.get(step.id);
        if (state === undefined || isDone(state.status)) continue;

        await this.runStep(record.id, step, environment, runtime, state);

        if (isDone(state.status)) {
          completed[step.id] = {
            status: state.status as 'success' | 'skipped',
            finishedAt: state.finishedAt ?? Date.now(),
          };
          if (!runtime.aborted) await store.save(record.id, completed);
        }
        if (state.status === 'failed') break;
      }
    } finally {
      runtime.running = false;
      if (runtime.aborted && this.runtimes.get(record.id) === runtime) this.runtimes.delete(record.id);
    }
  }

  private async runStep(
    pluginId: string,
    step: PluginSetupStep,
    environment: AppEnvironment,
    runtime: SetupRuntime,
    state: StepRuntime,
  ): Promise<void> {
    state.status = 'running';
    state.startedAt = Date.now();
    state.finishedAt = null;
    state.error = null;
    state.logs = new AppLogBuffer();

    const fail = (message: string): void => {
      state.status = 'failed';
      state.error = message;
      state.finishedAt = Date.now();
      state.logs.push(`[失敗] ${message}`);
    };

    try {
      const cwd = environment.cwdFor(step.cwd);
      if (step.skipIfExists !== null && (await exists(resolveInside(cwd, step.skipIfExists)))) {
        state.status = 'skipped';
        state.finishedAt = Date.now();
        state.logs.push(`${step.skipIfExists} が存在するためスキップしました`);
        return;
      }

      const argv = resolveTemplates(step.run, environment.contextFor({}, false));
      state.logs.push(`$ ${argv.join(' ')}`);
      const child = await spawnSpec(this.processes, pluginId, {
        argv,
        cwd,
        env: {},
        stdin: [],
        maskValues: environment.secretValues,
      });
      child.onLog((line) => state.logs.push(line));

      const result = await waitForExit(child, step.timeoutSec);
      if (runtime.aborted) return fail('キャンセルされました');
      if (result.timedOut) return fail(`${step.timeoutSec} 秒以内に完了しませんでした`);
      if (result.exit.code !== 0)
        return fail(`終了コード ${result.exit.code ?? result.exit.signal ?? '不明'} で失敗しました`);

      state.status = 'success';
      state.finishedAt = Date.now();
    } catch (error) {
      fail(messageOf(error));
    }
  }
}
