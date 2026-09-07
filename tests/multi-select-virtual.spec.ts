import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

async function open(page: Page, family: 'multiselect' | 'asyncmultiselect', story: string, label: string, globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=基础-${family}--${story}&viewMode=story&globals=${globals}`);
  const input = page.getByRole('combobox', { name: label, exact: true });
  await expect(input).toBeVisible({ timeout: 15_000 });
  await input.click();
  await expect(page.locator('[data-slot="combobox-list"][data-virtual="true"]')).toBeVisible({ timeout: 15_000 });
  return input;
}

test('fifty thousand options keep the popup DOM bounded and position the selected item', async ({ page }) => {
  const input = await open(page, 'multiselect', 'virtual-large', '工作区资源');
  const rendered = page.getByRole('option');
  expect(await rendered.count()).toBeLessThan(30);
  await expect(page.getByRole('option', { name: /资源 25001/ })).toBeVisible();
  const activeId = await input.getAttribute('aria-activedescendant');
  expect(activeId).toBeTruthy();
  await expect(page.locator(`#${activeId}`)).toHaveCount(1);
  expect(await page.locator('[data-slot="combobox-list"]').evaluate(element => element.scrollTop)).toBeGreaterThan(100_000);
});

test('keyboard highlight scrolls the virtual window before selection', async ({ page }) => {
  const input = await open(page, 'multiselect', 'virtual-large', '工作区资源');
  await input.press('ArrowDown');
  await expect(page.getByRole('option', { name: /资源 25002/ })).toBeVisible();
  const activeId = await input.getAttribute('aria-activedescendant');
  await expect(page.locator(`#${activeId}`)).toContainText('资源 25002');
  await input.press('Enter');
  await expect(page.locator('[data-slot="combobox-chip"]').getByText('资源 25002', { exact: true })).toBeVisible();
});

test('dynamic descriptions and virtual group headers are measured at different heights', async ({ page }) => {
  await open(page, 'multiselect', 'virtual-variable-rows', '工作区资源');
  await expect(page.locator('[data-slot="combobox-virtual-group"]').first()).toBeVisible();
  const heights = await page.getByRole('option').evaluateAll(elements => [...new Set(elements.map(element => Math.round(element.getBoundingClientRect().height)))]);
  expect(heights.length).toBeGreaterThan(1);
  expect(Math.max(...heights)).toBeGreaterThan(Math.min(...heights));
});

test('range callback follows the popup scroll window', async ({ page }) => {
  await open(page, 'multiselect', 'virtual-range', '工作区资源');
  const output = page.getByTestId('virtual-range');
  await expect(output).not.toContainText('尚未测量');
  const before = await output.textContent();
  await page.locator('[data-slot="combobox-list"]').evaluate(element => { element.scrollTop += 20_000; element.dispatchEvent(new Event('scroll')); });
  await expect(output).not.toHaveText(before ?? '');
});

test('remote pagination retains a selected chip outside loaded pages', async ({ page }) => {
  await open(page, 'asyncmultiselect', 'virtual-remote-pages', '远程资源');
  await expect(page.locator('[data-slot="combobox-chip"]').getByText('远程资源 181', { exact: true })).toBeVisible();
  await expect(page.getByTestId('remote-value')).toContainText('remote-180');
  expect(await page.getByRole('option').count()).toBeLessThan(30);
});

test('approaching the virtual range end appends the next remote page', async ({ page }) => {
  await open(page, 'asyncmultiselect', 'virtual-remote-pages', '远程资源');
  const list = page.locator('[data-slot="combobox-list"]');
  await list.evaluate(element => { element.scrollTop = element.scrollHeight; element.dispatchEvent(new Event('scroll')); });
  await expect(page.getByText('正在加载更多…', { exact: true })).toBeVisible();
  await expect(page.getByRole('option', { name: /远程资源 041/ })).toBeVisible();
  expect(await page.getByRole('option').count()).toBeLessThan(30);
});

test('changing the query cancels a pending page and rejects its stale results', async ({ page }) => {
  const input = await open(page, 'asyncmultiselect', 'virtual-remote-pages', '远程资源');
  const list = page.locator('[data-slot="combobox-list"]');
  await list.evaluate(element => { element.scrollTop = element.scrollHeight; element.dispatchEvent(new Event('scroll')); });
  await expect(page.getByText('正在加载更多…', { exact: true })).toBeVisible();
  await input.fill('220');
  await expect(page.getByRole('option', { name: /远程资源 221/ })).toBeVisible();
  await page.waitForTimeout(120);
  await expect(page.getByRole('option', { name: /远程资源 041/ })).toHaveCount(0);
  await expect(page.locator('[data-slot="combobox-chip"]').getByText('远程资源 181', { exact: true })).toBeVisible();
});

test('incremental load failure stays in the popup with a retry action', async ({ page }) => {
  await open(page, 'asyncmultiselect', 'virtual-load-failure', '远程资源');
  await expect(page.getByRole('alert')).toHaveText('无法加载下一页');
  await expect(page.getByRole('button', { name: '重试加载' })).toBeVisible();
  await page.getByRole('button', { name: '重试加载' }).click();
  await expect(page.getByText('正在加载更多…', { exact: true })).toBeVisible();
  await expect(page.getByRole('alert')).toHaveText('无法加载下一页');
});

test('virtual popup stays anchored after a distant scroll', async ({ page }) => {
  await page.setViewportSize({ width: 560, height: 720 });
  await open(page, 'multiselect', 'virtual-large', '工作区资源');
  const geometry = await page.evaluate(() => {
    const input = document.querySelector('[data-slot="combobox-chips"]')!.getBoundingClientRect();
    const popup = document.querySelector('[data-slot="combobox-content"]')!.getBoundingClientRect();
    return { inputLeft: input.left, inputWidth: input.width, popupLeft: popup.left, popupWidth: popup.width, popupRight: popup.right };
  });
  expect(Math.abs(geometry.inputLeft - geometry.popupLeft)).toBeLessThan(2);
  expect(Math.abs(geometry.inputWidth - geometry.popupWidth)).toBeLessThan(2);
  expect(geometry.popupRight).toBeLessThanOrEqual(560);
});

test('both Playgrounds toggle virtual mode and overscan without leaving the Story', async ({ page }) => {
  for (const family of ['multiselect', 'asyncmultiselect']) {
    await page.goto(`http://127.0.0.1:6007/?path=/story/基础-${family}--playground`);
    const frame = page.frameLocator('#storybook-preview-iframe');
    await expect(frame.locator('[data-slot$="multi-select"]')).toBeVisible({ timeout: 15_000 });
    await page.getByRole('tab', { name: /^Controls/ }).click();
    const path = new URL(page.url()).searchParams.get('path');
    await page.getByRole('switch', { name: 'virtual' }).press('Space');
    await frame.getByRole('combobox', { name: family === 'multiselect' ? '项目技术栈' : '异步选择技术栈' }).click();
    await expect(frame.locator('[data-slot="combobox-list"][data-virtual="true"]')).toBeVisible();
    await page.locator('[id="control-virtualOverscan"]').fill('8');
    await page.locator('[id="control-virtualOverscan"]').press('Enter');
    expect(new URL(page.url()).searchParams.get('path')).toBe(path);
  }
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: virtual popup measures rows, passes axe and fits narrow screens`, async ({ page }) => {
  await page.setViewportSize({ width: 420, height: 680 });
  await open(page, 'multiselect', 'virtual-variable-rows', '工作区资源', `theme:${theme};density:${density}`);
  expect(await page.getByRole('option').count()).toBeLessThan(30);
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { rules: { region: { enabled: false } } })).violations)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/multi-select-virtual/${theme}-${density}.png`, fullPage: true });
});
