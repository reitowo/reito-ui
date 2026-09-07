import { expect, test, type Locator, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = 'ai-markdowncontent-richmessage';

async function open(page: Page, story = 'default', globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  const content = page.locator('[data-slot="markdown-content"]').first();
  await expect(content).toBeVisible({ timeout: 15_000 });
  return content;
}

async function axeViolations(page: Page) {
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  return page.evaluate(async () => (await (window as any).axe.run(document.body, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations);
}

async function expectNoPageOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
}

test('CommonMark and GFM structures render as semantic document nodes', async ({ page }) => {
  const content = await open(page);
  await expect(content.getByRole('heading', { level: 1, name: 'Reito UI 验收' })).toBeVisible();
  await expect(content.locator('strong')).toHaveText('加粗');
  await expect(content.locator('em')).toHaveText('强调');
  await expect(content.locator('del')).toHaveText('已移除');
  await expect(content.locator('blockquote')).toContainText('消息正文保持自然流动');
  await expect(content.locator('ol > li')).toHaveCount(2);
  await expect(content.locator('table')).toHaveCount(1);
});

test('GFM table keeps semantics and confines horizontal scrolling to its own surface', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  const content = await open(page, 'table');
  const scroller = content.locator('[data-slot="markdown-table-scroll"]');
  await expect(scroller).toHaveAttribute('aria-label', 'Markdown 表格');
  await expect(scroller.getByRole('table').getByRole('columnheader')).toHaveCount(3);
  await expect(scroller.getByRole('row')).toHaveCount(3);
  await scroller.focus();
  await expect(scroller).toBeFocused();
  await expectNoPageOverflow(page);
});

test('GFM task list exposes disabled checkbox state with readable names', async ({ page }) => {
  const content = await open(page, 'task-list');
  const completed = content.getByRole('checkbox', { name: '已完成任务' });
  const pending = content.getByRole('checkbox', { name: '未完成任务' });
  await expect(completed).toBeChecked();
  await expect(pending).not.toBeChecked();
  await expect(completed).toBeDisabled();
  await expect(pending).toBeDisabled();
});

test('fenced code reuses CodeBlock highlighting and copies the exact source', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async (value: string) => { (window as any).copiedMarkdownCode = value; } } });
  });
  const content = await open(page, 'fenced-code');
  const pre = content.getByLabel('typescript代码');
  await expect(pre.locator('code')).toHaveAttribute('data-highlighted', 'true');
  expect(await pre.textContent()).toBe('export const density = "compact";');
  await expect(pre.locator('.token.keyword').first()).toBeVisible();
  expect(await pre.evaluate(element => getComputedStyle(element).borderTopWidth)).toBe('0px');
  await content.getByRole('button', { name: '复制代码' }).click();
  await expect(content.getByRole('button', { name: '代码已复制' })).toBeVisible();
  expect(await page.evaluate(() => (window as any).copiedMarkdownCode)).toBe('export const density = "compact";');
});

test('inline code remains inline and does not create a CodeBlock toolbar', async ({ page }) => {
  const content = await open(page, 'inline-code');
  await expect(content.locator('p > code')).toHaveText('data-density="compact"');
  await expect(content.getByRole('button', { name: '复制代码' })).toHaveCount(0);
});

test('external links open separately while relative links stay in the current context', async ({ page }) => {
  const content = await open(page, 'links');
  const external = content.getByRole('link', { name: '外部文档' });
  const relative = content.getByRole('link', { name: '项目文档' });
  await expect(external).toHaveAttribute('target', '_blank');
  await expect(external).toHaveAttribute('rel', 'noopener noreferrer');
  await expect(relative).not.toHaveAttribute('target', '_blank');
  await expect(relative).toHaveAttribute('href', '/docs/design-language');
});

test('raw HTML policy escapes markup by default and can remove its tags', async ({ page }) => {
  const escaped = await open(page, 'html-escaped');
  await expect(escaped.locator('strong')).toHaveCount(0);
  await expect(escaped).toContainText('<strong data-demo="raw">HTML 不执行</strong>');
  const removed = await open(page, 'html-removed');
  await expect(removed.locator('strong')).toHaveCount(0);
  await expect(removed).toContainText('前文 HTML 不执行 后文');
  await expect(removed).not.toContainText('<strong');
});

test('unsafe link and image protocols never enter href or src', async ({ page }) => {
  const content = await open(page, 'unsafe-url');
  const link = content.getByText('不安全链接');
  await expect(link).not.toHaveAttribute('href', /javascript:/);
  const image = content.getByAltText('不安全图片');
  await expect(image).not.toHaveAttribute('src', /javascript:/);
});

test('allowed element filtering can unwrap disallowed link text', async ({ page }) => {
  const content = await open(page, 'filtered-elements');
  await expect(content.getByRole('heading', { name: '标题' })).toBeVisible();
  await expect(content.locator('strong')).toHaveText('强调');
  await expect(content.getByRole('link')).toHaveCount(0);
  await expect(content).toContainText('链接文字');
});

test('host renderers can replace semantic nodes and fenced code without HTML injection', async ({ page }) => {
  const content = await open(page, 'custom-renderers');
  await expect(content.getByTestId('custom-quote')).toContainText('由宿主替换引用节点');
  await expect(content.getByTestId('custom-code')).toHaveAttribute('aria-label', 'txt自定义代码块');
  await expect(content.getByTestId('custom-code')).toHaveText('custom renderer');
  await expect(content.getByRole('button', { name: '复制代码' })).toHaveCount(0);
});

test('empty content uses the explicit empty node and exposes state', async ({ page }) => {
  const content = await open(page, 'empty');
  await expect(content).toHaveAttribute('data-empty', 'true');
  await expect(content).toHaveText('没有可显示的 Markdown 内容');
  await expect(content.locator('p')).toHaveCount(1);
});

test('RichMessage preserves Message role, author and streaming semantics', async ({ page }) => {
  const content = await open(page, 'rich-assistant-message');
  const article = content.locator('xpath=ancestor::article');
  await expect(article).toHaveAttribute('aria-label', '助手的消息');
  await expect(article).toContainText('助手 · 本地示例');
  await expect(content.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(article.locator(':scope > div').filter({ has: content })).toHaveCount(1);
});

test('RichMessage uses the same Markdown scale inside the compact user bubble', async ({ page }) => {
  const content = await open(page, 'rich-user-message');
  const article = content.locator('xpath=ancestor::article');
  await expect(article).toHaveAttribute('aria-label', '你的消息');
  await expect(content.locator('strong')).toHaveText('Markdown');
  const fontSize = await content.evaluate(element => getComputedStyle(element).fontSize);
  expect(fontSize).toBe('14px');
});

test('Playground Controls update renderer props without leaving the Story', async ({ page }) => {
  const story = `${prefix}--playground`;
  await page.goto(`http://127.0.0.1:6007/?path=/story/${story}`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  await expect(frame.locator('[data-slot="markdown-content"]')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  const path = new URL(page.url()).searchParams.get('path');
  await page.locator('[id="control-value"]').fill('## 实时标题\n\n```ts\nconst value = 1;\n```');
  await expect(frame.getByRole('heading', { name: '实时标题' })).toBeVisible();
  await page.locator('label[for="control-codeCopyable"]').click();
  await expect(frame.getByRole('button', { name: '复制代码' })).toHaveCount(0);
  await page.locator('label[for="control-asMessage"]').click();
  await expect(frame.getByRole('article', { name: '助手的消息' })).toBeVisible();
  expect(new URL(page.url()).searchParams.get('path')).toBe(path);
});

test('Playground declares explicit controls for every adjustable example prop', async ({ page }) => {
  const story = `${prefix}--playground`;
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${story}&viewMode=story`);
  await page.waitForFunction(id => (window as any).__STORYBOOK_PREVIEW__?.currentRender?.id === id && (window as any).__STORYBOOK_PREVIEW__.currentRender.phase === 'finished', story);
  const contract = await page.evaluate(() => {
    const current = (window as any).__STORYBOOK_PREVIEW__.currentRender.story;
    const include = current.parameters.controls.include as string[];
    return { include, controls: include.map(name => current.argTypes[name]?.control) };
  });
  expect(contract.include).toEqual(['value', 'htmlPolicy', 'externalLinkTarget', 'codeCopyable', 'streaming', 'completeIncompleteMarkdown', 'asMessage', 'from', 'emptyText']);
  expect(contract.controls.every(Boolean)).toBe(true);
});

test('long paths and tables remain inside a narrow work surface', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 700 });
  const content = await open(page, 'narrow');
  await expect(content).toContainText('workspace/packages/ui/src/ai/markdown-content.tsx');
  await expect(content.locator('[data-slot="markdown-table-scroll"]')).toBeVisible();
  await expectNoPageOverflow(page);
});

test('streaming mode completes unclosed inline syntax without changing the source prop', async ({ page }) => {
  const content = await open(page, 'incomplete-inline');
  await expect(content).toHaveAttribute('data-streaming', 'true');
  await expect(content).toHaveAttribute('data-stream-completed-syntax', 'true');
  await expect(content).toHaveAttribute('aria-busy', 'true');
  await expect(content.locator('strong')).toHaveText('尚未闭合的强调');
  await expect(content).not.toContainText('**');
});

test('incomplete streaming links stay readable and non-interactive until their URL is complete', async ({ page }) => {
  const content = await open(page, 'incomplete-link');
  await expect(content).toContainText('打开 设计规范');
  await expect(content.getByRole('link')).toHaveCount(0);
  await expect(content).not.toContainText('https://example.com/des');
});

test('unclosed fenced code renders incrementally and copies only the exact streamed source', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async (value: string) => { (window as any).copiedStreamingCode = value; } } });
  });
  const content = await open(page, 'incomplete-fence');
  const code = content.getByLabel('typescript代码');
  await expect(code.locator('code')).toHaveAttribute('data-highlighted', 'true');
  await expect(code).toHaveText('export const chunk = "保持原文";');
  await content.getByRole('button', { name: '复制代码' }).click();
  expect(await page.evaluate(() => (window as any).copiedStreamingCode)).toBe('export const chunk = "保持原文";');
});

test('hosts can disable incomplete syntax completion and keep literal markers', async ({ page }) => {
  const content = await open(page, 'completion-disabled');
  await expect(content.locator('strong')).toHaveCount(0);
  await expect(content).toContainText('**保持原始标记');
  await expect(content).not.toHaveAttribute('data-stream-completed-syntax', 'true');
});

test('table syntax can change shape while settled siblings keep their DOM identity', async ({ page }) => {
  const content = await open(page, 'streaming-table');
  await expect(content.getByRole('heading', { name: '已稳定标题' })).toBeVisible();
  await expect(content.getByRole('table')).toHaveCount(0);
  await content.getByRole('heading').evaluate(element => { (window as any).settledMarkdownHeading = element; });
  await page.getByRole('button', { name: '下一表格阶段' }).click();
  await expect(content.getByRole('table')).toBeVisible();
  expect(await page.evaluate(() => (window as any).settledMarkdownHeading === document.querySelector('[data-slot="markdown-content"] h2'))).toBe(true);
  await page.getByRole('button', { name: '下一表格阶段' }).click();
  await expect(content.getByRole('row')).toHaveCount(2);
  await expect(content).not.toHaveAttribute('data-streaming', 'true');
});

test('streaming playground appends in place and exposes a deterministic completion action', async ({ page }) => {
  const content = await open(page, 'streaming-playground');
  await expect(content).toHaveAttribute('data-streaming', 'true');
  await content.getByRole('heading').evaluate(element => { (window as any).streamingHeading = element; });
  await page.getByRole('button', { name: '追加一块' }).click();
  expect(await page.evaluate(() => (window as any).streamingHeading === document.querySelector('[data-slot="markdown-content"] h2'))).toBe(true);
  await page.getByRole('button', { name: '完成流式示例' }).click();
  await expect(content).not.toHaveAttribute('data-streaming', 'true');
  await expect(content.getByRole('table')).toBeVisible();
  await expect(content.getByLabel('ts代码')).toHaveText(/appendOnly: true/);
});

test('changing streamKey remounts document nodes for a replacement generation', async ({ page }) => {
  const content = await open(page, 'stream-replacement-key');
  await content.getByRole('heading', { name: '第一段流' }).evaluate(element => { (window as any).previousStreamHeading = element; });
  await page.getByRole('button', { name: '替换流标识' }).click();
  await expect(content.getByRole('heading', { name: '第二段流' })).toBeVisible();
  expect(await page.evaluate(() => (window as any).previousStreamHeading.isConnected)).toBe(false);
});

test('RichMessage forwards its streaming state into MarkdownContent', async ({ page }) => {
  const content = await open(page, 'streaming-rich-message');
  await expect(content).toHaveAttribute('data-streaming', 'true');
  await expect(content).toHaveAttribute('aria-busy', 'true');
  await expect(content.locator('xpath=ancestor::article')).toContainText('正在输出');
  await expect(content.getByLabel('ts代码')).toHaveText('const stable = true;');
});

test('streaming playground declares controls for timing, chunking and rendering policy', async ({ page }) => {
  const story = `${prefix}--streaming-playground`;
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${story}&viewMode=story`);
  await page.waitForFunction(id => (window as any).__STORYBOOK_PREVIEW__?.currentRender?.id === id && (window as any).__STORYBOOK_PREVIEW__.currentRender.phase === 'finished', story);
  const contract = await page.evaluate(() => {
    const current = (window as any).__STORYBOOK_PREVIEW__.currentRender.story;
    const include = current.parameters.controls.include as string[];
    return { include, controls: include.map(name => current.argTypes[name]?.control) };
  });
  expect(contract.include).toEqual(['source', 'chunkSize', 'intervalMs', 'autoStart', 'asMessage', 'completeIncompleteMarkdown']);
  expect(contract.controls.every(Boolean)).toBe(true);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: Markdown document remains compact and accessible`, async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 760 });
  const content = await open(page, 'default', `theme:${theme};density:${density}`);
  await expect(content.locator('table')).toBeVisible();
  await expect(content.getByLabel('ts代码')).toBeVisible();
  await expectNoPageOverflow(page);
  expect(await axeViolations(page)).toEqual([]);
  await page.screenshot({ path: `.logs/markdown-content/document-${theme}-${density}.png`, fullPage: true });
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: RichMessage keeps Markdown in the shared message surface`, async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 760 });
  const content = await open(page, 'rich-assistant-message', `theme:${theme};density:${density}`);
  await expect(content.locator('xpath=ancestor::article')).toHaveAttribute('aria-label', '助手的消息');
  await expectNoPageOverflow(page);
  expect(await axeViolations(page)).toEqual([]);
  await page.screenshot({ path: `.logs/markdown-content/message-${theme}-${density}.png`, fullPage: true });
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: streaming Markdown keeps one compact live region`, async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 760 });
  const content = await open(page, 'streaming-rich-message', `theme:${theme};density:${density}`);
  await expect(content).toHaveAttribute('aria-busy', 'true');
  await expect(content.getByLabel('ts代码')).toBeVisible();
  await expectNoPageOverflow(page);
  expect(await axeViolations(page)).toEqual([]);
  await page.screenshot({ path: `.logs/markdown-content/streaming-${theme}-${density}.png`, fullPage: true });
});
