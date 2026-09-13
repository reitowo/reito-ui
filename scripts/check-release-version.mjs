import { readFileSync } from 'node:fs';
const read = path => JSON.parse(readFileSync(path, 'utf8'));
const version = read('package.json').version;
if (!/^\d+\.\d+\.\d+$/.test(version)) throw Error('Only stable x.y.z releases are supported');
if (process.env.GITHUB_REF_TYPE !== 'tag' || process.env.GITHUB_REF_NAME !== `v${version}`) throw Error('Release tag must exactly match package version');
for (const path of ['packages/ui', 'packages/tokens', 'apps/lab', 'apps/storybook', 'apps/workbench']) {
  const pkg = read(`${path}/package.json`);
  if (pkg.version !== version) throw Error(`${path}: version mismatch`);
  for (const [name, value] of Object.entries(pkg.dependencies || {})) {
    if (name.startsWith('@reito/') && value !== version) throw Error(`${path}: internal dependency mismatch`);
  }
}
console.log(`Release policy passed: v${version}`);
