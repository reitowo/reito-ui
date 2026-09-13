import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
// Run only from publish.yml after its tag policy and quality jobs pass.
if (process.env.GITHUB_ACTIONS !== 'true' || process.env.GITHUB_REF_TYPE !== 'tag') throw Error('Publish from the release workflow');
const version = JSON.parse(readFileSync('package.json', 'utf8')).version;
if (process.env.GITHUB_REF_NAME !== `v${version}`) throw Error('Tag/version mismatch');
for (const name of ['tokens', 'ui']) {
  const file = `./artifacts/reito-${name}-${version}.tgz`;
  const integrity = `sha512-${createHash('sha512').update(readFileSync(file)).digest('base64')}`;
  const response = await fetch(`https://registry.npmjs.org/@reito%2f${name}/${version}`);
  if (response.ok) {
    const published = await response.json();
    if (published.dist?.integrity !== integrity) throw Error(`@reito/${name}@${version} exists with different contents; bump the version`);
    console.log(`@reito/${name}@${version} already published with identical contents`);
    continue;
  }
  if (response.status !== 404) throw Error(`Registry lookup failed: ${response.status}`);
  execFileSync('npm', ['publish', file, '--access', 'public', '--provenance', '--registry=https://registry.npmjs.org/'], { stdio: 'inherit' });
}
