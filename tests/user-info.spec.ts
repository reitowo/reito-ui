import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '复杂-user-信息行';

async function open(page: Page, story = 'default', globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  const row = page.locator('[data-slot="user-info"]').first();
  await expect(row).toBeVisible({ timeout: 15_000 });
  return row;
}

test('renders identity, description, readable status and labelled action group', async ({ page }) => {
  const row = await open(page);
  await expect(row).toContainText('Reito');
  await expect(row).toContainText('组件系统维护者');
  await expect(row).toContainText('在线');
  await expect(row.getByRole('img', { name: 'Reito' })).toContainText('R');
  await expect(row.getByRole('group', { name: '用户操作' })).toBeVisible();
  await expect(row.getByRole('button', { name: '发送本地示例消息' })).toBeEnabled();
  await expect(row.getByRole('button', { name: '更多用户操作' })).toBeDisabled();
});

test('host actions remain independent and report their local result', async ({ page }) => {
  const row = await open(page);
  await row.getByRole('button', { name: '发送本地示例消息' }).click();
  await expect(page.getByRole('status')).toHaveText('已触发消息操作（本地示例）。');
});

test('missing avatar derives two-character initials from a string name', async ({ page }) => {
  const row = await open(page, 'missing-avatar');
  await expect(row.getByRole('img', { name: 'Lin Ming' })).toHaveText('LM');
  await expect(row).toContainText('离线');
});

test('long name and description truncate visually while preserving full titles', async ({ page }) => {
  const row = await open(page, 'long-content');
  const name = row.getByTitle('Reito UI 组件系统本地工作区的长期维护者');
  const description = row.getByTitle('负责组件契约、设计 tokens、主题密度和可访问性验证');
  await expect(name).toHaveCSS('text-overflow', 'ellipsis');
  await expect(description).toHaveCSS('text-overflow', 'ellipsis');
  expect((await name.boundingBox())!.width).toBeLessThan(await name.evaluate(element => element.scrollWidth));
  expect((await description.boundingBox())!.width).toBeLessThan(await description.evaluate(element => element.scrollWidth));
});

test('status tones retain visible text and semantic token classes', async ({ page }) => {
  await open(page, 'status-tones');
  const rows = page.locator('[data-slot="user-info"]');
  await expect(rows).toHaveCount(4);
  await expect(rows.nth(0)).toContainText('未知');
  await expect(rows.nth(1)).toContainText('在线');
  await expect(rows.nth(2)).toContainText('暂离');
  await expect(rows.nth(3)).toContainText('请勿打扰');
  await expect(rows.nth(1).locator('.bg-success')).toHaveCount(1);
  await expect(rows.nth(2).locator('.bg-warning')).toHaveCount(1);
  await expect(rows.nth(3).locator('.bg-destructive')).toHaveCount(1);
});

test('visible action labels keep normal compact button semantics', async ({ page }) => {
  const row = await open(page, 'visible-actions');
  await expect(row.getByRole('button', { name: '发送本地示例消息' })).toContainText('发送本地示例消息');
  await expect(row.getByRole('button', { name: '更多用户操作' })).toContainText('更多用户操作');
});

test('an action can be disabled or busy without hiding its accessible label', async ({ page }) => {
  let row = await open(page, 'disabled-action');
  await expect(row.getByRole('button', { name: '发送本地示例消息' })).toBeEnabled();
  await expect(row.getByRole('button', { name: '更多用户操作' })).toBeDisabled();
  row = await open(page, 'loading-action');
  const loading = row.getByRole('button', { name: '发送本地示例消息' });
  await expect(loading).toBeDisabled();
  await expect(loading).toHaveAttribute('aria-busy', 'true');
  await expect(row.getByRole('button', { name: '更多用户操作' })).toBeEnabled();
});

test('disabled row communicates state and disables every action', async ({ page }) => {
  const row = await open(page, 'disabled-row');
  await expect(row).toHaveAttribute('aria-disabled', 'true');
  for (const button of await row.getByRole('button').all()) await expect(button).toBeDisabled();
});

test('Playground Controls update the same story without tab navigation', async ({ page }) => {
  const story = `${prefix}--playground`;
  await page.goto(`http://127.0.0.1:6007/?path=/story/${encodeURIComponent(story)}`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  const row = frame.locator('[data-slot="user-info"]');
  await expect(row).toBeVisible({ timeout: 15_000 });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  const path = new URL(page.url()).searchParams.get('path');
  await page.locator('[id="control-name"]').fill('新的本地成员');
  await page.locator('[id="control-description"]').fill('正在检查同页参数');
  await expect(row).toContainText('新的本地成员');
  await expect(row).toContainText('正在检查同页参数');
  await page.locator('[id="control-showActionLabels"]').evaluate((element: HTMLInputElement) => element.click());
  await expect(row.getByRole('button', { name: '发送本地示例消息' })).toContainText('发送本地示例消息');
  expect(new URL(page.url()).searchParams.get('path')).toBe(path);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: compact identity row stays contained and accessible`, async ({ page }) => {
  const row = await open(page, 'default', `theme:${theme};density:${density}`);
  const rowBox = await row.boundingBox();
  expect(rowBox).not.toBeNull();
  expect(rowBox!.height).toBeLessThan(72);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations)).toEqual([]);
  await page.screenshot({ path: `.logs/user-info/${theme}-${density}.png`, fullPage: true });
});
