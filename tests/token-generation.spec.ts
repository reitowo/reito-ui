import { expect, test } from '@playwright/test';
import { copyFile, mkdir, mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { spawnSync } from 'node:child_process';

for (const invalid of ['missing target', 'alias cycle', 'expression cycle']) {
  test(`token generator rejects ${invalid} before emitting CSS`, async () => {
    const root = await mkdtemp(join(tmpdir(), 'reito-token-validation-'));
    try {
      await mkdir(join(root, 'scripts'));
      await mkdir(join(root, 'packages/tokens/src'), { recursive: true });
      await copyFile('scripts/build-tokens.mjs', join(root, 'scripts/build-tokens.mjs'));
      const source = JSON.parse(await readFile('packages/tokens/src/tokens.json', 'utf8'));
      if (invalid === 'missing target') source.components.button.height.$value = '{foundation.missing}';
      if (invalid === 'alias cycle') source.components.button.height.$value = '{components.button.height}';
      if (invalid === 'expression cycle') source.components.menu['item-padding-y'].$extensions.reito.css = 'calc({components.menu.item-padding-y})';
      await writeFile(join(root, 'packages/tokens/src/tokens.json'), JSON.stringify(source));
      const result = spawnSync(process.execPath, [join(root, 'scripts/build-tokens.mjs')], { encoding: 'utf8' });
      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain(invalid === 'missing target' ? 'Invalid token reference' : 'Cyclic token reference');
      expect(await readFile(join(root, 'packages/tokens/dist/tokens.css'), 'utf8').catch(() => null)).toBeNull();
    } finally {
      // Only remove the temporary fixture this test just created.
      if (!resolve(root).startsWith(resolve(tmpdir()) + sep)) throw new Error('Unexpected fixture path');
      await rm(root, { recursive: true, force: true });
    }
  });
}
