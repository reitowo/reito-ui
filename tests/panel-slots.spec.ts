import { expect, test } from '@playwright/test';

for (const theme of ['light', 'dark'])
  for (const density of ['compact', 'comfortable', 'dense']) {
    test(`panel regions own one inset beside a flush table: ${theme}/${density}`, async ({
      page,
    }) => {
      await page.goto(`/?page=panel-slots&theme=${theme}&density=${density}`);
      const inset = { compact: 12, comfortable: 16, dense: 8 }[density]!;
      const measure = (name: string, selector: string) =>
        page.getByRole('region', { name, exact: true }).evaluate((panel, selector) => {
          const title = panel.querySelector('h2')!.getBoundingClientRect();
          // Measure from the inner border edge; the 1px surface border belongs to Panel.
          const edge = panel.getBoundingClientRect().left + panel.clientLeft;
          const target = panel.querySelector(selector)!.getBoundingClientRect();
          const table = panel.querySelector('table')?.getBoundingClientRect();
          return {
            textFromTitle: target.left - title.left,
            textFromEdge: target.left - edge,
            tableFromEdge: table ? table.left - edge : null,
          };
        }, selector);
      await expect(page.getByRole('alert')).toHaveText('暂时无法读取，请重试。');
      const records = await measure('records', '[role=alert]');
      expect(records.tableFromEdge).toBeCloseTo(0, 0);
      expect(records.textFromTitle).toBeCloseTo(0, 0);
      expect(records.textFromEdge).toBeGreaterThanOrEqual(inset);
      await expect(page.getByRole('status')).toHaveText('正在读取记录…');
      const loading = await measure('loading', '[role=status]');
      expect(loading.textFromTitle).toBeCloseTo(0, 0);
      await page.setViewportSize({ width: 390, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    });
  }
