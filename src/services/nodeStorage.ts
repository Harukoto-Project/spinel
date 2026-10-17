import { invoke } from '@tauri-apps/api/core';
import type { StoredNode } from '@/types/node';

export function loadStoredNodes(): Promise<StoredNode[]> {
  return invoke<StoredNode[]>('load_nodes');
}

export function saveStoredNodes(nodes: StoredNode[]): Promise<void> {
  return invoke('save_nodes', { nodes });
}

export function describeStorageError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
