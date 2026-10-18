import { execFile } from 'node:child_process';

const FORCE_KILL_DELAY_MS = 5_000;

export const killTree = (pid: number): Promise<void> => {
  if (process.platform === 'win32') {
    return new Promise((resolve) => {
      execFile('taskkill', ['/pid', String(pid), '/T', '/F'], { windowsHide: true }, () => resolve());
    });
  }

  try {
    process.kill(-pid, 'SIGTERM');
  } catch {
    return Promise.resolve();
  }
  const timer = setTimeout(() => {
    try {
      process.kill(-pid, 'SIGKILL');
    } catch {
      return;
    }
  }, FORCE_KILL_DELAY_MS);
  timer.unref();
  return Promise.resolve();
};
