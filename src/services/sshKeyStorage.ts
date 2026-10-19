import { invoke } from '@tauri-apps/api/core';
import type { SshKey } from '@/types/sshKey';

export function loadSshKey(nodeId: string): Promise<SshKey> {
  return invoke<SshKey>('load_ssh_key', { nodeId });
}

export function regenerateSshKey(nodeId: string): Promise<SshKey> {
  return invoke<SshKey>('regenerate_ssh_key', { nodeId });
}
