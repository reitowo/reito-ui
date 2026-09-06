import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import ts from 'typescript';

// This is a source audit, not a CSS compiler. It follows static JSX/class helper
// strings and inline styles, then checks their contract against the generated
// Tailwind bridge. Dynamic data and structural geometry are reported separately.
const root = fileURLToPath(new URL('../', import.meta.url));
const roots = ['packages/ui/src', 'apps/lab/src', 'apps/workbench/src', 'apps/storybook/stories', 'apps/storybook/.storybook'];
const slash = value => value.replaceAll('\\', '/');
const physical = /(?<![\w-])-?(?:\d*\.)?\d+(?:px|r?em|ch|ex|pt|pc|cm|mm|in|ms|s)\b/i;
const rawColor = /#[\da-f]{3,8}\b|\b(?:rgb|rgba|hsl|hsla|oklch|oklab|lab|lch|color)\(\s*[\d.]/i;
const palette = /^(?:bg|text|border(?:-[trblxyse])?|divide|ring(?:-offset)?|outline|fill|stroke|decoration|shadow|from|via|to)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)(?:-\d+)?(?:\/.*)?$/;
const visualProperty = /^(?:(?:min|max)?(?:Width|Height)|width|height|size|fontSize|fontWeight|lineHeight|letterSpacing|borderRadius|borderWidth|boxShadow|padding\w*|margin\w*|gap|rowGap|columnGap|top|right|bottom|left|inset\w*|zIndex|opacity|transitionDuration|animationDuration|strokeWidth|sideOffset|alignOffset|collisionPadding|delay|delayDuration)$/;
const cssVisualProperty = /^(?:--[\w-]+|(?:min-|max-)?(?:width|height)|font(?:-size|-weight|-family)?|line-height|letter-spacing|border(?:-[\w-]+)?|outline(?:-[\w-]+)?|(?:box|text)-shadow|padding(?:-[\w-]+)?|margin(?:-[\w-]+)?|(?:row-|column-)?gap|top|right|bottom|left|inset(?:-[\w-]+)?|z-index|opacity|transition(?:-[\w-]+)?|animation(?:-[\w-]+)?|grid-template-(?:rows|columns)|transform|translate|rotate|scale)$/;

function compileTimeTokenBridge(name, value, data) {
  // Container theme values also compile into @container queries, where var()
  // is invalid. Only the exact resolved source dimension is accepted here.
  if (!/^--container-(?:[23]?xs|sm|md|lg|xl|[2-7]xl)$/.test(name)) return false;
  let token = data.foundation?.[name.slice(2)]; const seen = new Set();
  while (typeof token?.$value === 'string' && /^\{.+\}$/.test(token.$value)) {
    const reference = token.$value.slice(1, -1);
    if (seen.has(reference)) return false;
    seen.add(reference);
    token = reference.split('.').reduce((node, key) => node?.[key], data);
  }
  return token?.$type === 'dimension' && value === `${token.$value.value}${token.$value.unit}`;
}

function splitClasses(value) {
  const parts = []; let start = 0; let depth = 0;
  for (let index = 0; index <= value.length; index++) {
    const char = value[index];
    if ('[('.includes(char ?? '\0')) depth++;
    if ('])'.includes(char ?? '\0')) depth--;
    if (index === value.length || /\s/.test(char) && depth === 0) {
      if (index > start) parts.push({ value: value.slice(start, index), offset: start });
      start = index + 1;
    }
  }
  return parts;
}

function baseUtility(value) {
  let depth = 0; let start = 0;
  for (let index = 0; index < value.length; index++) {
    if ('[('.includes(value[index])) depth++;
    if ('])'.includes(value[index])) depth--;
    if (value[index] === ':' && depth === 0) start = index + 1;
  }
  return value.slice(start).replace(/^!|!$/g, '').replace(/^-/, '');
}

function utilityContract(full) {
  const value = baseUtility(full);
  if (palette.test(value) || /^(?:bg|text|border|ring|fill|stroke|shadow)-(?:black|white)(?:\/.*)?$/.test(value) || rawColor.test(value)) return { kind: 'raw-color', status: 'violation', reason: 'Use a semantic theme color.' };
  if (physical.test(value) || /^(?:duration|delay|ease|easing)-\[(?!.*var\(|.*--rui-)/.test(value) || /^(?:z|opacity|font|leading|tracking)-\[-?[\d.]+\]$/.test(value)) return { kind: 'arbitrary-literal', status: 'violation', reason: 'Literal visual value bypasses tokens, including literals mixed with var().'};
  if (/--rui-[\w-]+|var\(|-\(--|--spacing\(/.test(value)) return { kind: 'token-utility', status: 'token-backed', reason: 'Consumes a token or a runtime/library CSS custom property.' };
  if (/\[/.test(value)) {
    if (/^(?:grid-(?:rows|cols)|(?:min-|max-)?[wh]|(?:inset|top|right|bottom|left)|translate-[xy]|aspect)-\[/.test(value)) return { kind: 'structural-utility', status: 'structural', reason: 'Dimensionless track, fraction, viewport percentage, or intrinsic geometry.' };
    if (/^(?:transition|origin|rounded|content|grid|flex|ease|easing)-\[/.test(value) || /^\[/.test(value)) return { kind: 'structural-utility', status: 'structural', reason: 'CSS property selection, inheritance, selector, or non-visual geometry.' };
    return null;
  }
  if (/^(?:(?:p|m)[xytrblse]?|(?:min-|max-)?[wh]|size|gap(?:-[xy])?|space-[xy]|border-spacing(?:-[xy])?|inset(?:-[xyse])?|top|right|bottom|left|start|end|translate-[xy]|scroll-[mp][xytrblse]?|leading|indent|basis|slide-(?:in|out)-(?:from|to)-(?:top|right|bottom|left))-\d+(?:\.\d+)?$/.test(value)) return { kind: 'scale-utility', theme: '--spacing', reason: 'Numeric Tailwind spacing multiplies the generated token-backed base unit.' };
  let match = value.match(/^(?:p[xytrblse]?|m[xytrblse]?|(?:min-|max-)?[wh]|size|inset(?:-[xy])?|top|right|bottom|left|translate-[xy])-px$/);
  if (match) return { kind: 'hairline-utility', status: 'structural', reason: 'One physical pixel is an optical alignment/hairline contract, not a spacing role.' };
  match = value.match(/^text-(xs|sm|base|lg|xl|[2-9]xl)(?:\/.*)?$/);
  if (match) return { kind: 'typography-utility', theme: `--text-${match[1]}`, reason: 'Font size must resolve through the generated typography bridge.' };
  match = value.match(/^font-(sans|serif|mono|thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/);
  if (match) return { kind: 'typography-utility', theme: `--${['sans','serif','mono'].includes(match[1]) ? 'font' : 'font-weight'}-${match[1]}`, reason: 'Font family/weight must resolve through the generated typography bridge.' };
  match = value.match(/^(leading|tracking)-(none|tight|snug|normal|relaxed|loose|tighter|wide|wider|widest)$/);
  if (match) return { kind: 'typography-utility', theme: `--${match[1]}-${match[2]}`, reason: 'Line-height/letter-spacing must resolve through the generated typography bridge.' };
  match = value.match(/^rounded(?:-(?:t|r|b|l|s|e|tl|tr|br|bl|ss|se|es|ee))?(?:-(none|full|[234]?xs|sm|md|lg|xl|[234]xl))?$/);
  if (match) return match[1] === 'none' ? { kind: 'structural-utility', status: 'structural', reason: 'Square corner reset.' } : { kind: 'radius-utility', theme: `--radius-${match[1] ?? 'DEFAULT'}`, reason: 'Corner radius must resolve through the generated radius bridge.' };
  match = value.match(/^shadow(?:-(none|2xs|xs|sm|md|lg|xl|2xl))?$/);
  if (match) return match[1] === 'none' ? { kind: 'structural-utility', status: 'structural', reason: 'Shadow reset.' } : { kind: 'shadow-utility', theme: `--shadow-${match[1] ?? 'DEFAULT'}`, reason: 'Elevation must resolve through the generated shadow bridge.' };
  match = value.match(/^(blur|backdrop-blur)(?:-(none|xs|sm|md|lg|xl|2xl|3xl))?$/);
  if (match) return match[2] === 'none' ? { kind: 'structural-utility', status: 'structural', reason: 'Blur reset.' } : { kind: 'effect-utility', theme: `--blur-${match[2] ?? 'DEFAULT'}`, reason: 'Blur must resolve through the generated effect bridge.' };
  if (/^(?:duration|delay|z)-\d+$/.test(value)) return { kind: 'numeric-style-utility', status: 'violation', reason: 'Numeric duration, delay, or stacking level needs a semantic role or exact reviewed exception.' };
  if (/^(?:ring|outline|outline-offset|border(?:-[trblxyse])?|divide(?:-[xy])?)(?:-\d+)?$/.test(value)) {
    if (/(?:-0|-1)$/.test(value) || !/\d$/.test(value)) return { kind: 'hairline-utility', status: 'structural', reason: 'Zero/reset or one physical pixel boundary; theme controls its semantic color.' };
    return { kind: 'numeric-style-utility', status: 'violation', reason: 'Thicker boundaries or focus offsets must use the shared outline/border token.' };
  }
  if (/^ease-(linear|in|out|in-out)$/.test(value)) return value === 'ease-linear' ? { kind: 'structural-utility', status: 'structural', reason: 'Linear interpolation is functional geometry; no branded easing curve.' } : { kind: 'motion-utility', theme: `--${value}`, reason: 'Easing must resolve through the generated motion bridge.' };
  if (/^transition(?:-(all|colors|opacity|shadow|transform))?$/.test(value)) return { kind: 'motion-utility', theme: '--default-transition-duration', additionalTheme: '--default-transition-timing-function', reason: 'Default transitions must use shared duration and easing.' };
  if (/^animate-(spin|pulse|ping|bounce|caret-blink)$/.test(value)) return { kind: 'motion-utility', theme: `--${value}`, reason: 'Canned animations must use the generated motion bridge.' };
  if (/^(?:opacity|scale|rotate|zoom-in|zoom-out|fade-in|fade-out)-\d+/.test(value) || /^(?:grid-(?:cols|rows)|col-span|row-span|order|grow|shrink|flex)-\d+/.test(value) || /^(?:(?:min-|max-)?[wh]|inset(?:-[xy])?|top|right|bottom|left|translate-[xy])-\d+\/\d+$/.test(value)) return { kind: 'structural-utility', status: 'structural', reason: 'Dimensionless count, proportion, state opacity, or transform endpoint.' };
  if (value === 'max-w-prose') return { kind: 'layout-utility', theme: '--max-width-prose', reason: 'Prose width must resolve through the generated reading width bridge.' };
  match = value.match(/^(?:max|min)-w-([23]?xs|sm|md|lg|xl|[2-7]xl)$/);
  if (match) return { kind: 'layout-utility', theme: `--container-${match[1]}`, reason: 'Named layout width must resolve through the generated layout bridge.' };
  return null;
}

function utilityContracts(full) {
  const direct = utilityContract(full);
  const queries = [...full.matchAll(/(?:^|:)@(?:min-|max-)?([23]?xs|sm|md|lg|xl|[2-7]xl)(?:\/[\w-]+)?(?=:)/g)].map(match => ({ kind: 'layout-query-utility', theme: `--container-${match[1]}`, reason: 'Named container query must compile to the exact token-source dimension, never an unresolved runtime var().' }));
  return [...(direct ? [direct] : []), ...queries];
}

function styleValueContract(property, value) {
  if (rawColor.test(value) || /^(?:black|white|red|blue|green|yellow|gray|grey|rebeccapurple)$/.test(value)) return { kind: 'raw-color', status: 'violation', reason: 'Use a semantic theme color.' };
  if (physical.test(value) || /^(?:fontWeight|font-weight|lineHeight|line-height|zIndex|z-index|opacity|letterSpacing|letter-spacing|strokeWidth)$/.test(property) && /^-?[\d.]+$/.test(value) && !/^(?:0|1)$/.test(value)) return { kind: 'literal-style', status: 'violation', reason: 'Static CSS/inline visual value bypasses tokens.' };
  if (visualProperty.test(property) && /^-?(?:\d*\.)?\d+$/.test(value) && value !== '0') return { kind: 'literal-style', status: 'violation', reason: 'React numeric size/offset/duration is a literal visual value.' };
  if (/--rui-\$\{/.test(value)) return { kind: 'runtime-token', status: 'runtime', reason: 'Token name is assembled from data; static references elsewhere are checked, but the complete runtime name needs source review.' };
  if (/var\(|--rui-|tokens\.|tokenMetrics\[|foundation\.|cssToken\(|readToken\(/.test(value)) return { kind: 'token-style', status: 'token-backed', reason: 'Consumes a static token or a runtime token resolver.' };
  if (/^(?:translate(?:[XYZ]|3d)?|rotate(?:[XYZ]|3d)?|scale(?:[XYZ]|3d)?)\([-\d.,%\s]*(?:deg|rad|turn)?\)$/.test(value)) return { kind: 'structural-style', status: 'structural', reason: 'Static dimensionless transform or angular endpoint, independent of the visual scale.' };
  if (/(?:\$\{|[a-zA-Z]\w*\(|^[a-zA-Z_$]\w*$)/.test(value) && !/^(?:none|auto|inherit|initial|unset|normal|bold|thin|medium|thick|sans-serif|serif|monospace)$/.test(value)) return { kind: 'runtime-style', status: 'runtime', reason: 'Caller data or computed geometry; inspect source expression rather than a fixed visual baseline.' };
  return { kind: 'structural-style', status: 'structural', reason: 'Zero, reset, intrinsic size, percentage, or dimensionless layout geometry.' };
}

function styleString(node) {
  let cursor = node;
  while (cursor?.parent) {
    const parent = cursor.parent;
    if (ts.isJsxAttribute(parent)) return /^(?:className|classNames|viewportClassName|contentClassName|containerClassName)$/.test(parent.name.getText());
    if (ts.isCallExpression(parent) && /(?:^|\.)(?:cn|cx|cva|clsx|classes|classNames)$/.test(parent.expression.getText())) return true;
    if (ts.isPropertyAssignment(parent) && /^(?:className|classNames)$/.test(parent.name.getText().replace(/["']/g, ''))) return true;
    if (ts.isStatement(parent) || ts.isJsxElement(parent) || ts.isJsxSelfClosingElement(parent)) return false;
    cursor = parent;
  }
  return false;
}

async function walk(dir) {
  const entries = await readdir(path.join(root, dir), { withFileTypes: true });
  return (await Promise.all(entries.map(entry => entry.isDirectory() ? walk(`${dir}/${entry.name}`) : `${dir}/${entry.name}`))).flat();
}

function scanSource(file, text, emit) {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const add = (node, value, result, offset = 0) => emit({ file, line: source.getLineAndCharacterOfPosition(node.getStart(source) + offset).line + 1, value, ...result });
  const bindings = new Map();
  const namesOf = node => ts.isIdentifier(node) ? [node.text] : ts.isObjectBindingPattern(node) || ts.isArrayBindingPattern(node) ? node.elements.filter(ts.isBindingElement).flatMap(element => namesOf(element.name)) : [];
  const register = (scope, name, initializer) => {
    if (!bindings.has(scope)) bindings.set(scope, new Map());
    bindings.get(scope).set(name, initializer);
  };
  function collectConstants(node) {
    if (ts.isVariableDeclaration(node)) {
      let scope = node.parent;
      while (scope.parent && !ts.isBlock(scope) && !ts.isSourceFile(scope)) scope = scope.parent;
      for (const name of namesOf(node.name)) register(scope, name, ts.isIdentifier(node.name) && (node.parent.flags & ts.NodeFlags.Const) ? node.initializer : null);
    }
    if (ts.isParameter(node)) {
      for (const name of namesOf(node.name)) register(node.parent, name, null);
    }
    ts.forEachChild(node, collectConstants);
  }
  collectConstants(source);
  function initializerOf(node) {
    let scope = node.parent;
    while (scope) {
      if (bindings.get(scope)?.has(node.text)) return bindings.get(scope).get(node.text);
      scope = scope.parent;
    }
    return undefined;
  }
  function staticValue(node, seen = new Set()) {
    if (ts.isStringLiteralLike(node)) return node.text;
    if (ts.isNumericLiteral(node)) return Number(node.text);
    if (ts.isParenthesizedExpression(node) || ts.isAsExpression(node)) return staticValue(node.expression, seen);
    if (ts.isIdentifier(node)) {
      const initializer = initializerOf(node);
      if (initializer && !seen.has(initializer)) return staticValue(initializer, new Set([...seen, initializer]));
    }
    if (ts.isPrefixUnaryExpression(node)) {
      const operand = staticValue(node.operand, seen);
      if (typeof operand === 'number' && node.operator === ts.SyntaxKind.MinusToken) return -operand;
    }
    if (ts.isBinaryExpression(node)) {
      const left = staticValue(node.left, seen); const right = staticValue(node.right, seen);
      if (typeof left !== 'number' || typeof right !== 'number') return undefined;
      const operations = { [ts.SyntaxKind.PlusToken]: () => left + right, [ts.SyntaxKind.MinusToken]: () => left - right, [ts.SyntaxKind.AsteriskToken]: () => left * right, [ts.SyntaxKind.SlashToken]: () => left / right };
      return operations[node.operatorToken.kind]?.();
    }
    return undefined;
  }
  function inspectStyleObject(node) {
    if (ts.isAsExpression(node) || ts.isParenthesizedExpression(node) || ts.isSatisfiesExpression(node)) return inspectStyleObject(node.expression);
    if (!ts.isObjectLiteralExpression(node)) return;
    for (const member of node.properties) {
      if (!ts.isPropertyAssignment(member)) continue;
      const name = member.name.getText(source).replace(/^["']|["']$/g, '');
      const value = String(staticValue(member.initializer) ?? member.initializer.getText(source));
      add(member, `${name}: ${value}`, styleValueContract(name, value));
    }
  }
  function visit(node) {
    if (ts.isIdentifier(node) && !(ts.isJsxAttribute(node.parent) && node.parent.name === node) && !(ts.isPropertyAccessExpression(node.parent) && node.parent.name === node) && styleString(node)) {
      const resolved = staticValue(node);
      if (typeof resolved === 'string') for (const part of splitClasses(resolved)) {
        for (const contract of utilityContracts(part.value)) add(node, part.value, { ...contract, reason: `${contract.reason} Resolved from static ${node.text}.` });
      }
    }
    if (ts.isCallExpression(node) && /(?:^|\.)matchMedia$/.test(node.expression.getText(source))) {
      const query = node.arguments[0];
      if (query && ts.isStringLiteralLike(query) && physical.test(query.text)) add(query, `matchMedia(${query.text})`, { kind: 'breakpoint', status: 'violation', reason: 'Static JS media query must match an exact reviewed CSS layout breakpoint.' });
      else if (query) add(query, query.getText(source), { kind: 'runtime-query', status: 'runtime', reason: 'Computed media query; the numeric breakpoint declaration is scanned separately.' });
    }
    if (ts.isStringLiteralLike(node) && styleString(node)) for (const part of splitClasses(node.text)) {
      for (const contract of utilityContracts(part.value)) add(node, part.value, contract, part.offset + 1);
    }
    if (ts.isTemplateExpression(node) && styleString(node)) {
      for (const fragment of [node.head, ...node.templateSpans.map(span => span.literal)]) for (const part of splitClasses(fragment.text)) {
        for (const contract of utilityContracts(part.value)) add(fragment, part.value, contract, part.offset + 1);
      }
      add(node, node.getText(source), { kind: 'runtime-class', status: 'runtime', reason: 'Dynamic class expression; all static template fragments are scanned, runtime values need caller review.' });
    }
    if (ts.isJsxAttribute(node) && node.name.getText(source) === 'style' && node.initializer && ts.isJsxExpression(node.initializer) && node.initializer.expression) inspectStyleObject(node.initializer.expression);
    if (ts.isJsxAttribute(node) && visualProperty.test(node.name.getText(source)) && node.initializer) {
      const expr = ts.isJsxExpression(node.initializer) ? node.initializer.expression : node.initializer;
      const value = expr ? staticValue(expr) : undefined;
      if (value !== undefined && (typeof value === 'number' || physical.test(value) || /^\d+$/.test(value))) add(node, `${node.name.getText(source)}=${value}`, styleValueContract(node.name.getText(source), String(value)));
    }
    if ((ts.isVariableDeclaration(node) || ts.isBindingElement(node) || ts.isParameter(node)) && node.initializer) {
      const name = node.name.getText(source);
      const value = ts.isStringLiteralLike(node.initializer) ? node.initializer.text : node.initializer.getText(source);
      if (visualProperty.test(name) || /(?:WIDTH|HEIGHT|RADIUS|BREAKPOINT|DURATION|DELAY|OFFSET|FONT_SIZE)$/.test(name)) {
        if (physical.test(value) || /^\d+(?:\.\d+)?$/.test(value) || /tokenMetrics\[/.test(value)) add(node, `${name}=${value}`, /BREAKPOINT/.test(name) ? { kind: 'breakpoint', status: 'violation', reason: 'JS layout breakpoint must use a token import or exact reviewed CSS/JS synchronization exception.' } : styleValueContract(name, value));
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
}

function scanCss(file, text, emit, offset = 0) {
  const lineAt = index => text.slice(0, index).split('\n').length + offset;
  const clean = text.replace(/\/\*[\s\S]*?\*\//g, value => value.replace(/[^\n]/g, ' '));
  for (const match of clean.matchAll(/@(?:media|container)\s*([^{}]+)\{/g)) if (physical.test(match[1])) emit({ file, line: lineAt(match.index), value: match[0].slice(0,-1).trim(), kind: 'breakpoint', status: 'violation', reason: 'CSS queries cannot resolve runtime CSS variables; review the exact breakpoint against token source.' });
  for (const match of clean.matchAll(/(?:^|[;{])\s*([\w-]+)\s*:\s*([^;{}]+)(?=[;}])/g)) {
    const [, property, original] = match; const value = original.replace(/\s*!important\s*$/, '').trim();
    if (cssVisualProperty.test(property) || rawColor.test(value)) emit({ file, line: lineAt(match.index + match[0].indexOf(property)), value: `${property}: ${value}`, ...styleValueContract(property, value) });
  }
  for (const match of clean.matchAll(/@apply\s+([^;]+);/g)) for (const part of splitClasses(match[1])) {
    for (const contract of utilityContracts(part.value)) emit({ file, line: lineAt(match.index), value: part.value, ...contract });
  }
}

function selfTest() {
  assert.equal(utilityContract('hover:bg-zinc-900').kind, 'raw-color');
  assert.equal(utilityContract('bg-[#123456]').kind, 'raw-color');
  assert.equal(utilityContract('rounded-[min(var(--radius),12px)]').kind, 'arbitrary-literal');
  assert.equal(utilityContract('text-[0.8rem]').kind, 'arbitrary-literal');
  assert.equal(utilityContract('[&_svg]:size-3.5').theme, '--spacing');
  assert.equal(utilityContract('text-sm').theme, '--text-sm');
  assert.equal(utilityContract('shadow-lg').theme, '--shadow-lg');
  assert.equal(utilityContract('focus-visible:ring-3').status, 'violation');
  assert.equal(utilityContract('z-50').status, 'violation');
  assert.equal(utilityContract('p-[var(--rui-content-padding)]').status, 'token-backed');
  assert.equal(utilityContract('grid-cols-[auto_minmax(0,1fr)_auto]').status, 'structural');
  assert.equal(styleValueContract('width', 'calc(100% - 24px)').status, 'violation');
  assert.equal(styleValueContract('width', '`${percent}%`').status, 'runtime');
  assert.equal(styleValueContract('fontWeight', '550').status, 'violation');
  const findings = [];
  scanSource('fixture.tsx', `const variant = cva('p-2', {variants:{size:{sm:'text-[11px]'}}}); const node = <div className={cn('bg-red-500', active && 'z-50')} style={{width:240, background:'#fff'}}><Icon size={17}/></div>; const code = 'bg-red-400';`, item => findings.push(item));
  assert(findings.some(item => item.value === 'text-[11px]'));
  assert(findings.some(item => item.value === 'bg-red-500'));
  assert(findings.some(item => item.value === 'width: 240'));
  assert(findings.some(item => item.value === 'size=17'));
  assert(!findings.some(item => item.value === 'bg-red-400'));
  const css = [];
  scanCss('fixture.css', '.x { color: #fff; gap: 11px; margin: var(--rui-space-2); } @media(max-width:640px) { .y {font-size: 14px;} }', item => css.push(item));
  assert(css.some(item => item.kind === 'raw-color'));
  assert(css.some(item => item.value === 'gap: 11px' && item.status === 'violation'));
  assert(css.some(item => item.kind === 'breakpoint'));
  const indirect = [];
  scanSource('indirect.tsx', `const WIDTH=12; const SHADE='#fff'; const CLASS='p-[11px]'; const node=<div className={CLASS} style={{width:WIDTH*2,color:SHADE}}/>;`, item => indirect.push(item));
  assert(indirect.some(item => item.value === 'p-[11px]' && item.status === 'violation'));
  assert(indirect.some(item => item.value === 'width: 24' && item.status === 'violation'));
  assert(indirect.some(item => item.value === 'color: #fff' && item.status === 'violation'));
  const shadowed = [];
  scanSource('shadowed.tsx', `const className='p-[11px]'; function A({className}){return <div className={className}/>;} function B(){ const className='p-2';return <div className={className}/>;}`, item => shadowed.push(item));
  assert(!shadowed.some(item => item.value === 'p-[11px]'));
  assert.equal(shadowed.filter(item => item.value === 'p-2').length, 1);
  const dimensionSource = { foundation: { 'container-sm': { $type: 'dimension', $value: { value: 24, unit: 'rem' } } } };
  assert.equal(compileTimeTokenBridge('--container-sm', '24rem', dimensionSource), true);
  assert.equal(compileTimeTokenBridge('--container-sm', '25rem', dimensionSource), false);
  assert.equal(compileTimeTokenBridge('--text-sm', '24rem', dimensionSource), false);
  assert.equal(compileTimeTokenBridge('--container-sm', 'var(--rui-container-sm)', dimensionSource), false);
  assert(utilityContracts('@2xl:flex-row').some(contract => contract.theme === '--container-2xl'));
  assert(utilityContracts('@lg/task-queue:px-2').some(contract => contract.theme === '--container-lg'));
  console.log('Design token audit self-test: 33 assertions passed.');
}

async function main() {
  if (process.argv.includes('--self-test')) { selfTest(); return; }
  const files = (await Promise.all(roots.map(walk))).flat().filter(file => /\.(?:css|[jt]sx?|html)$/.test(file)).sort();
  const tokenCss = await readFile(path.join(root, 'packages/tokens/dist/tokens.css'), 'utf8');
  const bridgeCss = await readFile(path.join(root, 'packages/tokens/dist/tailwind.css'), 'utf8');
  const tokenSource = JSON.parse(await readFile(path.join(root, 'packages/tokens/src/tokens.json'), 'utf8'));
  const defined = new Set([...tokenCss.matchAll(/(--rui-[\w-]+)\s*:/g)].map(match => match[1]));
  const bridge = new Map([...bridgeCss.matchAll(/(--[\w-]+)\s*:\s*([^;{}]+);/g)].map(match => [match[1], match[2].trim()]));
  const policy = JSON.parse(await readFile(path.join(root, 'docs/design-token-policy.json'), 'utf8'));
  if (policy.version !== 1 || !Array.isArray(policy.exceptions)) throw new Error('Unsupported token policy schema.');
  const findings = []; const emit = item => findings.push(item);
  for (const file of files) {
    const content = await readFile(path.join(root, file), 'utf8');
    for (const match of content.matchAll(/--rui-[\w-]+/g)) if (!defined.has(match[0])) emit({ file, line: content.slice(0, match.index).split('\n').length, value: match[0], kind: 'undefined-token', status: 'violation', reason: 'Static --rui reference has no declaration in generated token source.' });
    if (file.endsWith('.css')) scanCss(file, content, emit);
    else if (file.endsWith('.html')) for (const match of content.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) scanCss(file, match[1], emit, content.slice(0, match.index + match[0].indexOf(match[1])).split('\n').length - 1);
    else scanSource(file, content, emit);
  }
  const bridgeBacked = (name, seen = new Set()) => {
    if (!bridge.has(name) || seen.has(name)) return false;
    const value = bridge.get(name);
    if (/^--container-/.test(name)) return compileTimeTokenBridge(name, value, tokenSource);
    if (/--rui-[\w-]+/.test(value)) return [...value.matchAll(/--rui-[\w-]+/g)].every(match => defined.has(match[0]));
    const refs = [...value.matchAll(/var\((--[\w-]+)/g)].map(match => match[1]);
    return refs.length > 0 && refs.every(ref => bridgeBacked(ref, new Set([...seen, name])));
  };
  for (const finding of findings) if (finding.theme) {
    // Tailwind's default shadow/radius name is the unsuffixed CSS theme key.
    const name = finding.theme.replace(/-DEFAULT$/, '');
    const valid = bridgeBacked(name) && (!finding.additionalTheme || bridgeBacked(finding.additionalTheme));
    finding.status = valid ? 'token-backed' : 'violation';
    if (valid && compileTimeTokenBridge(name, bridge.get(name), tokenSource)) {
      finding.resolution = 'compile-time-token';
      finding.reason += ' Generated query-compatible dimension exactly matches tokens.json; CSS variables are invalid in container queries.';
    }
    if (!valid) { finding.kind = 'unbridged-utility'; finding.reason += ` Missing token-backed ${name}${finding.additionalTheme ? ` / ${finding.additionalTheme}` : ''}.`; }
  }
  const exceptionHits = new Map();
  for (const exception of policy.exceptions) {
    if (!exception.id || !exception.file || /[*?]/.test(exception.file) || !exception.kind || !exception.value || typeof exception.reason !== 'string' || exception.reason.length < 20 || !Number.isInteger(exception.maxOccurrences) || exception.maxOccurrences < 1) throw new Error(`Invalid exact reviewed exception: ${exception.id ?? '(missing id)'}`);
    if (['raw-color','undefined-token','unbridged-utility'].includes(exception.kind)) throw new Error(`Cannot waive palette, undefined token, or missing bridge: ${exception.id}`);
    const matches = findings.filter(item => item.file === exception.file && item.kind === exception.kind && item.value === exception.value && item.status === 'violation');
    exceptionHits.set(exception.id, matches.length);
    if (matches.length > 0 && matches.length <= exception.maxOccurrences) for (const match of matches) { match.status = 'approved-exception'; match.exception = exception.id; match.reason = exception.reason; }
  }
  const policyProblems = policy.exceptions.flatMap(exception => {
    const hits = exceptionHits.get(exception.id);
    return hits === 0 ? [`Stale exception ${exception.id}: no matching violation; remove it.`] : hits > exception.maxOccurrences ? [`Exception ${exception.id}: ${hits} occurrences exceed reviewed maximum ${exception.maxOccurrences}.`] : [];
  });
  findings.sort((a,b) => a.file.localeCompare(b.file) || a.line-b.line || a.value.localeCompare(b.value));
  const countBy = key => Object.fromEntries([...new Set(findings.map(item => item[key]))].sort().map(value => [value, findings.filter(item => item[key] === value).length]));
  const violations = findings.filter(item => item.status === 'violation');
  const report = { generatedAt: new Date().toISOString(), scope: roots, filesScanned: files.length, files, summary: { byStatus: countBy('status'), byKind: countBy('kind'), violations: violations.length, policyProblems: policyProblems.length }, policyProblems, findings, limits: ['Static AST/CSS audit; arbitrary runtime class or style values remain visible as runtime findings and require review.', 'Generated code, dependencies, documentation code snippets, image/SVG path data, business constants, and test assertions are outside the visual-source scope.', 'Token-backed utilities share foundation scales; a source audit does not prove correct semantic role selection, visual similarity, accessibility, or layout behavior.'] };
  const outArgument = process.argv.indexOf('--out-dir');
  const outDir = path.resolve(root, outArgument >= 0 ? process.argv[outArgument + 1] : '.logs/design-token-audit');
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, 'inventory.json'), JSON.stringify(report, null, 2) + '\n');
  const cell = value => String(value).replaceAll('|','\\|').replaceAll('\n',' ');
  const md = [`# Design token source audit`, '', `Generated: ${report.generatedAt}`, '', `${files.length} files scanned. ${violations.length} unapproved findings.`, '', '| Status | Occurrences |', '| --- | ---: |', ...Object.entries(report.summary.byStatus).map(([key,value])=>`| ${key} | ${value} |`), '', '## Actionable findings and reviewed exceptions', '', '| Source | Kind | Expression | Status / reason |', '| --- | --- | --- | --- |', ...findings.filter(item => ['violation','approved-exception'].includes(item.status)).map(item=>`| ${item.file}:${item.line} | ${item.kind} | ${cell(item.value)} | ${item.status}: ${cell(item.reason)} |`), '', '## Scope and limits', '', ...report.limits.map(value=>`- ${value}`), '', 'Every occurrence, including token-backed utilities, structural rules, runtime expressions, and file inventory is available in inventory.json.', '', ...policyProblems.map(value=>`- Policy error: ${value}`), ''].join('\n');
  await writeFile(path.join(outDir, 'inventory.md'), md);
  console.log(`Design token audit: ${files.length} files; ${violations.length} unapproved; ${report.summary.byStatus['approved-exception'] ?? 0} exact reviewed exceptions; ${report.summary.byStatus['token-backed'] ?? 0} token-backed occurrences.`);
  console.log(`Inventory: ${slash(path.relative(root, outDir))}/inventory.{json,md}`);
  if (process.argv.includes('--check') && (violations.length || policyProblems.length)) {
    for (const finding of violations.slice(0, 80)) console.error(`${finding.file}:${finding.line} [${finding.kind}] ${finding.value} — ${finding.reason}`);
    for (const problem of policyProblems) console.error(problem);
    if (violations.length > 80) console.error(`... ${violations.length - 80} more; inspect inventory.json.`);
    process.exitCode = 1;
  }
}

await main();
