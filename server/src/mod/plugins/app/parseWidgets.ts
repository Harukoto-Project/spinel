import {
  fail,
  fieldPath,
  optionalString,
  optionalTable,
  optionalTableArray,
  requireString,
  type Table,
} from '../readers.js';
import {
  WIDGET_TONES,
  type BadgeWidget,
  type PluginWidget,
  type TableColumn,
  type TableWidget,
  type WidgetTone,
} from './appTypes.js';
import { validateJsonPath, validateWidgetTemplate } from './widgetPaths.js';

const WIDGETS_MAX = 24;
const COLUMNS_MAX = 12;
const MAP_ENTRIES_MAX = 32;
const WIDGET_TYPES = ['progress', 'stat', 'text', 'badge', 'table'] as const;

const readPath = (table: Table, key: string, at: string): string => {
  const value = requireString(table, key, at, 256);
  validateJsonPath(value, fieldPath(at, key));
  return value;
};

const readTemplate = (table: Table, key: string, at: string): string => {
  const value = requireString(table, key, at, 512);
  validateWidgetTemplate(value, fieldPath(at, key));
  return value;
};

const readStringMap = (table: Table, key: string, at: string): Record<string, string> => {
  const map = optionalTable(table, key, at);
  if (map === null) return {};
  const keys = Object.keys(map);
  if (keys.length > MAP_ENTRIES_MAX) return fail(fieldPath(at, key), `項目は ${MAP_ENTRIES_MAX} 個までです`);
  const result: Record<string, string> = {};
  for (const name of keys) {
    const value = map[name];
    if (typeof value !== 'string' || value === '')
      return fail(fieldPath(fieldPath(at, key), name), '空でない文字列を指定してください');
    result[name] = value;
  }
  return result;
};

const readTones = (table: Table, at: string): BadgeWidget['tones'] => {
  const raw = readStringMap(table, 'tones', at);
  const result: Record<string, WidgetTone> = {};
  for (const [name, value] of Object.entries(raw)) {
    const tone = WIDGET_TONES.find((item) => item === value);
    if (tone === undefined) {
      return fail(fieldPath(fieldPath(at, 'tones'), name), `${WIDGET_TONES.join(' / ')} のいずれかを指定してください`);
    }
    result[name] = tone;
  }
  return result;
};

const readColumns = (table: Table, at: string): TableColumn[] => {
  const tables = optionalTableArray(table, 'columns', at);
  if (tables.length === 0) return fail(fieldPath(at, 'columns'), '列を1つ以上指定してください');
  if (tables.length > COLUMNS_MAX) return fail(fieldPath(at, 'columns'), `列は ${COLUMNS_MAX} 個までです`);
  return tables.map((column, index) => {
    const columnAt = `${fieldPath(at, 'columns')}[${index}]`;
    return {
      label: requireString(column, 'label', columnAt, 64),
      value: readTemplate(column, 'value', columnAt),
    };
  });
};

const readMaxRows = (table: Table, at: string): number | null => {
  const value = table['max_rows'];
  if (value === undefined) return null;
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > 1000) {
    return fail(fieldPath(at, 'max_rows'), '1〜1000 の整数を指定してください');
  }
  return value;
};

const readTable = (table: Table, at: string, label: string | null): TableWidget => ({
  type: 'table',
  label,
  rows: readPath(table, 'rows', at),
  columns: readColumns(table, at),
  empty: optionalString(table, 'empty', at, 128),
  maxRows: readMaxRows(table, at),
});

const readWidget = (table: Table, at: string): PluginWidget => {
  const type = requireString(table, 'type', at, 16);
  const label = optionalString(table, 'label', at, 64);

  switch (type) {
    case 'progress':
      return {
        type,
        label,
        value: readPath(table, 'value', at),
        detail: table['detail'] === undefined ? null : readTemplate(table, 'detail', at),
      };
    case 'stat':
    case 'text':
      return { type, label, value: readTemplate(table, 'value', at) };
    case 'badge':
      return {
        type,
        label,
        value: readPath(table, 'value', at),
        labels: readStringMap(table, 'labels', at),
        tones: readTones(table, at),
      };
    case 'table':
      return readTable(table, at, label);
    default:
      return fail(fieldPath(at, 'type'), `${WIDGET_TYPES.join(' / ')} のいずれかを指定してください`);
  }
};

export const parseWidgets = (panelTable: Table, panelAt: string): PluginWidget[] => {
  const tables = optionalTableArray(panelTable, 'widgets', panelAt);
  if (tables.length === 0) return fail(fieldPath(panelAt, 'widgets'), 'ウィジェットを1つ以上指定してください');
  if (tables.length > WIDGETS_MAX)
    return fail(fieldPath(panelAt, 'widgets'), `ウィジェットは ${WIDGETS_MAX} 個までです`);
  return tables.map((table, index) => readWidget(table, `${fieldPath(panelAt, 'widgets')}[${index}]`));
};
