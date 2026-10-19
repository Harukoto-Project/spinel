import {
  fail,
  fieldPath,
  optionalTableArray,
  readRelativePath,
  requireString,
  type Table,
} from '../readers.js';
import { createScope, readRunLine, readTimeoutSec, type AppParseContext } from './appParseContext.js';
import type { PluginSetupStep } from './appTypes.js';
import { ID_PATTERN } from './idPattern.js';

const SETUP_STEPS_MAX = 16;
const SETUP_TIMEOUT_DEFAULT_SEC = 1800;

export const parseSetup = (root: Table, context: AppParseContext): PluginSetupStep[] => {
  const tables = optionalTableArray(root, 'setup', '');
  if (tables.length > SETUP_STEPS_MAX) return fail('setup', `手順は ${SETUP_STEPS_MAX} 個までです`);

  const seen = new Set<string>();
  const scope = createScope(context, new Set(), false);

  return tables.map((table, index) => {
    const at = `setup[${index}]`;
    const id = requireString(table, 'id', at, 32);
    if (!ID_PATTERN.test(id)) return fail(fieldPath(at, 'id'), '小文字英字で始まる小文字英数字・-・_ だけを使ってください');
    if (seen.has(id)) return fail(fieldPath(at, 'id'), `"${id}" が重複しています`);
    seen.add(id);

    return {
      id,
      label: requireString(table, 'label', at, 128),
      run: readRunLine(table, at, scope),
      cwd: table['cwd'] === undefined ? null : readRelativePath(table, 'cwd', at),
      skipIfExists: table['skip_if_exists'] === undefined ? null : readRelativePath(table, 'skip_if_exists', at),
      timeoutSec: readTimeoutSec(table, at, SETUP_TIMEOUT_DEFAULT_SEC),
    };
  });
};