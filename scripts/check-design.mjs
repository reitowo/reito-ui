import { readFile, readdir } from 'node:fs/promises';

async function files(dir) { return (await Promise.all((await readdir(dir, {withFileTypes:true})).map(async entry => entry.isDirectory() ? files(`${dir}/${entry.name}`) : `${dir}/${entry.name}`))).flat(); }
const css = await readFile('packages/tokens/dist/tokens.css', 'utf8');
const defined = new Set([...css.matchAll(/(--rui-[\w-]+)\s*:/g)].map(match => match[1]));
const styles = (await Promise.all(['packages/ui/src','apps/lab/src','apps/workbench/src','apps/storybook/stories'].map(files))).flat().filter(file=>file.endsWith('.css'));
const problems = [];
// Browser-rendered menus are opt-in compatibility, never an application default.
const nativeSelectFiles = new Set([
  'packages/ui/src/native.ts',
  'packages/ui/src/primitives/native-select.tsx',
  'packages/ui/src/basic/catalog.tsx',
  'apps/storybook/stories/basic/native-select.stories.tsx',
]);
for (const file of (await Promise.all(['packages/ui/src','apps/lab/src','apps/workbench/src','apps/storybook/stories'].map(files))).flat().filter(file => /\.[jt]sx?$/.test(file))) {
  if (nativeSelectFiles.has(file)) continue;
  const content = await readFile(file, 'utf8');
  if (/\b(?:NativeSelect|NativeSelectOption|NativeSelectOptGroup)\b|<select\b|from\s+['"][^'"]*\/(?:native|native-select)(?:\.js)?['"]/.test(content)) {
    problems.push(`${file}: use SelectInput or Select; browser pickers belong only in the explicit native compatibility entry/demo`);
  }
}
const featureSources = (await Promise.all(['packages/ui/src/basic','packages/ui/src/complex','packages/ui/src/ai','apps/lab/src','apps/workbench/src'].map(files))).flat().filter(file => /\.[jt]sx?$/.test(file));
for (const file of featureSources) {
  const content = await readFile(file, 'utf8');
  if (/\b(?:bg|text|border|ring|fill|stroke)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+\b/.test(content)) problems.push(`${file}: raw Tailwind palette; use a semantic role`);
}
for (const file of (await Promise.all(['packages/ui/src/primitives','packages/ui/src/basic'].map(files))).flat().filter(file => /\.[jt]sx?$/.test(file))) {
  if (/from\s+['"][^'"]*\/(?:complex|ai)\//.test(await readFile(file,'utf8'))) problems.push(`${file}: foundation must not depend on application layers`);
}
for (const file of styles) for (const [,name] of (await readFile(file, 'utf8')).matchAll(/(--rui-[\w-]+)\s*:/g)) defined.add(name);
for (const file of styles) {
  const content = await readFile(file, 'utf8');
  for (const [,name] of content.matchAll(/var\((--rui-[\w-]+)/g)) if (!defined.has(name)) problems.push(`${file}: undefined token ${name}`);
  if (/(?:#[\da-f]{3,8}\b|\brgba?\(\s*\d|\bhsla?\(\s*\d)/i.test(content)) problems.push(`${file}: raw palette color; use semantic tokens`);
}
const data = JSON.parse(await readFile('packages/tokens/src/tokens.json', 'utf8'));
const lookup = path => path.split('.').reduce((value,key)=>value[key],data);
const color = token => typeof token.$value === 'string' ? color(lookup(token.$value.slice(1,-1))) : token.$value.components;
const luminance = rgb => rgb.map(n=>n <= .04045 ? n/12.92 : ((n+.055)/1.055)**2.4).reduce((sum,n,i)=>sum+n*[.2126,.7152,.0722][i],0);
const ratio = (a,b) => { const values=[luminance(color(a)),luminance(color(b))].sort((x,y)=>y-x); return (values[0]+.05)/(values[1]+.05); };
let contrastChecks = 0;
for (const [theme,values] of Object.entries(data.themes)) {
  const pairs = ['text','text-secondary','text-muted'].flatMap(fg=>['bg','surface','elevated','hover','active'].map(bg=>[fg,bg,4.5]));
  const syntaxRoles = ['comment','keyword','string','number','function','type','property','operator','punctuation'];
  pairs.push(...syntaxRoles.flatMap(role=>['bg','surface','elevated'].map(bg=>[`syntax-${role}`,bg,4.5])));
  pairs.push(['on-primary','primary',4.5], ...['accent','success','warning','danger'].map(name=>[name,`${name}-soft`,4.5]), ...['bg','surface','elevated'].map(bg=>['border-strong',bg,3]));
  for (const [fg,bg,min] of pairs) { contrastChecks++; const actual=ratio(values[fg],values[bg]); if(actual<min) problems.push(`${theme}: ${fg} on ${bg} contrast ${actual.toFixed(2)} < ${min}`); }
}
if (problems.length) throw new Error(problems.join('\n'));
console.log(`${styles.length} stylesheets use defined semantic tokens; ${featureSources.length} feature sources use semantic palette classes; foundation dependency direction checked; ${contrastChecks} contrast pairs passed.`);
