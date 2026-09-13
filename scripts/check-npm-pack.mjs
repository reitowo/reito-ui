import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
for (const name of ['tokens', 'ui']) {
  const pkg = JSON.parse(readFileSync(`packages/${name}/package.json`, 'utf8'));
  const archive = `artifacts/reito-${name}-${pkg.version}.tgz`;
  if (!existsSync(archive)) throw Error(`Missing ${archive}`);
  const files = new Set(execFileSync('tar', ['-tzf', archive], { encoding: 'utf8' }).trim().split(/\r?\n/));
  for (const file of files) {
    if (!/^package\/(?:dist\/|src\/tokens\.json$|package\.json$|README\.md$|LICENSE$|THIRD_PARTY_NOTICES\.md$)/.test(file)) throw Error(`Unexpected package file: ${file}`);
  }
  for (const file of ['README.md', 'LICENSE', 'package.json', ...(name === 'ui' ? ['THIRD_PARTY_NOTICES.md'] : [])]) {
    if (!files.has(`package/${file}`)) throw Error(`Missing ${file}`);
  }
  const walk = entry => {
    if (typeof entry === 'string' && !files.has(`package/${entry.replace(/^\.\//, '')}`)) throw Error(`Missing export: ${entry}`);
    if (entry && typeof entry === 'object') Object.values(entry).forEach(walk);
  };
  walk(pkg.exports);
  if (pkg.publishConfig?.access !== 'public' || pkg.publishConfig?.registry !== 'https://registry.npmjs.org/') throw Error('Wrong publish destination');
  console.log(`${pkg.name}@${pkg.version}: ${files.size} files, package contract passed`);
}
