import { HOST_MODULES } from '@/plugins/hostModules';

const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const IMPORT_SPECIFIER = /(\bfrom\s*|\bimport\s*)(["'])([^"'\n]+)\2/g;

const shimUrls = new Map<string, string>();

function buildShimSource(specifier: string): string {
  const module = HOST_MODULES[specifier];
  const key = JSON.stringify(specifier);
  const names = Object.keys(module).filter((name) => name !== 'default' && IDENTIFIER.test(name));
  const lines = [
    `const m = globalThis.__SPINEL_HOST__.modules[${key}];`,
    'export default m.default ?? m;',
    ...names.map((name) => `export const ${name} = m[${JSON.stringify(name)}];`),
  ];
  return lines.join('\n');
}

function shimUrlFor(specifier: string): string {
  const cached = shimUrls.get(specifier);
  if (cached) return cached;

  const blob = new Blob([buildShimSource(specifier)], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  shimUrls.set(specifier, url);
  return url;
}

export function rewriteHostImports(source: string): string {
  return source.replace(IMPORT_SPECIFIER, (match, prefix: string, quote: string, specifier: string) => {
    if (!Object.prototype.hasOwnProperty.call(HOST_MODULES, specifier)) return match;
    return `${prefix}${quote}${shimUrlFor(specifier)}${quote}`;
  });
}
