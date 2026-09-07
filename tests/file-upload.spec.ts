import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '复杂-fileupload-文件上传';

async function open(page: Page, story: string, globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  const upload = page.locator('[data-slot="file-upload"]');
  await expect(upload).toBeVisible({ timeout: 15_000 });
  return upload;
}

test('adds a validated file to the local queue', async ({ page }) => {
  const upload = await open(page, 'empty');
  const file = { name: 'notes.md', mimeType: 'text/markdown', buffer: Buffer.from('local example') };
  await upload.getByLabel('添加文件', { exact: true }).setInputFiles(file);
  await expect(upload.getByText('notes.md', { exact: true })).toBeVisible();
  await expect(upload.getByText('等待上传')).toBeVisible();
  await expect(upload.getByRole('status')).toContainText('共 1 个文件');
});

test('host transport receives progress and completes the item', async ({ page }) => {
  const upload = await open(page, 'interactive');
  await expect(upload.locator('[data-status="success"]')).toBeVisible();
  await expect(upload.getByText('上传完成')).toBeVisible();
  await expect(upload.getByRole('status')).toContainText('已完成 1');
});

test('cancel aborts the active item and allows a fresh start', async ({ page }) => {
  const upload = await open(page, 'cancel-action');
  await upload.getByRole('button', { name: '取消' }).click();
  await expect(upload.locator('[data-status="canceled"]')).toBeVisible();
  await expect(upload.getByText('已取消')).toBeVisible();
  await expect(upload.getByRole('button', { name: '重新开始' })).toBeEnabled();
});

test('failed upload retains the item and retries successfully', async ({ page }) => {
  const upload = await open(page, 'retry-action');
  await upload.getByRole('button', { name: '重试' }).click();
  await expect(upload.getByText('本地模拟连接中断')).toBeVisible();
  await upload.getByRole('button', { name: '重试' }).click();
  await expect(upload.locator('[data-status="success"]')).toBeVisible();
  await expect(upload.getByText('上传完成')).toBeVisible();
});

test('controlled progress and per-file error stay explicit', async ({ page }) => {
  let upload = await open(page, 'controlled-progress');
  await expect(upload.getByRole('progressbar', { name: 'workspace-notes.md上传进度' })).toHaveAttribute('aria-valuenow', '64');
  await expect(upload.getByText(/上传中 64%/)).toBeVisible();
  upload = await open(page, 'upload-error');
  await expect(upload.locator('[data-status="error"]')).toContainText('服务拒绝了这个文件');
  await expect(upload.getByRole('button', { name: '重试' })).toBeEnabled();
});

test('validation story covers duplicate, type, size, count and removal', async ({ page }) => {
  const upload = await open(page, 'validation');
  await expect(upload.getByRole('alert')).toContainText('最多添加 2 个文件');
  await expect(upload.getByText('notes.txt', { exact: true })).toHaveCount(0);
  await expect(upload.getByRole('status')).toContainText('共 1 个文件');
});

test('disabled upload blocks selection and item actions', async ({ page }) => {
  const upload = await open(page, 'disabled');
  await expect(upload.getByLabel('添加文件', { exact: true })).toBeDisabled();
  for (const button of await upload.getByRole('button').all()) await expect(button).toBeDisabled();
});

test('Playground controls change lifecycle props without leaving the Story', async ({ page }) => {
  await page.goto(`http://127.0.0.1:6007/?path=/story/${prefix}--playground`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  await expect(frame.locator('[data-slot="file-upload"]')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  await page.locator('[id="control-status"]').selectOption('uploading');
  await page.locator('[id="control-progress"]').fill('72');
  await expect(frame.getByText(/上传中 72%/)).toBeVisible();
  await page.locator('[id="control-status"]').selectOption('error');
  await page.locator('[id="control-fileError"]').fill('宿主拒绝上传');
  await expect(frame.getByText('宿主拒绝上传')).toBeVisible();
  expect(new URL(page.url()).searchParams.get('path')).toBe(`/story/${prefix}--playground`);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: narrow upload lifecycle stays accessible and contained`, async ({ page }) => {
  await page.setViewportSize({ width: 420, height: 800 });
  const upload = await open(page, 'narrow', `theme:${theme};density:${density}`);
  await expect(upload.locator('[data-status="uploading"]')).toBeVisible();
  await expect(upload.locator('[data-status="error"]')).toBeVisible();
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body, { rules: { region: { enabled: false } } })).violations)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `.logs/file-upload/${theme}-${density}.png`, fullPage: true });
});
