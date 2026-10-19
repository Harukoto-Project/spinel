import { invoke } from '@tauri-apps/api/core';
import type {
  PluginAppOverview,
  PluginInputValues,
  PluginLogChunk,
  PluginTaskLogs,
  SetupState,
  SourceState,
  TaskState,
} from '@/types/pluginApp';

export function loadPluginApp(nodeId: string, pluginId: string): Promise<PluginAppOverview> {
  return invoke<PluginAppOverview>('load_plugin_app', { nodeId, pluginId });
}

export function updatePluginAppSource(nodeId: string, pluginId: string): Promise<{ source: SourceState }> {
  return invoke<{ source: SourceState }>('update_plugin_app_source', { nodeId, pluginId });
}

export function runPluginAppSetup(nodeId: string, pluginId: string): Promise<{ setup: SetupState }> {
  return invoke<{ setup: SetupState }>('run_plugin_app_setup', { nodeId, pluginId });
}

export function readPluginAppSetupLogs(
  nodeId: string,
  pluginId: string,
  stepId: string,
  after: number,
): Promise<PluginLogChunk> {
  return invoke<PluginLogChunk>('read_plugin_app_setup_logs', { nodeId, pluginId, stepId, after });
}

export function runPluginAppCommand(
  nodeId: string,
  pluginId: string,
  commandId: string,
  inputs?: PluginInputValues,
): Promise<{ task: TaskState }> {
  return invoke<{ task: TaskState }>('run_plugin_app_command', {
    nodeId,
    pluginId,
    commandId,
    inputs: inputs ?? null,
  });
}

export function stopPluginAppCommand(
  nodeId: string,
  pluginId: string,
  commandId: string,
): Promise<{ task: TaskState }> {
  return invoke<{ task: TaskState }>('stop_plugin_app_command', { nodeId, pluginId, commandId });
}

export function readPluginAppCommandLogs(
  nodeId: string,
  pluginId: string,
  commandId: string,
  after: number,
): Promise<PluginTaskLogs> {
  return invoke<PluginTaskLogs>('read_plugin_app_command_logs', { nodeId, pluginId, commandId, after });
}

export function queryPluginAppCommand(
  nodeId: string,
  pluginId: string,
  commandId: string,
  inputs?: PluginInputValues,
): Promise<{ data: unknown }> {
  return invoke<{ data: unknown }>('query_plugin_app_command', {
    nodeId,
    pluginId,
    commandId,
    inputs: inputs ?? null,
  });
}
