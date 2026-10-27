import { test, expect, type Request } from '@playwright/test';
import { readFileSync } from 'node:fs';
const manifest = JSON.parse(readFileSync('apps/lab/src/catalog-manifest.json', 'utf8'));
// Under CI load Chromium can refuse some of the hundreds of dev-server module requests a preview makes;
// the lazy route import then rejects and nothing mounts. Only that network-level refusal is retried.
const refusedModuleLoad = 'net::ERR_INSUFFICIENT_RESOURCES';
for (const layer of ['basic', 'complex', 'ai']) test(`standalone overview previews render the entire ${layer} catalog`, async ({ page }) => {
  test.setTimeout(240_000);
  const failures: string[] = [];
  let current = '';
  let refused = 0;
  page.on('pageerror', error => failures.push(`${current}: ${error.message}`));
  page.on('requestfailed', (request: Request) => { if (request.failure()?.errorText === refusedModuleLoad) refused++; });
  await page.setViewportSize({ width: layer === 'basic' ? 448 : 768, height: 640 });
  for (const entry of manifest.entries.filter((item: { layer: string }) => item.layer === layer)) {
    current = `${entry.layer}/${entry.id}`;
    const root = page.locator('.atlas-preview-root');
    for (let attempt = 0; ; attempt++) {
      const errorsBefore = failures.length;
      refused = 0;
      await page.goto(`/?preview=${encodeURIComponent(current)}&theme=dark&density=compact`);
      try {
        await expect(root, current).toBeVisible();
        break;
      } catch (error) {
        if (!refused || attempt >= 2) throw error;
        failures.length = errorsBefore;
      }
    }
    await expect(root.locator(':scope > *').first(), current).toBeVisible();
    await expect(root.getByText('正在载入组件…', { exact: true }), current).toHaveCount(0);
    await expect(root.getByText('预览未能载入，请在组件详情中重新打开。', { exact: true }), current).toHaveCount(0);
  }
  expect(failures).toEqual([]);
});
