import { readFileSync } from 'node:fs';
import os from 'node:os';

const readLinuxPrettyName = (): string | null => {
  try {
    const match = readFileSync('/etc/os-release', 'utf8').match(/^PRETTY_NAME="?([^"\n]+)"?$/m);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
};

export const getOsName = (): string => {
  const platform = os.platform();
  if (platform === 'linux') {
    const pretty = readLinuxPrettyName();
    if (pretty) return pretty;
  }
  if (platform === 'darwin') return 'macOS';
  return os.version() || os.type();
};
