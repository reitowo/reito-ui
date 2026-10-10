import { readFile, readdir } from 'node:fs/promises';
import ts from 'typescript';

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => {
    const file = `${directory}/${entry.name}`;
    return entry.isDirectory() ? sourceFiles(file) : /\.tsx?$/.test(file) ? [file] : [];
  }))).flat();
}

const files = await sourceFiles('packages/ui/src');
const problems = [];
let groups = 0;
const classHelpers = new Set(['cn', 'cx', 'classes', 'cva']);

for (const file of files) {
  const source = await readFile(file, 'utf8');
  const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true,
    file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const report = (node, message) => {
    const line = tree.getLineAndCharacterOfPosition(node.getStart(tree)).line + 1;
    problems.push(`${file}:${line}: ${message}`);
  };

  function visit(node) {
    if (ts.isCallExpression(node) && classHelpers.has(node.expression.getText(tree))) {
      groups += 1;
      const documentElements = new Set();
      function inspect(child) {
        if (ts.isStringLiteralLike(child)) {
          if (child.text.length > 300) report(child, 'split the class recipe into readable layout/state/size groups (maximum 300 characters per fragment)');
          for (const match of child.text.matchAll(/\[&_(p|h[1-6]|ul|ol|li|blockquote|pre|code|table|th|td|img)(?=[\]:>._\[])/g)) documentElements.add(match[1]);
        }
        ts.forEachChild(child, inspect);
      }
      node.arguments.forEach(inspect);
      if (documentElements.size >= 6) report(node, 'document-wide descendant typography belongs in scoped component CSS');
    }
    if (ts.isJsxAttribute(node) && node.name.getText(tree) === 'className' &&
        node.initializer && ts.isStringLiteral(node.initializer) && node.initializer.text.length > 300) {
      report(node, 'split the class recipe into readable groups (maximum 300 characters per fragment)');
    }
    ts.forEachChild(node, visit);
  }
  visit(tree);
}

if (problems.length) throw new Error(problems.join('\n'));
console.log(`Component source: ${files.length} files, ${groups} class recipes; readable fragments and scoped document typography checked.`);
