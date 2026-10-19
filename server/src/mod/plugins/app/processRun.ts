import { HttpError } from '../../http/HttpError.js';
import type { ManagedProcessImpl } from '../process/ManagedProcessImpl.js';
import type { PluginProcessManager } from '../process/PluginProcessManager.js';
import type { ProcessExit } from '../process/types.js';

export interface ProcessSpec {
  argv: string[];
  cwd: string;
  env: Record<string, string>;
  stdin: string[];
  maskValues: string[];
  captureStdout?: boolean;
}

export interface WaitResult {
  exit: ProcessExit;
  timedOut: boolean;
}

export const spawnSpec = async (
  processes: PluginProcessManager,
  pluginId: string,
  spec: ProcessSpec,
): Promise<ManagedProcessImpl> => {
  const [command, ...args] = spec.argv;
  if (command === undefined) throw new HttpError(400, 'command_spawn_failed', '実行するコマンドが空です');
  try {
    return await processes.spawnForHost(pluginId, command, args, {
      cwd: spec.cwd,
      env: spec.env,
      stdin: spec.stdin.length > 0 ? spec.stdin : undefined,
      maskValues: spec.maskValues,
      captureStdout: spec.captureStdout,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new HttpError(400, 'command_spawn_failed', `コマンドを起動できませんでした: ${message}`);
  }
};

export const waitForExit = (child: ManagedProcessImpl, timeoutSec: number | null): Promise<WaitResult> =>
  new Promise<WaitResult>((resolve) => {
    let timedOut = false;
    const timer =
      timeoutSec === null
        ? null
        : setTimeout(() => {
            timedOut = true;
            void child.stop();
          }, timeoutSec * 1000);
    child.onExit((exit) => {
      if (timer !== null) clearTimeout(timer);
      resolve({ exit, timedOut });
    });
  });
