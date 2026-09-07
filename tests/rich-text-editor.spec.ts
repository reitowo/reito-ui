import { expect, test, type Locator, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const prefix = '复杂-richtexteditor-富文本编辑';

async function open(page: Page, story = 'default', globals = 'theme:dark;density:compact') {
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${prefix}--${story}&viewMode=story&globals=${globals}`);
  const surface = page.locator('[data-slot="rich-text-editor"]');
  await expect(surface).toBeVisible({ timeout: 15_000 });
  await expect(surface.getByRole('textbox')).toBeVisible({ timeout: 15_000 });
  return surface;
}

async function editorOf(surface: Locator) {
  const editor = surface.getByRole('textbox');
  await expect(editor).toHaveAttribute('data-slot', 'rich-text-editor-content');
  return editor;
}

async function axeViolations(page: Page) {
  await page.addScriptTag({ content: readFileSync('node_modules/axe-core/axe.min.js', 'utf8') });
  return page.evaluate(async () => {
    for (let attempt = 0; attempt < 50; attempt += 1) {
      try { return (await (window as any).axe.run(document.body)).violations; }
      catch (error) {
        if (!String(error).includes('Axe is already running')) throw error;
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    throw new Error('Axe remained busy for five seconds');
  });
}

test('Markdown input is parsed into schema nodes instead of displayed as source text', async ({ page }) => {
  const surface = await open(page, 'markdown-controlled');
  const editor = await editorOf(surface);
  await expect(editor.locator('h1')).toHaveText('工作区说明');
  await expect(editor.locator('strong')).toHaveText('Graphite');
  await expect(editor.locator('ul > li')).toHaveCount(2);
  await expect(surface).toHaveAttribute('data-format', 'markdown');
});

test('HTML input preserves supported structure through the Tiptap schema', async ({ page }) => {
  const surface = await open(page, 'html-controlled');
  const editor = await editorOf(surface);
  await expect(editor.locator('h2')).toHaveText('HTML 草稿');
  await expect(editor.locator('strong')).toHaveText('schema');
  await expect(editor.locator('blockquote')).toContainText('未知属性不会进入输出');
});

test('JSON input is a real document tree and remains editable', async ({ page }) => {
  const surface = await open(page, 'json-controlled');
  const editor = await editorOf(surface);
  await expect(editor.locator('h2')).toHaveText('JSON 草稿');
  await editor.press('End');
  await editor.pressSequentially(' 新内容');
  await expect(editor).toContainText('这是规范文档树。 新内容');
});

test('editing publishes the selected Markdown format to a controlled host value', async ({ page }) => {
  const surface = await open(page, 'playground');
  const editor = await editorOf(surface);
  await editor.fill('受控更新');
  await expect(page.getByTestId('playground-output')).toContainText('# 受控更新');
  await expect(editor).toHaveText('受控更新');
});

test('one transaction exposes synchronized Markdown, HTML and JSON snapshots', async ({ page }) => {
  const surface = await open(page, 'multi-format-snapshot');
  const editor = await editorOf(surface);
  await editor.press('End');
  await editor.pressSequentially(' 已更新');
  await expect(page.getByTestId('snapshot-markdown')).toContainText('已更新');
  await expect(page.getByTestId('snapshot-html')).toContainText('<');
  await expect(page.getByTestId('snapshot-json')).toContainText('"type":"doc"');
});

test('controlled host replacement and clearing replace the document model', async ({ page }) => {
  const surface = await open(page, 'external-replacement');
  const editor = await editorOf(surface);
  await page.getByRole('button', { name: '替换文档' }).click();
  await expect(editor.locator('h2')).toHaveText('宿主替换');
  await expect(editor).toContainText('外部状态已成为新的受控文档。');
  await page.getByRole('button', { name: '清空文档' }).click();
  await expect(surface).toHaveAttribute('data-empty', 'true');
  await expect(editor).toHaveText('');
});

test('empty content has a visible placeholder outside the persisted document', async ({ page }) => {
  const surface = await open(page, 'empty');
  const editor = await editorOf(surface);
  await expect(surface).toHaveAttribute('data-empty', 'true');
  await expect(surface.getByText('记录当前工作区决策…')).toBeVisible();
  await expect(editor).toHaveText('');
  expect(await editor.locator('[data-placeholder]').count()).toBe(0);
});

test('read-only and disabled states expose distinct semantics and reject edits', async ({ page }) => {
  let surface = await open(page, 'read-only');
  let editor = await editorOf(surface);
  await expect(editor).toHaveAttribute('contenteditable', 'false');
  await expect(editor).toHaveAttribute('aria-readonly', 'true');
  await expect(editor).toHaveAttribute('aria-disabled', 'false');
  const readOnlyText = await editor.textContent();
  await editor.pressSequentially('不可写');
  await expect(editor).toHaveText(readOnlyText!);

  surface = await open(page, 'disabled');
  editor = await editorOf(surface);
  await expect(editor).toHaveAttribute('contenteditable', 'false');
  await expect(editor).toHaveAttribute('aria-disabled', 'true');
  await expect(surface).toHaveAttribute('data-disabled', 'true');
});

test('invalid JSON reports a format error and preserves a valid empty document', async ({ page }) => {
  const surface = await open(page, 'invalid-json');
  await expect(surface.getByRole('alert')).toContainText(/Unknown node type|Invalid.*content|unknown-node/i);
  await expect(surface).toHaveAttribute('data-empty', 'true');
  await expect(await editorOf(surface)).toHaveText('');
});

test('a host error remains visible without removing the current draft', async ({ page }) => {
  const surface = await open(page, 'host-error');
  await expect(surface.getByRole('alert')).toHaveText('宿主未能保存草稿；当前内容仍保留在编辑器。');
  await expect(await editorOf(surface)).toContainText('工作区说明');
});

test('unsupported HTML elements and event attributes do not survive schema parsing', async ({ page }) => {
  const surface = await open(page, 'filtered-html');
  const editor = await editorOf(surface);
  await expect(editor.locator('h2')).toHaveText('安全边界');
  await expect(editor.locator('[onclick], [data-private], script')).toHaveCount(0);
  expect(await page.evaluate(() => (window as any).bad)).toBeUndefined();
});

test('IME composition updates the document and controlled Markdown output once composed', async ({ page }) => {
  const surface = await open(page, 'ime-input');
  const editor = await editorOf(surface);
  await editor.dispatchEvent('compositionstart');
  await editor.dispatchEvent('keydown', { key: 'k', ctrlKey: true, isComposing: true });
  await expect(page.getByRole('textbox', { name: '链接地址' })).toHaveCount(0);
  await editor.pressSequentially('统一组件');
  await editor.dispatchEvent('compositionend', { data: '统一组件' });
  await expect(page.getByTestId('ime-output')).toContainText('统一组件');
});

test('toolbar mark commands update the document and expose current format state', async ({ page }) => {
  const surface = await open(page, 'playground');
  const editor = await editorOf(surface);
  await editor.fill('统一组件');
  await editor.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
  const bold = surface.getByRole('button', { name: '粗体' });
  await bold.click();
  await expect(editor.locator('strong')).toHaveText('统一组件');
  await expect(bold).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('playground-output')).toContainText('**统一组件**');
  await surface.getByRole('button', { name: '清除格式' }).click();
  await expect(editor.locator('strong')).toHaveCount(0);
});

test('structure commands create real headings and multi-item lists', async ({ page }) => {
  let surface = await open(page, 'structure-toolbar');
  let editor = await editorOf(surface);
  await editor.fill('工作区标题');
  await editor.press('Home');
  await surface.getByRole('button', { name: '一级标题' }).click();
  await expect(editor.locator('h1')).toHaveText('工作区标题');
  await expect(surface.getByRole('button', { name: '一级标题' })).toHaveAttribute('aria-pressed', 'true');

  surface = await open(page, 'structure-toolbar');
  editor = await editorOf(surface);
  await editor.fill('第一项');
  await editor.press('End');
  await editor.press('Enter');
  await editor.pressSequentially('第二项');
  await editor.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
  await surface.getByRole('button', { name: '无序列表' }).click();
  await expect(editor.locator('ul > li')).toHaveCount(2);
  await editor.locator('li p').first().click();
  await expect(surface.getByRole('button', { name: '无序列表' })).toHaveAttribute('aria-pressed', 'true');
});

test('task-list Markdown parses nested checked state and checkbox changes serialize back', async ({ page }) => {
  const surface = await open(page, 'task-list-markdown');
  const editor = await editorOf(surface);
  const tasks = editor.locator('li[data-type="taskItem"]');
  const checkboxes = editor.getByRole('checkbox');
  await expect(tasks).toHaveCount(3);
  await expect(tasks.first().locator('ul[data-type="taskList"]')).toHaveCount(1);
  await expect(checkboxes.nth(0)).not.toBeChecked();
  await expect(checkboxes.nth(1)).toBeChecked();
  await checkboxes.nth(0).click();
  await expect(checkboxes.nth(0)).toBeChecked();
  await expect(page.getByTestId('task-list-output')).toContainText('- [x] 检查紧凑间距');
  await expect(page.getByTestId('task-list-output')).toContainText('  - [x] 确认嵌套任务');
});

test('task-list shortcut, Enter, Tab and Shift-Tab operate on real task nodes', async ({ page }) => {
  const surface = await open(page, 'extension-toolbar');
  const editor = await editorOf(surface);
  await editor.fill('第一项');
  await editor.press(process.platform === 'darwin' ? 'Meta+Shift+9' : 'Control+Shift+9');
  await expect(editor.locator('ul[data-type="taskList"] > li[data-type="taskItem"]')).toHaveCount(1);
  await expect(surface.getByRole('button', { name: '任务列表' })).toHaveAttribute('aria-pressed', 'true');
  await editor.press('End');
  await editor.press('Enter');
  await editor.pressSequentially('第二项');
  await expect(editor.locator('li[data-type="taskItem"]')).toHaveCount(2);
  await editor.press('Tab');
  await expect(editor.locator('li[data-type="taskItem"] ul[data-type="taskList"]')).toHaveCount(1);
  await editor.press('Shift+Tab');
  await expect(editor.locator('li[data-type="taskItem"] ul[data-type="taskList"]')).toHaveCount(0);
});

test('alignment writes HTML and JSON attributes while Markdown remains plain text', async ({ page }) => {
  const surface = await open(page, 'alignment-serialization');
  const editor = await editorOf(surface);
  await editor.locator('p').click();
  const center = surface.getByRole('button', { name: '居中对齐' });
  await center.click();
  await expect(editor.locator('p')).toHaveCSS('text-align', 'center');
  await expect(center).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('alignment-html')).toContainText('text-align: center');
  await expect(page.getByTestId('alignment-json')).toContainText('"textAlign":"center"');
  await expect(page.getByTestId('alignment-markdown')).toHaveText('选中段落并更改对齐方式。');
  await editor.press(process.platform === 'darwin' ? 'Meta+Shift+R' : 'Control+Shift+R');
  await expect(editor.locator('p')).toHaveCSS('text-align', 'right');
  await expect(surface.getByRole('button', { name: '右对齐' })).toHaveAttribute('aria-pressed', 'true');
});

test('emoji picker restores the caret and exposes synchronized node serialization', async ({ page }) => {
  const surface = await open(page, 'emoji-serialization');
  const editor = await editorOf(surface);
  await editor.click();
  await editor.press('End');
  await surface.getByRole('button', { name: '插入 Emoji' }).click();
  await page.getByRole('option', { name: '完成 ✅' }).click();
  await expect(editor.locator('span[data-type="emoji"][data-name="check"]')).toHaveText('✅');
  await expect(page.getByTestId('emoji-markdown')).toContainText(':check:');
  await expect(page.getByTestId('emoji-html')).toContainText('data-type="emoji"');
  await expect(page.getByTestId('emoji-json')).toContainText('"type":"emoji"');
  await expect(editor).toBeFocused();
});

test('emoji shortcode input rule creates the same schema node', async ({ page }) => {
  const surface = await open(page, 'emoji-serialization');
  const editor = await editorOf(surface);
  await editor.click();
  await editor.press('End');
  await editor.pressSequentially(' :rocket:');
  await editor.press('Space');
  await expect(editor.locator('span[data-type="emoji"][data-name="rocket"]')).toHaveText('🚀');
  await expect(page.getByTestId('emoji-markdown')).toContainText(':rocket:');
});

test('emoji picker exposes the configured empty state', async ({ page }) => {
  const surface = await open(page, 'emoji-empty-picker');
  await surface.getByRole('button', { name: '插入 Emoji' }).click();
  await expect(page.getByText('没有可插入的 Emoji')).toBeVisible();
  await expect(page.getByRole('option')).toHaveCount(0);
});

test('read-only task checkboxes retain their original checked state', async ({ page }) => {
  const surface = await open(page, 'task-list-read-only');
  const checkboxes = (await editorOf(surface)).getByRole('checkbox');
  await expect(checkboxes).toHaveCount(2);
  await expect(checkboxes.first()).not.toBeChecked();
  await checkboxes.first().click({ force: true });
  await expect(checkboxes.first()).not.toBeChecked();
  await expect(checkboxes.nth(1)).toBeChecked();
});

test('link UI restores the editor selection, writes href, and can unlink it', async ({ page }) => {
  const surface = await open(page, 'link-selection');
  const editor = await editorOf(surface);
  await editor.click();
  await editor.press('Home');
  await editor.press('Shift+ArrowRight');
  await editor.press('Shift+ArrowRight');
  await editor.press('Shift+ArrowRight');
  await editor.press('Shift+ArrowRight');
  await surface.getByRole('button', { name: '编辑链接' }).click();
  const href = page.getByRole('textbox', { name: '链接地址' });
  await href.fill('https://example.com/workspace');
  await page.getByRole('button', { name: '应用链接' }).click();
  await expect(editor.locator('a')).toHaveAttribute('href', 'https://example.com/workspace');
  await expect(editor.locator('a')).toHaveText('选择这段');
  await expect(page.getByTestId('link-output')).toContainText('https://example.com/workspace');
  await expect(surface.getByRole('button', { name: '编辑链接' })).toHaveAttribute('aria-pressed', 'true');
  await surface.getByRole('button', { name: '移除链接' }).click();
  await expect(editor.locator('a')).toHaveCount(0);
});

test('link command rejects unsafe schemes and keeps selected content unchanged', async ({ page }) => {
  const surface = await open(page, 'link-selection');
  const editor = await editorOf(surface);
  await editor.click();
  await editor.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
  await surface.getByRole('button', { name: '编辑链接' }).click();
  await page.getByRole('textbox', { name: '链接地址' }).fill('javascript:alert(1)');
  await page.getByRole('button', { name: '应用链接' }).click();
  await expect(page.getByRole('alert')).toContainText('链接地址无效');
  await expect(editor.locator('a')).toHaveCount(0);
  await expect(editor).toContainText('选择这段文字并设置链接。');
});

test('Mod-K opens link editing without losing the selected text range', async ({ page }) => {
  const surface = await open(page, 'link-selection');
  const editor = await editorOf(surface);
  await editor.click();
  await editor.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
  await editor.press(process.platform === 'darwin' ? 'Meta+K' : 'Control+K');
  await expect(page.getByRole('textbox', { name: '链接地址' })).toBeFocused();
  await page.getByRole('textbox', { name: '链接地址' }).fill('https://example.com/shortcut');
  await page.getByRole('button', { name: '应用链接' }).click();
  await expect(editor.locator('a')).toHaveText('选择这段文字并设置链接。');
});

test('undo and redo buttons track history availability and controlled output', async ({ page }) => {
  const surface = await open(page, 'history-controls');
  const editor = await editorOf(surface);
  const undo = surface.getByRole('button', { name: '撤销' });
  const redo = surface.getByRole('button', { name: '重做' });
  await expect(undo).toBeDisabled();
  await expect(redo).toBeDisabled();
  await editor.press('End');
  await editor.pressSequentially(' 已修改');
  await expect(undo).toBeEnabled();
  await undo.click();
  await expect(page.getByTestId('history-output')).toHaveText('历史起点');
  await expect(redo).toBeEnabled();
  await redo.click();
  await expect(page.getByTestId('history-output')).toContainText('已修改');
});

test('StarterKit keyboard shortcuts change marks and share the same undo history', async ({ page }) => {
  const surface = await open(page, 'playground');
  const editor = await editorOf(surface);
  await editor.fill('快捷键');
  await editor.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
  await editor.press(process.platform === 'darwin' ? 'Meta+B' : 'Control+B');
  await expect(editor.locator('strong')).toHaveText('快捷键');
  await editor.press(process.platform === 'darwin' ? 'Meta+Z' : 'Control+Z');
  await expect(editor.locator('strong')).toHaveCount(0);
  await editor.press(process.platform === 'darwin' ? 'Meta+Shift+Z' : 'Control+Y');
  await expect(editor.locator('strong')).toHaveText('快捷键');
});

test('toolbar is configurable and disabled states do not expose writable actions', async ({ page }) => {
  let surface = await open(page, 'marks-toolbar');
  await expect(surface.getByRole('toolbar')).toBeVisible();
  const bold = surface.getByRole('button', { name: '粗体' });
  await expect(bold).toBeVisible();
  await expect(surface.getByRole('button', { name: '一级标题' })).toHaveCount(0);
  await bold.focus();
  await bold.press('ArrowRight');
  await expect(surface.getByRole('button', { name: '斜体' })).toBeFocused();
  await page.keyboard.press('End');
  await expect(surface.getByRole('button', { name: '清除格式' })).toBeFocused();
  await page.keyboard.press('Home');
  await expect(bold).toBeFocused();
  surface = await open(page, 'toolbar-hidden');
  await expect(surface.getByRole('toolbar')).toHaveCount(0);
  surface = await open(page, 'disabled');
  const buttons = surface.getByRole('toolbar').getByRole('button');
  await expect(buttons.first()).toBeDisabled();
  expect(await buttons.count()).toBeGreaterThan(8);
});

test('slash suggestions filter commands and insert a real block node', async ({ page }) => {
  const surface = await open(page, 'slash-commands');
  const editor = await editorOf(surface);
  await editor.click();
  await editor.pressSequentially('/h2');
  const menu = page.getByRole('listbox', { name: '斜杠命令' });
  await expect(menu).toBeVisible();
  await expect(menu.getByRole('option')).toHaveCount(1);
  await expect(menu.getByRole('option', { name: /二级标题/ })).toHaveAttribute('aria-selected', 'true');
  await editor.press('Enter');
  await expect(menu).toHaveCount(0);
  await editor.pressSequentially('交互规范');
  await expect(editor.locator('h2')).toHaveText('交互规范');
  await expect(editor).not.toContainText('/h2');
});

test('slash trigger stays at a top-level line start and Escape preserves typed text', async ({ page }) => {
  const surface = await open(page, 'slash-commands');
  const editor = await editorOf(surface);
  await editor.fill('正文 /');
  await expect(page.getByRole('listbox', { name: '斜杠命令' })).toHaveCount(0);
  await editor.fill('/quo');
  await expect(page.getByRole('option', { name: /引用/ })).toBeVisible();
  await editor.press('Escape');
  await expect(page.getByRole('listbox', { name: '斜杠命令' })).toHaveCount(0);
  await expect(editor).toHaveText('/quo');
  await editor.pressSequentially('te');
  await expect(editor).toHaveText('/quote');
});

test('local mention selection skips disabled items and serializes the mention node', async ({ page }) => {
  const surface = await open(page, 'mention-local');
  const editor = await editorOf(surface);
  await editor.click();
  await editor.press('End');
  await editor.pressSequentially('@');
  const menu = page.getByRole('listbox', { name: '提及建议' });
  await expect(menu).toBeVisible();
  await expect(editor).toHaveAttribute('data-suggestions-open', 'true');
  await expect(editor).toHaveAttribute('aria-controls', /mention-suggestions/);
  await editor.press('End');
  await expect(menu.getByRole('option', { name: /Graphite Bot/ })).toHaveAttribute('aria-selected', 'true');
  await editor.press('ArrowDown');
  await expect(menu.getByRole('option', { name: /Reito/ })).toHaveAttribute('aria-selected', 'true');
  await editor.pressSequentially('lin');
  await expect(menu.getByRole('option', { name: /Lin/ })).toHaveAttribute('aria-selected', 'true');
  await editor.press('Tab');
  const mention = editor.locator('span[data-type="mention"][data-id="lin"]');
  await expect(mention).toHaveText('@Lin');
  await expect(editor).toBeFocused();
  await expect(editor).not.toHaveAttribute('data-suggestions-open', 'true');
  await expect(page.getByTestId('mention-json')).toContainText('"type":"mention"');
  await expect(page.getByTestId('mention-html')).toContainText('data-type="mention"');
  await expect(page.getByTestId('mention-markdown')).toContainText('id="lin"');
});

test('disabled mention results remain visible but cannot be inserted', async ({ page }) => {
  const surface = await open(page, 'mention-local');
  const editor = await editorOf(surface);
  await editor.click();
  await editor.press('End');
  await editor.pressSequentially('@arch');
  const option = page.getByRole('option', { name: /Archived User/ });
  await expect(option).toBeDisabled();
  await editor.press('Enter');
  await expect(editor.locator('span[data-type="mention"]')).toHaveCount(0);
  await expect(editor).toContainText('@arch');
});

test('async mention suggestions expose loading and resolve the latest query', async ({ page }) => {
  const surface = await open(page, 'mention-async');
  const editor = await editorOf(surface);
  await editor.click();
  await editor.pressSequentially('@l');
  await expect(page.getByRole('status')).toHaveText('加载建议…');
  await editor.pressSequentially('in');
  const menu = page.getByRole('listbox', { name: '提及建议' });
  await expect(menu.getByRole('option', { name: /Lin/ })).toBeVisible();
  await expect(menu.getByRole('option')).toHaveCount(1);
  await editor.press('Enter');
  await expect(editor.locator('span[data-id="lin"]')).toHaveText('@Lin');
});

test('mention trigger excludes email-like text and reports empty and disabled configurations', async ({ page }) => {
  let surface = await open(page, 'mention-empty');
  let editor = await editorOf(surface);
  await editor.fill('mail@');
  await expect(page.getByRole('listbox', { name: '提及建议' })).toHaveCount(0);
  await editor.fill('mail @nobody');
  await expect(page.getByRole('listbox', { name: '提及建议' })).toContainText('没有匹配项');
  surface = await open(page, 'suggestions-off');
  editor = await editorOf(surface);
  await editor.fill('@reito');
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await editor.fill('/h1');
  await expect(page.getByRole('listbox')).toHaveCount(0);
});

test('suggestions do not act on IME composition key events', async ({ page }) => {
  const surface = await open(page, 'mention-local');
  const editor = await editorOf(surface);
  await editor.dispatchEvent('compositionstart');
  await editor.pressSequentially('@');
  await editor.dispatchEvent('keydown', { key: 'Enter', keyCode: 229, isComposing: true });
  await expect(page.getByRole('listbox', { name: '提及建议' })).toHaveCount(0);
  await editor.dispatchEvent('compositionend', { data: '@' });
  await expect(editor.locator('span[data-type="mention"]')).toHaveCount(0);
});

test('Playground Controls change props in the current Story', async ({ page }) => {
  const story = `${prefix}--playground`;
  await page.goto(`http://127.0.0.1:6007/?path=/story/${encodeURIComponent(story)}`);
  const frame = page.frameLocator('#storybook-preview-iframe');
  await expect(frame.locator('[data-slot="rich-text-editor"]')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('tab', { name: /^Controls/ }).click();
  const path = new URL(page.url()).searchParams.get('path');
  await page.locator('[id="control-label"]').fill('实时文档');
  await expect(frame.getByRole('textbox', { name: '实时文档' })).toBeVisible();
  await page.locator('[id="control-placeholder"]').fill('实时占位');
  await page.locator('[id="control-value"]').fill('');
  await expect(frame.getByText('实时占位')).toBeVisible();
  await page.locator('label[for="control-readOnly"]').click();
  await expect(frame.getByRole('textbox', { name: '实时文档' })).toHaveAttribute('aria-readonly', 'true');
  await page.locator('label[for="control-disabled"]').click();
  await expect(frame.getByRole('textbox', { name: '实时文档' })).toHaveAttribute('aria-disabled', 'true');
  expect(new URL(page.url()).searchParams.get('path')).toBe(path);
});

test('Playground declares an explicit control for every adjustable example prop', async ({ page }) => {
  const story = `${prefix}--playground`;
  await page.goto(`http://127.0.0.1:6007/iframe.html?id=${story}&viewMode=story`);
  await page.waitForFunction(id => (window as any).__STORYBOOK_PREVIEW__?.currentRender?.id === id && (window as any).__STORYBOOK_PREVIEW__.currentRender.phase === 'finished', story);
  const contract = await page.evaluate(() => {
    const current = (window as any).__STORYBOOK_PREVIEW__.currentRender.story;
    const include = current.parameters.controls.include as string[];
    return { include, controls: include.map(name => current.argTypes[name]?.control) };
  });
  expect(contract.include).toEqual(['format', 'value', 'label', 'description', 'placeholder', 'readOnly', 'disabled', 'showToolbar', 'toolbarPreset', 'emojiPreset', 'suggestions', 'mentionPreset', 'slashPreset', 'linkPlaceholder', 'showOutput']);
  expect(contract.controls.every(Boolean)).toBe(true);
});

test('long content and narrow paths stay inside the component width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 720 });
  const surface = await open(page, 'narrow');
  await expect(await editorOf(surface)).toContainText('workspace/components/rich-text-editor');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: editor fits a narrow work surface and passes axe`, async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 720 });
  const surface = await open(page, 'narrow', `theme:${theme};density:${density}`);
  const editor = await editorOf(surface);
  expect(await editor.evaluate(element => element.getBoundingClientRect().height)).toBeGreaterThanOrEqual(224);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await axeViolations(page)).toEqual([]);
  await page.screenshot({ path: `.logs/rich-text-editor/${theme}-${density}.png`, fullPage: true });
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: editing extensions remain compact and accessible`, async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 720 });
  const surface = await open(page, 'task-list-markdown', `theme:${theme};density:${density}`);
  await expect((await editorOf(surface)).locator('li[data-type="taskItem"]')).toHaveCount(3);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await axeViolations(page)).toEqual([]);
  await page.screenshot({ path: `.logs/rich-text-editor/extensions-${theme}-${density}.png`, fullPage: true });
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) test(`${theme}/${density}: suggestion menu remains tokenized and accessible`, async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 720 });
  const surface = await open(page, 'mention-local', `theme:${theme};density:${density}`);
  const editor = await editorOf(surface);
  await editor.click();
  await editor.press('End');
  await editor.pressSequentially('@');
  await expect(page.getByRole('listbox', { name: '提及建议' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await axeViolations(page)).toEqual([]);
  await page.screenshot({ path: `.logs/rich-text-editor/suggestions-${theme}-${density}.png`, fullPage: true });
});
