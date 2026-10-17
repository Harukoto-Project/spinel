import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const readJsonFile = async (filePath: string): Promise<unknown> => {
  let raw: string;
  try {
    raw = await readFile(filePath, 'utf8');
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return undefined;
    throw error;
  }
  return JSON.parse(raw.replace(/^\uFEFF/, ''));
};

export const writeJsonFile = async (filePath: string, value: unknown): Promise<void> => {
  await mkdir(path.dirname(filePath), { recursive: true });
  const temp = `${filePath}.tmp`;
  await writeFile(temp, JSON.stringify(value, null, 2), { encoding: 'utf8', mode: 0o600 });
  await rename(temp, filePath);
};

export class SerialWriter {
  private queue: Promise<void> = Promise.resolve();

  public run(task: () => Promise<void>): Promise<void> {
    const result = this.queue.then(task);
    this.queue = result.catch(() => undefined);
    return result;
  }
}
