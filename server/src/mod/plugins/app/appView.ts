import type {
  PluginAppSpec,
  PluginCommandInput,
  PluginCommandKind,
  PluginPanel,
  PluginSource,
} from './appTypes.js';
import { hasAppSpec } from './appTypes.js';

export interface PluginAppCommandView {
  id: string;
  label: string;
  description: string | null;
  kind: PluginCommandKind;
  exclusive: string | null;
  inputs: PluginCommandInput[];
}

export interface PluginAppSetupStepInfo {
  id: string;
  label: string;
}

export interface PluginAppView {
  source: PluginSource | null;
  setup: PluginAppSetupStepInfo[];
  commands: PluginAppCommandView[];
  panels: PluginPanel[];
}

export const toAppView = (spec: PluginAppSpec): PluginAppView | null => {
  if (!hasAppSpec(spec)) return null;
  return {
    source: spec.source,
    setup: spec.setup.map((step) => ({ id: step.id, label: step.label })),
    commands: spec.commands.map((command) => ({
      id: command.id,
      label: command.label,
      description: command.description,
      kind: command.kind,
      exclusive: command.exclusive,
      inputs: command.inputs,
    })),
    panels: spec.panels,
  };
};
