import { expect, test, type Locator, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '复杂-terminalprompt-命令交互';

async function open(page: Page, story = 'default', globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  const terminal = page.locator('[data-slot="terminal-prompt"]');
  await expect(terminal).toBeVisible({ timeout: 15_000 });
  return terminal;
}

async function entryCount(terminal: Locator) {
  return terminal.locator('[data-terminal-id]').count();
}

test('terminal exposes a labelled output log and host-owned response states', async ({ page }) => {
  const terminal = await open(page, 'mixed-responses');
  await expect(terminal.getByRole('region', { name: '命令记录' })).toBeVisible();
  const log = terminal.getByRole('log');
  await expect(log).toHaveAttribute('aria-live', 'polite');
  await expect(log.locator('[data-status="success"]')).toHaveCount(2);
  await expect(log.locator('[data-status="error"]')).toContainText('本地示例错误');
  await expect(log.locator('[data-status="cancelled"]')).toContainText('由宿主取消');
  await expect(log.locator('[data-status="running"]')).toContainText('正在等待宿主响应');
});

test('ordinary Enter submits through the host callback and clears an unchanged draft', async ({ page }) => {
  const terminal = await open(page);
  const input = terminal.getByRole('textbox', { name: '本地示例命令' });
  const before = await entryCount(terminal);
  await input.fill('status --local');
  await input.press('Enter');
  await expect(terminal.locator('[data-terminal-id]')).toHaveCount(before + 1);
  await expect(terminal.getByText('status --local', { exact: true })).toBeVisible();
  await expect(terminal.getByText(/没有调用 shell、进程或 PTY/)).toBeVisible();
  await expect(input).toHaveValue('');
});

test('IME confirmation Enter does not submit, while the next Enter does', async ({ page }) => {
  const terminal = await open(page);
  const input = terminal.getByRole('textbox', { name: '本地示例命令' });
  const before = await entryCount(terminal);
  await input.dispatchEvent('compositionstart');
  await input.fill('检查状态');
  await input.dispatchEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 229, isComposing: true });
  await expect(terminal.locator('[data-terminal-id]')).toHaveCount(before);
  await expect(input).toHaveValue('检查状态');
  await input.dispatchEvent('compositionend', { data: '检查状态' });
  await input.press('Enter');
  await expect(terminal.locator('[data-terminal-id]')).toHaveCount(before + 1);
});

test('history arrows walk chronologically and restore the unsubmitted draft', async ({ page }) => {
  const terminal = await open(page, 'history-navigation');
  const input = terminal.getByRole('textbox', { name: '历史命令' });
  await expect(input).toHaveValue('尚未提交的草稿');
  await input.press('ArrowUp');
  await expect(input).toHaveValue('git status --short');
  await input.press('ArrowUp');
  await expect(input).toHaveValue('npm run build');
  await input.press('ArrowUp');
  await expect(input).toHaveValue('npm run check');
  await input.press('ArrowUp');
  await expect(input).toHaveValue('npm run check');
  await input.press('ArrowDown');
  await input.press('ArrowDown');
  await input.press('ArrowDown');
  await expect(input).toHaveValue('尚未提交的草稿');
});

test('editing a recalled command starts a new history draft', async ({ page }) => {
  const terminal = await open(page, 'history-navigation');
  const input = terminal.getByRole('textbox', { name: '历史命令' });
  await input.press('ArrowUp');
  await input.fill('git status --branch');
  await input.press('ArrowDown');
  await expect(input).toHaveValue('git status --branch');
});

test('async submission prevents duplicates and publishes the host result', async ({ page }) => {
  const terminal = await open(page, 'async-submission');
  const input = terminal.getByRole('textbox', { name: '异步命令' });
  const run = terminal.getByRole('button', { name: '提交命令' });
  await run.click();
  await expect(input).toBeDisabled();
  await expect(run).toBeDisabled();
  await run.evaluate((button: HTMLButtonElement) => button.click());
  await expect(terminal.getByText('异步宿主示例已返回。')).toBeVisible();
  await expect(terminal.getByText('npm run build', { exact: true })).toHaveCount(1);
  await expect(input).toHaveValue('');
});

test('submission failure keeps the command and exposes the host error', async ({ page }) => {
  const terminal = await open(page, 'submission-failure');
  const input = terminal.getByRole('textbox', { name: '失败命令' });
  await input.press('Enter');
  await expect(terminal.getByRole('alert')).toHaveText('宿主拒绝了本地示例请求');
  await expect(input).toHaveValue('npm run build');
  await expect(input).toBeEnabled();
});

test('a host draft replacement during submission is not cleared', async ({ page }) => {
  const terminal = await open(page, 'external-draft-update');
  const input = terminal.getByRole('textbox', { name: '宿主更新命令' });
  await input.press('Enter');
  await page.getByRole('button', { name: '宿主更新草稿' }).click();
  await expect(input).toHaveValue('host replacement');
  await page.waitForTimeout(450);
  await expect(input).toHaveValue('host replacement');
});

test('running state keeps Escape available and cancel updates the host entry', async ({ page }) => {
  const terminal = await open(page, 'running');
  const input = terminal.getByRole('textbox', { name: '运行中命令' });
  await expect(input).toHaveAttribute('readonly');
  await expect(input).toHaveAttribute('aria-keyshortcuts', 'Escape');
  await input.focus();
  await input.press('Escape');
  await expect(terminal.locator('[data-status="cancelled"]')).toContainText('宿主已确认取消');
  await expect(terminal.getByRole('button', { name: '提交命令' })).toBeVisible();
});

test('cancel button prevents duplicates and reports host cancellation failure', async ({ page }) => {
  const terminal = await open(page, 'cancel-failure');
  const cancel = terminal.getByRole('button', { name: '取消当前命令' });
  await cancel.click();
  await expect(cancel).toBeDisabled();
  await cancel.evaluate((button: HTMLButtonElement) => button.click());
  await expect(terminal.getByRole('alert')).toHaveText('宿主未能取消本地示例请求');
  await expect(cancel).toBeEnabled();
});

test('paused follow can jump to the latest output', async ({ page }) => {
  const terminal = await open(page, 'follow-paused');
  const viewport = terminal.getByRole('region', { name: '命令记录' });
  await expect(terminal.getByRole('button', { name: '回到最新' })).toBeVisible();
  await terminal.getByRole('button', { name: '回到最新' }).click();
  await expect(terminal.getByRole('button', { name: '回到最新' })).toHaveCount(0);
  await expect.poll(() => viewport.evaluate(element => Math.abs(element.scrollHeight - element.clientHeight - element.scrollTop))).toBeLessThanOrEqual(2);
  await viewport.evaluate(element => { element.scrollTop = 0; element.dispatchEvent(new Event('scroll', { bubbles: true })); });
  await expect(terminal.getByRole('button', { name: '回到最新' })).toBeVisible();
});

test('clear remains a host callback and removes only caller-owned entries', async ({ page }) => {
  const terminal = await open(page);
  await terminal.getByRole('button', { name: '清除命令记录' }).click();
  await expect(terminal.getByRole('log')).toHaveCount(0);
  await expect(terminal.getByText('还没有命令记录')).toBeVisible();
});

test('empty, host error, readonly and disabled states stay explicit', async ({ page }) => {
  let terminal = await open(page, 'empty');
  await expect(terminal.getByRole('status')).toHaveText('当前工作区没有命令记录');
  terminal = await open(page, 'host-error');
  await expect(terminal.getByRole('alert')).toHaveText('宿主连接不可用，请检查本地适配器。');
  terminal = await open(page, 'read-only');
  await expect(terminal.getByRole('textbox', { name: '只读命令' })).toHaveAttribute('readonly');
  await expect(terminal.getByRole('button', { name: '提交命令' })).toBeDisabled();
  terminal = await open(page, 'disabled');
  await expect(terminal.getByRole('textbox', { name: '禁用命令' })).toBeDisabled();
  for (const button of await terminal.getByRole('button').all()) await expect(button).toBeDisabled();
});

test('long output stays inside its own viewport', async ({ page }) => {
  await page.setViewportSize({ width: 420, height: 520 });
  const terminal = await open(page, 'long-output');
  const viewport = terminal.getByRole('region', { name: '命令记录' });
  expect(await viewport.evaluate(element => element.scrollHeight > element.clientHeight)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('Playground Controls update props and component callbacks without changing Story', async ({ page }) => {
  const story = `${prefix}--playground`;
  await page.goto(`http://127.0.0.1:6007/?path=/story/${encodeURIComponent(story)}`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  await expect(frame.locator('[data-slot="terminal-prompt"]')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  const path = new URL(page.url()).searchParams.get('path');
  await page.locator('[id="control-prompt"]').fill('reito ›');
  await expect(frame.getByText('reito ›', { exact: true })).toHaveCount(3);
  await page.locator('[id="control-value"]').fill('status');
  await expect(frame.getByRole('textbox', { name: '本地命令' })).toHaveValue('status');
  await frame.getByRole('textbox', { name: '本地命令' }).press('Enter');
  await expect(page.locator('[id="control-value"]')).toHaveValue('');
  await expect(frame.getByText('参数示例只记录输入，没有执行命令。')).toBeVisible();
  await page.locator('label[for="control-running"]').click();
  await expect(frame.getByRole('textbox', { name: '本地命令' })).toHaveAttribute('readonly');
  await frame.getByRole('button', { name: '取消当前命令' }).click();
  await expect(page.locator('[id="control-running"]')).not.toBeChecked();
  expect(new URL(page.url()).searchParams.get('path')).toBe(path);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: compact terminal fits a narrow work surface and passes axe`, async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 720 });
  const terminal = await open(page, 'narrow', `theme:${theme};density:${density}`);
  const viewport = terminal.getByRole('region', { name: '命令记录' });
  expect(await viewport.evaluate(element => element.getBoundingClientRect().height)).toBe(256);
  expect(await terminal.evaluate(element => getComputedStyle(element).borderColor)).not.toBe('rgba(0, 0, 0, 0)');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  expect(await page.evaluate(async () => (await (window as any).axe.run(document.body)).violations)).toEqual([]);
  await page.screenshot({ path: `.logs/terminal-prompt/${theme}-${density}.png`, fullPage: true });
});
