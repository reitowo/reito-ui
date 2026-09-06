import { test, expect, type Locator } from '@playwright/test';

const demoSource = 'export const workspace = {\n  name: "个人工作区",\n  density: "compact",\n};';

async function expectReadableHighlight(pre: Locator, source: string) {
  await expect(pre.locator('code')).toHaveAttribute('data-highlighted', 'true');
  expect(await pre.textContent()).toBe(source);
  const keyword = pre.locator('.token.keyword').first();
  const string = pre.locator('.token.string').first();
  await expect(keyword).toBeVisible();
  await expect(string).toBeVisible();
  const colors = await pre.evaluate(element => {
    const keyword = element.querySelector('.token.keyword')!;
    const string = element.querySelector('.token.string')!;
    return [element, keyword, string].map(node => getComputedStyle(node).color);
  });
  // Token spans alone are insufficient: categories must actually render differently.
  expect(new Set(colors).size).toBe(3);
}

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) {
  test(`${theme}/${density}: code and embedded artifact show syntax colors without changing source or copy`, async ({ page }) => {
    await page.addInitScript(({ theme, density }) => {
      localStorage.setItem('reito-theme', theme);
      localStorage.setItem('reito-density', density);
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText: async (source: string) => { (window as Window & { copiedSource?: string }).copiedSource = source; } },
      });
    }, { theme, density });
    await page.goto('/?layer=ai&component=code-block');
    const code = page.getByLabel('workspace.ts代码', { exact: true });
    await expectReadableHighlight(code, demoSource);
    await page.getByRole('button', { name: '复制代码', exact: true }).click();
    await expect(page.getByRole('button', { name: '代码已复制', exact: true })).toBeVisible();
    expect(await page.evaluate(() => (window as Window & { copiedSource?: string }).copiedSource)).toBe(demoSource);
    await page.keyboard.press('Tab');
    await expect(code).toBeFocused();
    expect(await code.evaluate(element => element.matches(':focus-visible'))).toBe(true);

    await page.goto('/?layer=ai&component=artifact');
    const name = page.getByRole('textbox', { name: '工作区名称', exact: true });
    await name.fill('高亮与原文');
    await page.getByRole('tab', { name: '代码', exact: true }).click();
    const artifact = page.getByLabel('WorkspaceSettings.tsx代码', { exact: true });
    const updated = 'export const workspace = { name: "高亮与原文" };';
    await expectReadableHighlight(artifact, updated);
    await page.getByRole('button', { name: '复制代码', exact: true }).click();
    await expect(page.getByRole('button', { name: '代码已复制', exact: true })).toBeVisible();
    expect(await page.evaluate(() => (window as Window & { copiedSource?: string }).copiedSource)).toBe(updated);
    await page.getByRole('combobox', { name: '产物版本', exact: true }).click();
    await page.getByRole('option', { name: '版本 1', exact: true }).click();
    await expectReadableHighlight(artifact, 'export const workspace = { name: "默认工作区" };');
    await expect(page.getByRole('button', { name: '复制代码', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  });
}
