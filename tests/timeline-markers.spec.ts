import { test, expect } from '@playwright/test';

for (const theme of ['light', 'dark']) {
  for (const density of ['compact', 'comfortable', 'dense']) {
    test(`Timeline avatar and status markers compose in ${theme}/${density}`, async ({ page }) => {
      await page.goto(`/?page=timeline-markers&theme=${theme}&density=${density}`);
      await expect(page.getByLabel('示例用户头像')).toBeVisible();
      await expect(page.getByRole('img', { name: '进行中', exact: true })).toHaveCount(1);
      await expect(page.getByRole('heading', { name: '示例用户', exact: true })).toHaveCount(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    });
  }
}
