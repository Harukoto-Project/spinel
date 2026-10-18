import * as React from 'react';
import * as ReactDom from 'react-dom';
import * as JsxDevRuntime from 'react/jsx-dev-runtime';
import * as JsxRuntime from 'react/jsx-runtime';
import * as Lucide from 'lucide-react';
import * as Utils from '@/lib/utils';

type HostModule = Record<string, unknown>;

const UI_MODULE_PATTERN = /^\/src\/components\/ui\/([^/]+)\.tsx$/;

const uiModules = import.meta.glob<HostModule>('/src/components/ui/*.tsx', { eager: true });

function collectUiModules(): Record<string, HostModule> {
  const modules: Record<string, HostModule> = {};
  for (const [file, module] of Object.entries(uiModules)) {
    const name = UI_MODULE_PATTERN.exec(file)?.[1];
    if (name) modules[`@/components/ui/${name}`] = module;
  }
  return modules;
}

export const HOST_MODULES: Record<string, HostModule> = {
  react: React,
  'react/jsx-runtime': JsxRuntime,
  'react/jsx-dev-runtime': JsxDevRuntime,
  'react-dom': ReactDom,
  'lucide-react': Lucide,
  '@/lib/utils': Utils,
  ...collectUiModules(),
};

export const HOST_API_VERSION = 1;

export function listHostModuleNames(): string[] {
  return Object.keys(HOST_MODULES).sort();
}

type SpinelHostGlobal = {
  version: number;
  modules: Record<string, HostModule>;
};

declare global {
  var __SPINEL_HOST__: SpinelHostGlobal | undefined;
}

export function installHostGlobal(): void {
  if (globalThis.__SPINEL_HOST__) return;
  globalThis.__SPINEL_HOST__ = { version: HOST_API_VERSION, modules: HOST_MODULES };
}
