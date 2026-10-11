import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
const manifest = JSON.parse(readFileSync('apps/lab/src/catalog-manifest.json', 'utf8'));
for (const layer of ['basic', 'complex', 'ai']) test(`standalone overview previews render the entire ${layer} catalog`, async ({ page }) => {
  test.setTimeout(240_000);
  const failures: string[] = [];
  let current = '';
  page.on('pageerror', error => failures.push(`${current}: ${error.message}`));
  await page.setViewportSize({ width: layer === 'basic' ? 448 : 768, height: 640 });
  for (const entry of manifest.entries.filter((item: { layer: string }) => item.layer === layer)) {
    current = `${entry.layer}/${entry.id}`;
    await page.goto(`/?preview=${encodeURIComponent(current)}&theme=dark&density=compact`);
    const root = page.locator('.atlas-preview-root');
    await expect(root, current).toBeVisible();
    await expect(root.locator(':scope > *').first(), current).toBeVisible();
    await expect(root.getByText('正在载入组件…', { exact: true }), current).toHaveCount(0);
    await expect(root.getByText('预览未能载入，请在组件详情中重新打开。', { exact: true }), current).toHaveCount(0);
  }
  expect(failures).toEqual([]);
});
