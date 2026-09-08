import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = 'ai-messageparts';

async function open(page: Page, story = 'playground', globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  const parts = page.locator('[data-slot="message-parts"]').first();
  await expect(parts).toBeVisible({ timeout: 15_000 });
  return parts;
}

async function axeViolations(page: Page) {
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  return page.evaluate(async () => (await (window as any).axe.run(document.body, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations);
}

async function expectNoPageOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
}

test('all known parts map to the existing AI presentation components in order', async ({ page }) => {
  const parts = await open(page, 'all-parts');
  await expect(parts.locator('[data-slot="message-part"]')).toHaveCount(5);
  await expect(parts.locator('[data-message-part-type="text"] strong')).toHaveText('Graphite');
  await expect(parts.locator('[data-message-part-type="tool"]')).toContainText('检查设计令牌');
  await expect(parts.locator('[data-message-part-type="source"]').getByRole('region', { name: '引用来源' })).toBeVisible();
  await expect(parts.locator('[data-message-part-type="attachment"]').getByRole('list', { name: '附件' })).toBeVisible();
  await expect(parts.locator('[data-message-part-type="artifact"]').getByRole('region', { name: '产物：workspace.ts' })).toBeVisible();
  expect(await parts.locator('[data-slot="message-part"]').evaluateAll(elements => elements.map(element => element.getAttribute('data-message-part-id')))).toEqual(['answer', 'tool', 'sources', 'attachment', 'artifact']);
});

test('StructuredMessage derives output state from a streaming part', async ({ page }) => {
  const parts = await open(page, 'streaming-text');
  await expect(parts.locator('[data-message-part-id="stream"]')).toHaveAttribute('data-status', 'streaming');
  await expect(parts.locator('[data-slot="markdown-content"]')).toHaveAttribute('aria-busy', 'true');
  await expect(parts.locator('xpath=ancestor::article')).toContainText('正在输出');
});

test('stable part IDs preserve settled DOM identity while another part grows', async ({ page }) => {
  const parts = await open(page, 'stable-part-identity');
  await parts.locator('[data-message-part-id="stable"]').evaluate(element => { (window as any).stablePartNode = element; });
  await page.getByRole('button', { name: '追加流内容' }).click();
  await expect(parts).toContainText('稳定开头 + 新片段');
  expect(await page.evaluate(() => (window as any).stablePartNode === document.querySelector('[data-message-part-id="stable"]'))).toBe(true);
});

test('tool retry emits its part ID and lets the host replace status and content', async ({ page }) => {
  const parts = await open(page, 'all-parts');
  const tool = parts.locator('[data-message-part-id="tool"]');
  await expect(tool).toHaveAttribute('data-status', 'error');
  await tool.getByRole('button', { name: '重试此步骤' }).click();
  await expect(tool).toHaveAttribute('data-status', 'complete');
  await expect(tool).toContainText('本地状态已恢复，没有执行真实工具。');
});

test('attachment and artifact callbacks include the containing part identity', async ({ page }) => {
  const parts = await open(page, 'all-parts');
  await parts.getByRole('button', { name: '重试workspace-preview.png' }).click();
  await expect(parts.getByText('48 KB')).toBeVisible();
  await parts.getByRole('button', { name: '移除附件design-language.md' }).click();
  await expect(parts.locator('[data-message-part-id="attachment"]')).not.toContainText('design-language.md');
  await parts.getByRole('tab', { name: '代码' }).click();
  await expect(parts.getByLabel('workspace.ts代码')).toHaveText('export const density = "compact";');
  await parts.getByRole('combobox', { name: '产物版本' }).click();
  await page.getByRole('option', { name: '版本 2' }).click();
  await expect(parts.getByLabel('workspace.ts代码')).toHaveText('export const density = "comfortable";');
  await parts.getByRole('button', { name: '关闭产物workspace.ts' }).click();
  await expect(parts.locator('[data-message-part-id="artifact"]')).toHaveCount(0);
});

test('runtime provider types degrade to a readable unknown part instead of throwing', async ({ page }) => {
  const parts = await open(page, 'runtime-unknown-type');
  const unknown = parts.locator('[data-message-part-id="provider-event"]');
  await expect(unknown).toHaveAttribute('data-message-part-type', 'provider-event');
  await expect(unknown.getByRole('note')).toHaveText('暂不支持的消息部分：provider-event');
});

test('hosts can render an explicitly unknown part without exposing its payload', async ({ page }) => {
  const parts = await open(page, 'custom-unknown-renderer');
  await expect(parts.getByTestId('custom-unknown')).toHaveText('宿主已处理 data-progress');
  await expect(parts).not.toContainText('50');
});

test('error parts keep cached content and expose a host retry action', async ({ page }) => {
  const parts = await open(page, 'error-part');
  await expect(parts).toContainText('这段已接收内容继续保留。');
  await expect(parts.getByRole('alert')).toHaveText(/后续内容接收失败/);
  await expect(parts.getByRole('button', { name: '重试' })).toBeVisible();
});

test('empty state remains explicit and replaceable', async ({ page }) => {
  const parts = await open(page, 'empty');
  await expect(parts).toHaveText('没有消息内容');
  await expect(parts.locator('[data-slot="message-part"]')).toHaveCount(0);
});

test('Playground Controls update the composed message without changing Story tabs', async ({ page }) => {
  const story = `${prefix}--playground`;
  await page.goto(`http://127.0.0.1:6007/?path=/story/${story}`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  await expect(frame.locator('[data-slot="message-parts"]')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  const path = new URL(page.url()).searchParams.get('path');
  await page.locator('[id="control-text"]').fill('## 实时结构化内容');
  await expect(frame.getByRole('heading', { name: '实时结构化内容' })).toBeVisible();
  await page.locator('label[for="control-includeArtifact"]').click();
  await expect(frame.getByRole('region', { name: '产物：workspace.ts' })).toBeVisible();
  await page.locator('label[for="control-includeUnknown"]').click();
  await expect(frame.getByRole('note')).toContainText('data-progress');
  expect(new URL(page.url()).searchParams.get('path')).toBe(path);
});

test('Playground declares a concrete control for every adjustable field', async ({ page }) => {
  const story = `${prefix}--playground`;
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${story}&viewMode=story`);
  await page.waitForFunction(id => (window as any).__STORYBOOK_PREVIEW__?.currentRender?.id === id && (window as any).__STORYBOOK_PREVIEW__.currentRender.phase === 'finished', story);
  const contract = await page.evaluate(() => {
    const current = (window as any).__STORYBOOK_PREVIEW__.currentRender.story;
    const include = current.parameters.controls.include as string[];
    return { include, controls: include.map(name => current.argTypes[name]?.control) };
  });
  expect(contract.include).toEqual(['text', 'textFormat', 'textStatus', 'from', 'includeTool', 'toolStatus', 'toolOpen', 'includeSources', 'includeAttachments', 'includeArtifact', 'artifactView', 'includeUnknown']);
  expect(contract.controls.every(Boolean)).toBe(true);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: all parts remain compact, accessible and contained`, async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 900 });
  const parts = await open(page, 'all-parts', `theme:${theme};density:${density}`);
  await expect(parts.locator('[data-slot="message-part"]')).toHaveCount(5);
  await expectNoPageOverflow(page);
  expect(await axeViolations(page)).toEqual([]);
  await page.screenshot({ path: `.logs/message-parts/all-${theme}-${density}.png`, fullPage: true });
});

test('narrow structured content does not create page-level horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 900 });
  const parts = await open(page, 'narrow');
  await expect(parts.locator('[data-message-part-id="artifact"]')).toBeVisible();
  await expectNoPageOverflow(page);
});
