import { rm } from 'node:fs/promises';
import path from 'node:path';
import type { Db } from '../../db/Database.js';
import { HttpError } from '../../http/HttpError.js';
import type { Logger } from '../../logger.js';
import type { PluginInstaller } from '../PluginInstaller.js';
import type { PluginProcessManager } from '../process/PluginProcessManager.js';
import type { PluginRecord } from '../types.js';
import type { AppEnvironmentDeps } from './AppEnvironment.js';
import type { AppOverview, LogChunk, SetupView, SourceView, TaskView } from './appRuntimeTypes.js';
import { hasAppSpec } from './appTypes.js';
import type { PluginSourceManager } from './PluginSourceManager.js';
import { QueryRunner } from './QueryRunner.js';
import { SetupRunner } from './SetupRunner.js';
import { SetupStateStore } from './SetupStateStore.js';
import { TaskRunner } from './TaskRunner.js';

export type PrepareReason = 'boot' | 'enable';

export interface PluginAppRuntimeDeps {
  db: Db;
  installer: PluginInstaller;
  sources: PluginSourceManager;
  processes: PluginProcessManager;
  dataRoot: string;
  logger: Logger;
}

export class PluginAppRuntime {
  private readonly environment: AppEnvironmentDeps;
  private readonly setup: SetupRunner;
  private readonly tasks: TaskRunner;
  private readonly queries: QueryRunner;

  public constructor(private readonly deps: PluginAppRuntimeDeps) {
    this.environment = {
      db: deps.db,
      installer: deps.installer,
      sources: deps.sources,
      dataRoot: deps.dataRoot,
    };
    this.setup = new SetupRunner(this.environment, deps.processes, deps.logger);
    this.tasks = new TaskRunner(this.environment, deps.processes);
    this.queries = new QueryRunner(this.environment, deps.processes);
  }

  public async prepare(record: PluginRecord, reason: PrepareReason): Promise<void> {
    const spec = record.manifest.app;
    if (!hasAppSpec(spec)) return;

    const { source } = spec;
    if (source !== null) {
      const saved = await this.deps.sources.get(record.id);
      const present = await this.deps.sources.isPresent(record.id);
      if (!present || saved === null || saved.repo !== source.repo || saved.ref !== source.ref) {
        await this.deps.sources.sync(record.id, source);
      }
    }

    if (reason === 'enable' && spec.setup.length > 0) await this.setup.start(record, false);
  }

  public async refresh(record: PluginRecord): Promise<void> {
    if (!hasAppSpec(record.manifest.app)) return;
    if (this.setup.isRunning(record.id) || this.tasks.isAnyRunning(record.id)) {
      this.deps.logger.warn(`セットアップまたはコマンドの実行中のため、更新後の準備を見送りました: ${record.id}`);
      return;
    }
    await this.prepare(record, 'enable');
  }

  public release(pluginId: string): void {
    this.setup.release(pluginId);
    this.tasks.release(pluginId);
    this.queries.release(pluginId);
  }

  public async purge(pluginId: string): Promise<void> {
    this.release(pluginId);
    await this.deps.sources.remove(pluginId);
    await new SetupStateStore(this.deps.db).remove(pluginId);
    await rm(path.join(this.deps.dataRoot, pluginId), { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
  }

  public async overview(record: PluginRecord): Promise<AppOverview> {
    this.assertUsable(record);
    const [source, setup] = await Promise.all([this.sourceView(record), this.setup.view(record)]);
    return { source, setup, tasks: this.tasks.list(record) };
  }

  public async updateSource(record: PluginRecord): Promise<SourceView> {
    this.assertUsable(record);
    const { source } = record.manifest.app;
    if (source === null) throw new HttpError(400, 'no_source', 'このプラグインには [source] の指定がありません');
    if (this.setup.isRunning(record.id) || this.tasks.isAnyRunning(record.id)) {
      throw new HttpError(409, 'app_busy', 'セットアップまたはコマンドの実行中はソースを更新できません');
    }
    await this.deps.sources.sync(record.id, source);
    const view = await this.sourceView(record);
    if (view === null) throw new HttpError(500, 'source_missing', 'ソースの記録を取得できませんでした');
    return view;
  }

  public async startSetup(record: PluginRecord): Promise<SetupView> {
    this.assertUsable(record);
    if (this.tasks.isAnyRunning(record.id)) {
      throw new HttpError(409, 'app_busy', 'コマンドの実行中はセットアップを再実行できません');
    }
    await this.setup.start(record, true);
    return this.setup.view(record);
  }

  public readSetupLogs(record: PluginRecord, stepId: string, after: number): LogChunk {
    this.assertUsable(record);
    return this.setup.readLogs(record.id, stepId, after);
  }

  public async startTask(record: PluginRecord, commandId: string, inputs: Record<string, unknown>): Promise<TaskView> {
    this.assertUsable(record);
    await this.assertReady(record);
    return this.tasks.start(record, commandId, inputs);
  }

  public stopTask(record: PluginRecord, commandId: string): Promise<TaskView> {
    this.assertUsable(record);
    return this.tasks.stop(record, commandId);
  }

  public readTaskLogs(record: PluginRecord, commandId: string, after: number): { logs: LogChunk; task: TaskView } {
    this.assertUsable(record);
    return this.tasks.readLogs(record.id, commandId, after);
  }

  public async runQuery(record: PluginRecord, commandId: string, inputs: Record<string, unknown>): Promise<unknown> {
    this.assertUsable(record);
    await this.assertReady(record);
    return this.queries.run(record, commandId, inputs);
  }

  private assertUsable(record: PluginRecord): void {
    if (!hasAppSpec(record.manifest.app)) {
      throw new HttpError(404, 'app_unavailable', 'このプラグインにはアプリ機能がありません');
    }
    if (!record.enabled || record.grantedPermissions === null) {
      throw new HttpError(409, 'plugin_disabled', 'プラグインが有効になっていません');
    }
  }

  private async assertReady(record: PluginRecord): Promise<void> {
    const { status } = await this.setup.view(record);
    if (status === 'success') return;
    if (status === 'running') throw new HttpError(409, 'setup_running', 'セットアップを実行中です');
    throw new HttpError(409, 'setup_required', 'セットアップが完了していません');
  }

  private async sourceView(record: PluginRecord): Promise<SourceView | null> {
    if (record.manifest.app.source === null) return null;
    const saved = await this.deps.sources.get(record.id);
    if (saved === null) return null;
    return {
      repo: saved.repo,
      ref: saved.ref,
      transport: saved.transport,
      installedSha: saved.installedSha,
      updatedAt: saved.updatedAt,
      present: await this.deps.sources.isPresent(record.id),
    };
  }
}
