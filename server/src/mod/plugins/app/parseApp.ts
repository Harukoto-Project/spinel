import type { PluginPermissions, PluginSettingSchema } from '../types.js';
import { fail, type Table } from '../readers.js';
import type { AppParseContext } from './appParseContext.js';
import type { PluginAppSpec } from './appTypes.js';
import { parseCommands } from './parseCommands.js';
import { parsePanels } from './parsePanels.js';
import { parseSetup } from './parseSetup.js';
import { parseSource } from './parseSource.js';
import { collectVarNames, parseVars, verifyVarsCoverage } from './parseVars.js';

export const parseApp = (
  root: Table,
  settings: readonly PluginSettingSchema[],
  permissions: PluginPermissions,
): PluginAppSpec => {
  const source = parseSource(root);
  const vars = parseVars(root, source !== null);
  verifyVarsCoverage(vars);

  const context: AppParseContext = {
    hasSource: source !== null,
    vars: collectVarNames(vars),
    settings: new Map(settings.map((setting) => [setting.key, setting.type])),
  };

  const setup = parseSetup(root, context);
  if (setup.length > 0 && !permissions.build) {
    return fail('setup', '[[setup]] を使うには permissions.build = true が必要です');
  }

  const commands = parseCommands(root, context);
  if (commands.length > 0 && !permissions.process) {
    return fail('commands', '[[commands]] を使うには permissions.process = true が必要です');
  }

  const panels = parsePanels(root, commands, settings);
  return { source, vars, setup, commands, panels };
};
