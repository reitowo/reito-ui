import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const source = JSON.parse(await readFile(new URL('packages/tokens/src/tokens.json', root), 'utf8'));
const lookup = (path) => path.split('.').reduce((value, key) => value?.[key], source);
// Check expression edges too: CSS cycles otherwise fail silently at runtime.
const checkedReferences = new Set();
function validateReference(path, active = new Set()) {
  if (active.has(path)) throw new Error(`Cyclic token reference: ${path}`);
  if (checkedReferences.has(path)) return;
  const token = lookup(path);
  if (!token || !('$value' in token)) throw new Error(`Invalid token reference: ${path}`);
  active.add(path);
  for (const value of [token.$value, token.$extensions?.reito?.css]) {
    if (typeof value !== 'string') continue;
    for (const [, reference] of value.matchAll(/\{([^}]+)\}/g)) validateReference(reference, active);
  }
  active.delete(path);
  checkedReferences.add(path);
}
function validateGroup(group, prefix = '') {
  for (const [key, value] of Object.entries(group)) {
    if (key.startsWith('$')) continue;
    const path = prefix + key;
    if ('$value' in value) validateReference(path);
    else validateGroup(value, path + '.');
  }
}
validateGroup(source);
function resolve(token, seen = new Set()) {
  if (!token || !('$value' in token)) throw new Error('Invalid token reference');
  let value = token.$value;
  if (typeof value === 'string' && /^\{.+\}$/.test(value)) {
    const path = value.slice(1, -1);
    if (seen.has(path)) throw new Error(`Cyclic token reference: ${path}`);
    return resolve(lookup(path), new Set([...seen, path]));
  }
  switch (token.$type) {
    case 'color': {
      if (value.colorSpace !== 'srgb' || value.components.length !== 3) throw new Error('Expected sRGB color');
      if (value.components.some((n) => typeof n !== 'number' || n < 0 || n > 1)) throw new Error('Invalid color component');
      const hex = value.components.map((n) => Math.round(n * 255).toString(16).padStart(2, '0')).join('');
      return value.alpha != null && value.alpha < 1 ? `rgb(${value.components.map(n => Math.round(n * 255)).join(' ')} / ${value.alpha})` : `#${hex}`;
    }
    case 'dimension': case 'duration': return `${value.value}${value.unit}`;
    case 'fontFamily': return value.map((font) => font.includes(' ') ? `"${font}"` : font).join(', ');
    case 'cubicBezier': return `cubic-bezier(${value.join(', ')})`;
    case 'shadow': {
      const items = Array.isArray(value) ? value : [value];
      return items.map(v => `${v.inset ? 'inset ' : ''}${resolve({$type:'dimension',$value:v.offsetX})} ${resolve({$type:'dimension',$value:v.offsetY})} ${resolve({$type:'dimension',$value:v.blur})} ${resolve({$type:'dimension',$value:v.spread})} ${resolve({$type:'color',$value:v.color})}`).join(', ');
    }
    default: return String(value);
  }
}
// Keep references live in CSS; numeric APIs and palette recipes still need
// resolved build-time values. Namespace paths map to their public CSS roles.
function variable(path) {
  const parts = path.split('.');
  if (parts[0] === 'foundation') return parts.slice(1).join('-');
  if (parts[0] === 'themes' || parts[0] === 'density') return parts.slice(2).join('-');
  if (parts[0] === 'components') return 'component-' + parts.slice(1).join('-');
  if (parts[0] === 'palette' || parts[0] === 'colorScales') return 'palette-' + parts.slice(1).join('-');
  throw new Error(`No CSS namespace for token reference: ${path}`);
}
function cssValue(token) {
  resolve(token); // Reject missing or cyclic aliases even when emitting var().
  const expression = token.$extensions?.reito?.css;
  if (expression) {
    if (!/^calc\(.+\)$/.test(expression)) throw new Error('Expected a calc() token expression');
    return expression.replace(/\{([^}]+)\}/g, (_, path) => {
      resolve(lookup(path));
      return `var(--rui-${variable(path)})`;
    });
  }
  return typeof token.$value === 'string' && /^\{.+\}$/.test(token.$value)
    ? `var(--rui-${variable(token.$value.slice(1, -1))})`
    : resolve(token);
}
function flatten(group, prefix = '', valueOf = resolve) {
  return Object.entries(group).filter(([key]) => !key.startsWith('$')).flatMap(([key, value]) =>
    '$value' in value ? [[`${prefix}${key}`, valueOf(value)]] : flatten(value, `${prefix}${key}-`, valueOf));
}
const declarations = (values) => values.map(([name, value]) => `  --rui-${name}: ${value};`).join('\n');
let css = `/* Generated from src/tokens.json. Run npm run tokens:build. */\n:root {\n${declarations(flatten(source.foundation, '', cssValue))}\n${declarations(flatten(source.palette, 'palette-'))}\n${declarations(flatten(source.colorScales, 'palette-'))}\n${declarations(flatten(source.components, 'component-', cssValue))}\n}\n\n:root, [data-theme="dark"] {\n  color-scheme: dark;\n${declarations(flatten(source.themes.dark, '', cssValue))}\n}\n\n[data-theme="light"] {\n  color-scheme: light;\n${declarations(flatten(source.themes.light, '', cssValue))}\n}\n\n:root, [data-density="compact"] {\n${declarations(flatten(source.density.compact, '', cssValue))}\n}\n\n[data-density="comfortable"] {\n${declarations(flatten(source.density.comfortable, '', cssValue))}\n}\n\n@media (prefers-reduced-motion: reduce) {\n  :root { --rui-duration-fast: 0ms; --rui-duration-normal: 0ms; }\n}\n`;
const roles = {
  background:'bg', foreground:'text', card:'surface', 'card-foreground':'text',
  popover:'elevated', 'popover-foreground':'text', primary:'primary', 'primary-foreground':'on-primary',
  secondary:'hover', 'secondary-foreground':'text', muted:'surface', 'muted-foreground':'text-muted',
  accent:'hover', 'accent-foreground':'text', destructive:'danger', border:'border', input:'border', ring:'focus',
  sidebar:'surface', 'sidebar-foreground':'text-secondary', 'sidebar-primary':'primary', 'sidebar-primary-foreground':'on-primary',
  'sidebar-accent':'hover', 'sidebar-accent-foreground':'text', 'sidebar-border':'border', 'sidebar-ring':'focus',
  success:'success', 'success-soft':'success-soft', warning:'warning', 'warning-soft':'warning-soft',
  info:'accent', 'info-soft':'accent-soft', 'destructive-soft':'danger-soft',
  'chart-1':'accent', 'chart-2':'success', 'chart-3':'warning', 'chart-4':'danger', 'chart-5':'text-secondary',
};
const aliases = `\n/* shadcn roles: accent is an interaction surface; info is the blue status color. */\n:root {\n${Object.entries(roles).map(([name,target])=>`  --${name}: var(--rui-${target});`).join('\n')}\n  --radius: var(--rui-radius-lg);\n}\n`;
// Public runtime presets are resolved from the same token source as CSS.
const runtimeThemes = Object.fromEntries(Object.entries(source.themes).map(([mode, values]) => [mode, Object.fromEntries(flatten(values))]));
const themeBindings = Object.fromEntries(Object.entries(source.themes).map(([mode, values]) => [mode, Object.fromEntries(flatten(values, '', cssValue))]));
const runtimeNeutral = Object.fromEntries(Object.entries(source.colorThemes.neutral).map(([family, modes]) => [family, Object.fromEntries(Object.entries(modes).map(([mode, values]) => [mode, Object.fromEntries(flatten(values))]))]));
const runtimeColors = Object.fromEntries(Object.entries(source.colorThemes.color).map(([family, modes]) => [family, Object.fromEntries(Object.entries(modes).map(([mode, values]) => [mode, Object.fromEntries(flatten(values))]))]));
const presetBindings = (group) => Object.fromEntries(Object.entries(group).map(([family, modes]) => [family, Object.fromEntries(Object.entries(modes).map(([mode, values]) => [mode, Object.fromEntries(flatten(values, '', cssValue))]))]));
const neutralBindings = presetBindings(source.colorThemes.neutral);
const colorBindings = presetBindings(source.colorThemes.color);
const runtimeScales = Object.fromEntries(Object.entries(source.colorScales).map(([family, values]) => [family, Object.fromEntries(flatten(values))]));
const paletteVariables = Object.fromEntries(Object.entries(runtimeScales).map(([family, scale]) => [family, Object.fromEntries(Object.keys(scale).map(step => [step, `var(--rui-palette-${family}-${step})`]))]));
// Rebind aliases at each theme scope so local base overrides also reach aliases.
const bindings = Object.fromEntries([
  ...flatten(source.foundation, '', cssValue),
  ...flatten(source.components, 'component-', cssValue),
].filter(([, value]) => value.includes('var(')));
// CSS-only theme/density scopes must also rebind component aliases.
css += `\n[data-theme], [data-density] {\n${declarations(Object.entries(bindings))}\n}\n`;
const densityBindings = Object.fromEntries(Object.entries(source.density).map(([mode, values]) => [mode, Object.fromEntries(flatten(values, '', cssValue).filter(([, value]) => value.includes('var(')))]));
const tokenKeys = [...new Set([...Object.keys(source.foundation), ...Object.keys(source.density.compact), ...Object.keys(source.themes.dark)])];
const componentKeys = Object.fromEntries(Object.entries(source.components).filter(([key]) => !key.startsWith('$')).map(([key, values]) => [key, Object.keys(values)]));
const runtime = { paletteVariables, themes: runtimeThemes, neutrals: runtimeNeutral, colors: runtimeColors, scales: runtimeScales, aliases: roles, bindings, densityBindings, themeBindings, neutralBindings, colorBindings };
const bridge = {
  'font-sans': 'font-sans', 'font-heading': 'font-sans', 'font-mono': 'font-mono', spacing: 'space-1',
  'text-xs': 'font-caption', 'text-sm': 'font-interface', 'text-base': 'font-reading', 'text-lg': 'font-subheading', 'text-xl': 'text-xl', 'text-2xl': 'font-heading', 'text-3xl': 'font-display',
  'text-xs--line-height': 'line-caption', 'text-sm--line-height': 'line-interface', 'text-base--line-height': 'line-reading', 'text-lg--line-height': 'text-2xl', 'text-xl--line-height': 'text-2xl', 'text-2xl--line-height': 'line-heading', 'text-3xl--line-height': 'line-display',
  'font-weight-normal': 'font-weight-regular', 'font-weight-medium': 'font-weight-medium', 'font-weight-semibold': 'font-weight-semibold', 'font-weight-bold': 'font-weight-bold',
  radius: 'radius-xs', 'radius-full': 'radius-full', 'radius-2xs': 'radius-2xs', 'radius-xs': 'radius-xs', 'radius-sm': 'radius-sm', 'radius-md': 'radius-md', 'radius-lg': 'radius-lg', 'radius-xl': 'radius-composer', 'radius-2xl': 'radius-2xl', 'radius-3xl': 'radius-3xl', 'radius-4xl': 'radius-full',
  shadow: 'shadow-subtle', 'shadow-2xs': 'shadow-subtle', 'shadow-xs': 'shadow-subtle', 'shadow-sm': 'shadow-subtle', 'shadow-md': 'shadow-popover', 'shadow-lg': 'shadow-popover', 'shadow-xl': 'shadow-dialog', 'shadow-2xl': 'shadow-dialog',
  'default-transition-duration': 'duration-fast', 'default-transition-timing-function': 'ease', 'blur-sm': 'blur-overlay',
  'tracking-tight': 'tracking-tight', 'tracking-wide': 'tracking-wide', 'tracking-widest': 'tracking-widest',
  'max-width-prose': 'prose-width',
};
for (const name of Object.keys(source.foundation)) {
  if (name.startsWith('space-')) bridge[`spacing-${name.slice(6)}`] = name;
  if (name.startsWith('leading-') || name.startsWith('container-')) bridge[name] = name;
}
const animations = Object.entries({ in: 'enter', out: 'exit', 'accordion-down': 'accordion-down', 'accordion-up': 'accordion-up', 'collapsible-down': 'collapsible-down', 'collapsible-up': 'collapsible-up' }).map(([name,keyframes]) => `  --animate-${name}: ${keyframes} var(--tw-animation-duration,var(--tw-duration,var(--rui-duration-${name === 'in' || name === 'out' ? 'fast' : 'normal'}))) var(--tw-ease,var(--rui-ease)) var(--tw-animation-delay,0s) var(--tw-animation-iteration-count,1) var(--tw-animation-direction,normal) var(--tw-animation-fill-mode,none);`).join('\n');
// Container tokens also compile into query conditions, where CSS var() is invalid.
// Resolve only this namespace at build time; ordinary visual roles stay live vars.
const bridgeDeclarations = Object.entries(bridge).map(([name,role])=>`  --${name}: ${name.startsWith('container-') ? resolve(source.foundation[role]) : `var(--rui-${role})`};`).join('\n');
const tailwind = `/* Generated semantic bridge; values remain in tokens.json. */\n@theme inline {\n${Object.keys(roles).map(name=>`  --color-${name}: var(--${name});`).join('\n')}\n${bridgeDeclarations}\n  --animate-spin: spin var(--rui-duration-spin) linear infinite;\n  --animate-pulse: pulse var(--rui-duration-pulse) var(--rui-ease) infinite;\n  --animate-caret-blink: caret-blink var(--rui-duration-caret) var(--rui-ease) infinite;\n${animations}\n}\n`;
// Numeric-only component APIs cannot consume CSS values. Keep their build-time
// defaults generated from the same source; rem conversion uses the 16px baseline.
const metrics = Object.fromEntries(flatten(source.foundation).flatMap(([name, value]) => {
  const match = /^(?<value>-?[\d.]+)(?<unit>px|rem|ms|s)$/.exec(value);
  if (!match) return [];
  return [[name, Number(match.groups.value) * (match.groups.unit === 'rem' ? 16 : match.groups.unit === 's' ? 1000 : 1)]];
}));
const outputs = [
  [new URL('packages/tokens/dist/themes.js', root), `/* Generated runtime color presets. Edit src/tokens.json. */\nexport const themeTokens = ${JSON.stringify(runtime, null, 2)};\n`],
  [new URL('packages/tokens/dist/themes.d.ts', root), `export type ColorPalette = ${Object.keys(runtimeColors).map(v=>JSON.stringify(v)).join(' | ')};\nexport type NeutralPalette = 'graphite' | ${Object.keys(runtimeNeutral).map(v=>JSON.stringify(v)).join(' | ')};\nexport declare const themeTokens: { themes: Record<'dark' | 'light', Record<string, string>>; neutrals: Record<Exclude<NeutralPalette, 'graphite'>, Record<'dark' | 'light', Record<string, string>>>; colors: Record<ColorPalette, Record<'dark' | 'light', Record<string, string>>>; scales: Record<string, Record<string, string>>; paletteVariables: Record<string, Record<string, string>>; aliases: Record<string, string>; bindings: Record<string, string>; densityBindings: Record<'compact' | 'comfortable', Record<string, string>>; themeBindings: Record<'dark' | 'light', Record<string, string>>; neutralBindings: Record<string, Record<'dark' | 'light', Record<string, string>>>; colorBindings: Record<ColorPalette, Record<'dark' | 'light', Record<string, string>>> };\nexport type SemanticTokenName = ${tokenKeys.map(v=>JSON.stringify(v)).join(' | ')};\nexport type ComponentTokenOverrides = {\n${Object.entries(componentKeys).map(([name, keys])=>`  ${JSON.stringify(name)}?: Partial<Record<${keys.map(v=>JSON.stringify(v)).join(' | ')}, string>>;`).join('\n')}\n};\nexport type ThemeTokenOverrides = { semantic?: Partial<Record<SemanticTokenName, string>>; components?: ComponentTokenOverrides };\n`],
  [new URL('packages/tokens/dist/tokens.css', root), css + aliases + `\n:root { --rui-color-text: var(--rui-text); --rui-color-soft: var(--rui-hover); --rui-color-border: var(--rui-border-strong); }\n`],
  [new URL('packages/tokens/dist/tailwind.css', root), tailwind],
  [new URL('packages/tokens/dist/metrics.js', root), `/* Generated numeric API defaults; px and ms, rem at a 16px root. */\nexport const tokenMetrics = Object.freeze(${JSON.stringify(metrics, null, 2)});\n`],
  [new URL('packages/tokens/dist/metrics.d.ts', root), `export declare const tokenMetrics: Readonly<{\n${Object.keys(metrics).map(name=>`  readonly '${name}': number;`).join('\n')}\n}>;\n`],
];
if (process.argv.includes('--check')) {
  for (const [output, expected] of outputs) {
    const current = await readFile(output, 'utf8').catch(() => '');
    if (current !== expected) throw new Error('Generated tokens differ. Run npm run tokens:build.');
  }
  console.log('Design tokens are synchronized; references resolved.');
} else {
  await mkdir(new URL('packages/tokens/dist/', root), { recursive: true });
  for (const [output, content] of outputs) { await writeFile(output, content); console.log(`Generated ${fileURLToPath(output)}`); }
}
