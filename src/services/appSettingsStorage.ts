import { invoke } from '@tauri-apps/api/core';
import type { AppSettings } from '@/types/appSettings';

export function loadAppSettings(): Promise<AppSettings> {
  return invoke<AppSettings>('load_app_settings');
}

export function saveAppSettings(settings: AppSettings): Promise<AppSettings> {
  return invoke<AppSettings>('save_app_settings', { settings });
}
