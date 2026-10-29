import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { axeViolations } from './axe-scan';

test.beforeEach(async ({ page }) => {
  await page.setContent('<html lang="en"><head><title>Scanner test</title></head><body><img src="missing.png"></body></html>');
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
});

async function holdScan(page: Page) {
  await page.evaluate(() => {
    const axe = (window as any).axe;
    axe.configure({
      checks: [{ id: 'hold-scan', evaluate: function (this: any) { (window as any).releaseHeldScan = this.async(); } }],
      rules: [{ id: 'hold-scan', selector: 'img', any: ['hold-scan'] }],
    });
    (window as any).heldScan = axe.run(document.body, { runOnly: { type: 'rule', values: ['hold-scan'] } });
  });
  await expect.poll(() => page.evaluate(() => typeof (window as any).releaseHeldScan)).toBe('function');
}

test('a busy real axe scan is awaited and actual violations are still returned', async ({ page }) => {
  await holdScan(page);
  const options = { runOnly: { type: 'rule' as const, values: ['image-alt'] } };
  await expect(page.evaluate(async options => (window as any).axe.run(document.body, options), options))
    .rejects.toThrow('Axe is already running');
  const scan = axeViolations(page, options);
  await page.evaluate(() => { setTimeout(() => (window as any).releaseHeldScan(true), 150); });
  const violations = await scan;
  expect(violations.map(violation => violation.id)).toEqual(['image-alt']);
  expect(violations[0].nodes[0].target).toEqual(['img']);
});

test('other scanner errors are propagated without being treated as contention', async ({ page }) => {
  await expect(axeViolations(page, { runOnly: { type: 'rule', values: ['missing-rule'] } }))
    .rejects.toThrow(/unknown rule/i);
});

test('a scanner that never releases still fails after the bounded wait', async ({ page }) => {
  await holdScan(page);
  try {
    await expect(axeViolations(page, { runOnly: { type: 'rule', values: ['image-alt'] } }, { waitTimeoutMs: 100 }))
      .rejects.toThrow('Timed out waiting for the existing axe scan');
  } finally {
    await page.evaluate(async () => { (window as any).releaseHeldScan(true); await (window as any).heldScan; });
  }
});
