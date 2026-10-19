import type { PluginSettingSchema } from '../types.js';
import { fail, fieldPath, optionalString, optionalTableArray, requireString, type Table } from '../readers.js';
import type { PanelBase, PluginCommand, PluginCommandKind, PluginPanel } from './appTypes.js';
import { ID_PATTERN } from './idPattern.js';
import { parseWidgets } from './parseWidgets.js';

const PANELS_MAX = 32;
const PANEL_REFS_MAX = 16;
const INTERVAL_MAX_SEC = 3600;

interface PanelContext {
  commands: ReadonlyMap<string, PluginCommand>;
  settings: readonly PluginSettingSchema[];
}

const readIdList = (table: Table, key: string, at: string, optional: boolean): string[] => {
  const value = table[key];
  if (value === undefined) {
    if (optional) return [];
    return fail(fieldPath(at, key), '1つ以上指定してください');
  }
  const path = fieldPath(at, key);
  if (!Array.isArray(value) || (!optional && value.length === 0)) {
    return fail(path, '文字列の配列で指定してください');
  }
  if (value.length > PANEL_REFS_MAX) return fail(path, `${PANEL_REFS_MAX} 個までです`);
  const ids = value.map((item, index) => {
    if (typeof item !== 'string' || item === '') return fail(`${path}[${index}]`, '空でない文字列を指定してください');
    return item;
  });
  if (new Set(ids).size !== ids.length) return fail(path, '重複があります');
  return ids;
};

const requireCommands = (ids: string[], kind: PluginCommandKind, path: string, context: PanelContext): void => {
  for (const id of ids) {
    const command = context.commands.get(id);
    if (command === undefined) return fail(path, `コマンド "${id}" が [[commands]] にありません`);
    if (command.kind !== kind) {
      return fail(path, `コマンド "${id}" は ${command.kind} のため、このパネルでは使えません(${kind} が必要です)`);
    }
  }
};

const readBase = (table: Table, at: string, tab: string | null): PanelBase => {
  const id = requireString(table, 'id', at, 32);
  if (!ID_PATTERN.test(id))
    return fail(fieldPath(at, 'id'), '小文字英字で始まる小文字英数字・-・_ だけを使ってください');
  return {
    id,
    title: requireString(table, 'title', at, 64),
    description: optionalString(table, 'description', at, 512),
    tab,
  };
};

const readInterval = (table: Table, at: string): number => {
  const value = table['interval'];
  if (value === undefined) return 0;
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value > INTERVAL_MAX_SEC) {
    return fail(fieldPath(at, 'interval'), `0(手動更新のみ)〜${INTERVAL_MAX_SEC} の整数(秒)で指定してください`);
  }
  return value;
};

const readPanel = (table: Table, at: string, context: PanelContext): PluginPanel => {
  const type = requireString(table, 'type', at, 16);
  const base = readBase(table, at, optionalString(table, 'tab', at, 32));

  switch (type) {
    case 'actions': {
      const commands = readIdList(table, 'commands', at, false);
      requireCommands(commands, 'task', fieldPath(at, 'commands'), context);
      const settings = readIdList(table, 'settings', at, true);
      for (const key of settings) {
        if (!context.settings.some((setting) => setting.key === key)) {
          return fail(fieldPath(at, 'settings'), `設定 "${key}" が [[settings]] にありません`);
        }
      }
      return { ...base, type, commands, settings };
    }
    case 'console': {
      const commands = readIdList(table, 'commands', at, false);
      requireCommands(commands, 'task', fieldPath(at, 'commands'), context);
      return { ...base, type, commands };
    }
    case 'status': {
      const query = requireString(table, 'query', at, 32);
      requireCommands([query], 'query', fieldPath(at, 'query'), context);
      return { ...base, type, query, intervalSec: readInterval(table, at), widgets: parseWidgets(table, at) };
    }
    default:
      return fail(fieldPath(at, 'type'), 'actions / console / status のいずれかを指定してください');
  }
};

export const parsePanels = (
  root: Table,
  commands: readonly PluginCommand[],
  settings: readonly PluginSettingSchema[],
): PluginPanel[] => {
  const tables = optionalTableArray(root, 'panels', '');
  if (tables.length > PANELS_MAX) return fail('panels', `パネルは ${PANELS_MAX} 個までです`);

  const context: PanelContext = { commands: new Map(commands.map((command) => [command.id, command])), settings };
  const seen = new Set<string>();

  return tables.map((table, index) => {
    const at = `panels[${index}]`;
    const panel = readPanel(table, at, context);
    if (seen.has(panel.id)) return fail(fieldPath(at, 'id'), `"${panel.id}" が重複しています`);
    seen.add(panel.id);
    return panel;
  });
};
