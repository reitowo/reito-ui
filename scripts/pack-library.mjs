import { mkdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
if (!process.env.npm_execpath) throw new Error('Run with npm run pack:library.');
await mkdir('artifacts', {recursive:true});
for (const workspace of ['@reito/tokens','@reito/ui']) {
  const result = spawnSync(process.execPath, [process.env.npm_execpath,'pack','--workspace',workspace,'--pack-destination','artifacts'], {stdio:'inherit'});
  if (result.status !== 0) process.exit(result.status || 1);
}
