import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
const axe = readFileSync('node_modules/axe-core/axe.min.js', 'utf8');

test('homepage preview filters, updates state, switches code and opens tokens', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('构建一致的界面');
  await page.getByRole('button', { name: '完成组织文件与数据' }).click();
  await expect(page.getByRole('button', { name: '重新打开组织文件与数据' })).toBeVisible();
  await page.getByRole('textbox', { name: '筛选示例任务' }).fill('不存在');
  await expect(page.getByText('没有匹配的任务')).toBeVisible();
  await page.getByRole('tab', { name: '查看代码' }).click();
  await expect(page.locator('[data-slot="code-content"]').first()).toContainText('SearchBar');
  await page.getByRole('button', { name: '查看设计 Tokens' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: '查看设计 Tokens' })).toBeFocused();
});

test('component links still open Lab, and Lab brand returns home', async ({ page }) => {
  await page.goto('/'); await page.getByRole('link', { name: '浏览组件', exact: true }).click();
  await expect(page.getByTestId('component-preview')).toBeVisible();
  await expect(page).toHaveURL(/layer=basic&component=button/);
  await page.locator('.lab-brand').click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('构建一致的界面');
});

for (const theme of ['dark', 'light']) for (const width of [1440, 390]) {
  test(`${theme}/${width}: readable layout, theme persistence and accessible controls`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');
    if (await page.locator('html').getAttribute('data-theme') !== theme) await page.getByRole('button', { name: '切换明暗主题' }).click();
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    await expect(page.locator('html')).toHaveAttribute('data-density', 'compact');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.addScriptTag({ content: axe });
    const violations = await page.evaluate(async () => (await (window as any).axe.run(document, { rules: { 'color-contrast': { enabled: true } } })).violations.map((v: any) => ({ id: v.id, nodes: v.nodes.map((n: any) => n.target) })));
    expect(violations).toEqual([]);
    await page.screenshot({ path: `.logs/home-${theme}-${width}.png`, fullPage: true });
  });
}
