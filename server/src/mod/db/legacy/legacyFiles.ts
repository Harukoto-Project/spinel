import { readFile, rename } from 'node:fs/promises';

export const readLegacyJson = async (filePath: string): Promise<unknown> => {
  let raw: string;
  try {
    raw = await readFile(filePath, 'utf8');
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return undefined;
    throw error;
  }
  return JSON.parse(raw.replace(/^\uFEFF/, ''));
};

export const markLegacyImported = async (filePath: string): Promise<string> => {
  const target = `${filePath}.imported`;
  try {
    await rename(filePath, target);
    return target;
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'EEXIST') {
      const fallback = `${filePath}.${Date.now()}.imported`;
      await rename(filePath, fallback);
      return fallback;
    }
    throw error;
  }
};
