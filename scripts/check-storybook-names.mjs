import { readFile, readdir } from 'node:fs/promises';
import ts from 'typescript';
const unwrap = node => node && (ts.isSatisfiesExpression(node) || ts.isAsExpression(node) || ts.isParenthesizedExpression(node)) ? unwrap(node.expression) : node;
const ids = new Set();
let families = 0, stories = 0;
for (const layer of ['basic', 'complex', 'ai']) {
  const dir = `apps/storybook/stories/${layer}`;
  for (const file of await readdir(dir)) {
    if (!file.endsWith('.stories.tsx')) continue;
    const path = `${dir}/${file}`;
    const source = ts.createSourceFile(path, await readFile(path, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const property = (node, key) => node?.properties?.find(p => p.name?.getText(source) === key)?.initializer;
    const string = node => node && ts.isStringLiteral(node) ? node.text : undefined;
    const names = new Set();
    for (const statement of source.statements) {
      if (!ts.isVariableStatement(statement)) continue;
      for (const declaration of statement.declarationList.declarations) {
        const key = declaration.name.getText(source), node = unwrap(declaration.initializer);
        if (key === 'meta') {
          const title = string(property(node, 'title')), id = string(property(node, 'id'));
          const expected = { basic: '基础', complex: '复杂', ai: 'AI' }[layer];
          if (!title?.startsWith(`${expected}/`) || !/^(基础|复杂|AI)\/[A-Za-z][A-Za-z0-9]* [\u3400-\u9fff][^/]*$/.test(title)) throw Error(`${path}: use 层级/EnglishAPI 中文用途`);
          if (!id || ids.has(id)) throw Error(`${path}: missing or duplicate stable meta.id`);
          ids.add(id); families++;
        } else if (statement.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
          const name = string(property(node, 'name'));
          if (!name || !/[\u3400-\u9fff]/.test(name) || /\s\/\s|交互场景[:：]/.test(name)) throw Error(`${path}/${key}: explicit Chinese story name required`);
          if (key === 'Playground' && name !== '参数调试') throw Error(`${path}: Playground must be 参数调试`);
          if (names.has(name)) throw Error(`${path}: duplicate display name ${name}`);
          names.add(name); stories++;
        }
      }
    }
  }
}
console.log(`Storybook naming: ${families} families, ${stories} explicit names; bilingual titles and stable IDs checked.`);
