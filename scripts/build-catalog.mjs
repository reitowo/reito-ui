import { readFile, readdir, writeFile } from 'node:fs/promises';
import ts from 'typescript';
import { toId } from 'storybook/internal/csf';

const parse = (file, text) => ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
function unwrap(node) { while(node && (ts.isSatisfiesExpression(node) || ts.isAsExpression(node) || ts.isParenthesizedExpression(node))) node=node.expression; return node; }
function variable(source,name) { let found;function visit(node){if(ts.isVariableDeclaration(node)&&node.name.getText(source)===name)found=unwrap(node.initializer);else ts.forEachChild(node,visit);}visit(source);return found; }
const property = (object,name) => object?.properties?.find(p=>p.name?.getText().replace(/['"]/g,'')===name)?.initializer;
const string = node => node && ts.isStringLiteral(node) ? node.text : undefined;
const stories=[];
for(const layer of ['basic','complex','ai']) {
  for(const file of await readdir(`apps/storybook/stories/${layer}`)) {
    if(!file.endsWith('.stories.tsx'))continue;
    const path=`apps/storybook/stories/${layer}/${file}`;
    const source=parse(path,await readFile(path,'utf8'));
    const title=string(property(variable(source,'meta'),'title'));
    if(!title)throw new Error(`Missing literal Storybook title in ${path}`);
    const exports=source.statements.filter(s=>ts.isVariableStatement(s)&&s.modifiers?.some(m=>m.kind===ts.SyntaxKind.ExportKeyword)).flatMap(s=>s.declarationList.declarations.map(d=>d.name.getText(source)));
    const isComparison = name => /总览|对比/.test(string(property(variable(source, name), 'name')) || '');
    const primary=['Playground','Default','Guidelines','Overview','Interactive'].find(name=>exports.includes(name) && !isComparison(name)) || exports.find(name=>!isComparison(name)) || exports[0];
    if(!primary)throw new Error(`No stories in ${path}`);
    stories.push({layer,title,id:toId(title,primary),file:path,storyCount:exports.length});
  }
}
const entries=[];
for(const layer of ['basic','complex','ai']) {
  const file=`packages/ui/src/${layer}/catalog.tsx`;
  const source=parse(file,await readFile(file,'utf8'));
  const array=variable(source,`${layer}Catalog`);
  if(!array || !ts.isArrayLiteralExpression(array))throw new Error(`Missing catalog in ${file}`);
  for(const entry of array.elements) {
    const id=string(property(entry,'id')),name=string(property(entry,'name'));
    const description=string(property(entry,'description'));
    const demo=property(entry,'component')?.getText(source);
    if(!id || !name || !demo)throw new Error(`Incomplete entry in ${file}`);
    const family= id==='sources' ? 'Sources' : name.split('/')[0].trim();
    const normalized=value=>value.replace(/[^\p{L}\p{N}]/gu,'').toLowerCase();
    const english=value=>value.match(/^[a-zA-Z ]+/)?.[0].replaceAll(' ','').toLowerCase();
    const matches=stories.filter(story=>story.layer===layer && (normalized(story.title.split('/')[1])===normalized(family) || english(story.title.split('/')[1])===english(family)));
    if(matches.length!==1)throw new Error(`${layer}/${id}: expected one story family; found ${matches.length}`);
    entries.push({layer,id,name,description,storyId:matches[0].id,sourceFile:file,demo,stories:matches[0].storyCount});
  }
}
const counts=Object.fromEntries(['basic','complex','ai'].map(layer=>[layer,entries.filter(e=>e.layer===layer).length]));
const content=JSON.stringify({counts,total:entries.length,stories:entries.reduce((sum,e)=>sum+e.stories,0),entries},null,2)+'\n';
const target='apps/lab/src/catalog-manifest.json';
if(process.argv.includes('--check')) {if(await readFile(target,'utf8').catch(()=>'')!==content)throw new Error('Catalog changed. Run npm run catalog:build.');}
else await writeFile(target,content);
console.log(`Catalog: ${entries.length} component families, ${JSON.stringify(counts)}; every family has one Storybook link.`);
