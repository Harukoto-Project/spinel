import { HttpError } from '../../http/HttpError.js';
import type { PluginProcessManager } from '../process/PluginProcessManager.js';
import type { PluginRecord } from '../types.js';
import { loadAppEnvironment, type AppEnvironmentDeps } from './AppEnvironment.js';
import { buildInputArgs, resolveInputValues } from './commandInputs.js';
import { spawnSpec, waitForExit } from './processRun.js';
import { resolveTemplate, resolveTemplates } from './resolvePlaceholders.js';

const ERROR_TAIL_LINES = 5;
const OUTPUT_DRAIN_MS = 1000;

const parseJson = (text: string): unknown => {
  const trimmed = text.trim();
  if (trimmed === '') throw new SyntaxError('empty');
  try {
    return JSON.parse(trimmed);
  } catch {
    const lastLine = trimmed.split(/\r?\n/).filter((line) => line.trim() !== '').pop();
    if (lastLine === undefined) throw new SyntaxError('empty');
    return JSON.parse(lastLine);
  }
};

export class QueryRunner {
  private readonly active = new Map<string, Set<string>>();

  public constructor(
    private readonly environment: AppEnvironmentDeps,
    private readonly processes: PluginProcessManager,
  ) {}

  public async run(record: PluginRecord, commandId: string, rawInputs: Record<string, unknown>): Promise<unknown> {
    const command = record.manifest.app.commands.find((item) => item.id === commandId);
    if (command === undefined || command.kind !== 'query') {
      throw new HttpError(404, 'command_not_found', 'コマンドが見つかりません');
    }

    const active = this.active.get(record.id) ?? new Set<string>();
    if (active.has(command.id)) throw new HttpError(409, 'query_running', 'この問い合わせはすでに実行中です');
    active.add(command.id);
    this.active.set(record.id, active);

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
        captureStdout: true,
      });

      const result = await waitForExit(child, command.timeoutSec);
      await child.outputDrained(OUTPUT_DRAIN_MS);
      if (result.timedOut) {
        throw new HttpError(504, 'query_timeout', `「${command.label}」が ${command.timeoutSec} 秒以内に完了しませんでした`);
      }
      if (result.exit.code !== 0) {
        const tail = child.logs(ERROR_TAIL_LINES).join('\n');
        throw new HttpError(
          502,
          'query_failed',
          `「${command.label}」が失敗しました(終了コード ${result.exit.code ?? result.exit.signal ?? '不明'})${tail === '' ? '' : `: ${tail}`}`,
        );
      }

      const { text, truncated } = child.stdoutText();
      try {
        if (truncated) throw new SyntaxError('truncated');
        return parseJson(text);
      } catch {
        throw new HttpError(502, 'query_invalid_output', `「${command.label}」の出力を JSON として読み取れませんでした`);
      }
    } finally {
      active.delete(command.id);
    }
  }

  public release(pluginId: string): void {
    this.active.delete(pluginId);
  }
}
