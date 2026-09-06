import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const option = name => { const index = process.argv.indexOf(name); return index < 0 ? undefined : process.argv[index + 1]; };
const base = option('--base-url') || 'http://127.0.0.1:6006';
const output = option('--output') || '.logs/storybook-controls/controls.json';
const smoke = process.argv.includes('--smoke');
const index = await fetch(`${base}/index.json`).then(response => response.json());
const playgrounds = Object.values(index.entries).filter(entry => entry.type === 'story' && entry.id.endsWith('--playground'));
const manifest = JSON.parse(await readFile('apps/lab/src/catalog-manifest.json', 'utf8'));
if (!smoke) {
  assert.equal(playgrounds.length, manifest.total, 'Each component family needs one props Playground');
  assert(manifest.entries.every(entry => entry.storyId.endsWith('--playground') && index.entries[entry.storyId]), 'Lab must link to each Playground');
}
const browser = await chromium.launch({ channel: process.env.REITO_BROWSER_CHANNEL || (process.platform === 'win32' ? 'msedge' : undefined), headless: true });
const inventory = [];
const interactions = [];
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  // Read the prepared Storybook metadata, not an assumed list of controls.
  for (const entry of smoke ? [] : playgrounds) {
    await page.goto(`${base}/iframe.html?id=${encodeURIComponent(entry.id)}&viewMode=story`);
    await page.waitForFunction(id => window.__STORYBOOK_PREVIEW__?.currentRender?.id === id && window.__STORYBOOK_PREVIEW__.currentRender.phase === 'finished', entry.id);
    const contract = await page.evaluate(() => {
      const story = window.__STORYBOOK_PREVIEW__.currentRender.story;
      const include = story.parameters.controls?.include;
      return { include, controls: (include || []).map(name => ({ name, value: story.initialArgs[name], control: story.argTypes[name]?.control, options: story.argTypes[name]?.options })) };
    });
    assert(Array.isArray(contract.include) && contract.include.length, `${entry.id} has no explicit controls`);
    for (const control of contract.controls) {
      assert(control.control && control.control !== false, `${entry.id}/${control.name} has no control type`);
      assert.notEqual(control.value, undefined, `${entry.id}/${control.name} needs an initial value`);
    }
    inventory.push({ id: entry.id, ...contract });
    if (inventory.length % 22 === 0) console.log(`Checked ${inventory.length}/${playgrounds.length} control contracts`);
  }

  async function open(id, theme = 'dark', density = 'compact') {
    await page.goto(`${base}/?path=/story/${encodeURIComponent(id)}&globals=theme:${theme};density:${density}`);
    const frame = page.frameLocator('#storybook-preview-iframe');
    await frame.locator('#storybook-root > *').waitFor();
    await page.getByRole('tab', { name: /^Controls/ }).click();
    return frame;
  }
  async function change(name, value) {
    const control = page.locator(`[id="control-${name}"]`);
    await expect(control).toBeVisible();
    const tag = await control.evaluate(element => element.tagName);
    if (tag === 'SELECT') {
      const optionValue = await control.locator('option').evaluateAll((options, requested) => options.find(option => option.textContent === String(requested) || option.value === String(requested))?.value, value);
      assert.notEqual(optionValue, undefined, `No option ${name}=${value}`);
      await control.selectOption(optionValue);
    } else if (typeof value === 'boolean') {
      // Storybook styles the switch through its visible label.
      if (await control.isChecked() !== value) await page.locator(`label[for="control-${name}"]`).click();
      await expect(control).toBeChecked({ checked: value });
    }
    else await control.fill(String(value));
  }
  async function selected(name, value) {
    await expect(page.locator(`[id="control-${name}"] option:checked`)).toHaveText(String(value));
  }
  async function scenario(id, changed, verify) {
    const frame = await open(id);
    const path = new URL(page.url()).searchParams.get('path');
    await verify(frame);
    assert.equal(new URL(page.url()).searchParams.get('path'), path, `${id}: Controls must keep the same Story`);
    interactions.push({ id, theme: 'dark', density: 'compact', changed, sameStory: true });
  }

  for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) {
    const frame = await open('基础-button--playground', theme, density);
    const url = new URL(page.url()).searchParams.get('path');
    const button = frame.locator('[data-rui-button]');
    const before = await button.evaluate(element => ({ height: element.getBoundingClientRect().height, color: getComputedStyle(element).backgroundColor }));
    await change('variant', 'destructive');
    await expect(button).toHaveAttribute('data-variant', 'destructive');
    await expect.poll(() => button.evaluate(element => getComputedStyle(element).backgroundColor)).not.toBe(before.color);
    await change('size', 'lg');
    await expect(button).toHaveAttribute('data-size', 'lg');
    await expect.poll(() => button.evaluate(element => element.getBoundingClientRect().height)).toBeGreaterThan(before.height);
    await change('disabled', true);
    await expect(button).toBeDisabled();
    await change('disabled', false);
    await change('children', '同一画布更新');
    await expect(button).toHaveText('同一画布更新');
    await change('size', 'icon-sm');
    await expect(button).toHaveAccessibleName('同一画布更新');
    assert.equal(new URL(page.url()).searchParams.get('path'), url, 'Editing props must not navigate to another Story');
    interactions.push({ id: '基础-button--playground', theme, density, changed: ['variant', 'size', 'disabled', 'children'], sameStory: true });
  }
  await mkdir('.logs/storybook-controls', { recursive: true });
  const frame = await open('基础-button--playground');
  await change('variant', 'outline');
  await change('size', 'lg');
  await expect(frame.locator('[data-rui-button]')).toHaveAttribute('data-size', 'lg');
  await page.screenshot({ path: '.logs/storybook-controls/button-controls.png' });
  if (!smoke) {
    for (const id of ['基础-empty--no-results', '基础-empty--playground']) await scenario(id, ['title', 'description', 'icon', 'mediaVariant', 'border'], async frame => {
      await change('title', '直接调整当前预览');
      await expect(frame.locator('[data-slot="empty-title"]')).toHaveText('直接调整当前预览');
      await change('description', '不离开当前画布即可修改参数。');
      await expect(frame.locator('[data-slot="empty-description"]')).toHaveText('不离开当前画布即可修改参数。');
      await change('icon', 'none');
      await expect(frame.locator('[data-slot="empty-icon"]')).toHaveCount(0);
      await change('icon', 'inbox');
      await change('mediaVariant', 'default');
      await expect(frame.locator('[data-slot="empty-icon"]')).toHaveAttribute('data-variant', 'default');
      await change('border', true);
      await expect(frame.locator('[data-slot="empty"]')).toHaveClass(/\bborder\b/);
      await page.screenshot({ path: `.logs/storybook-controls/${id.endsWith('--no-results') ? 'empty-current-controls' : 'empty-playground-controls'}.png` });
    });
    await scenario('基础-collapsible--playground', ['open', 'disabled'], async frame => {
      const trigger = frame.getByRole('button', { name: '展开 3 个文件' });
      await change('open', true);
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');
      await expect(frame.getByText('tokens.json')).toBeVisible();
      await trigger.click();
      await expect(page.locator('[id="control-open"]')).not.toBeChecked();
      await change('disabled', true);
      await expect(trigger).toBeDisabled();
    });
    await scenario('基础-tabs--playground', ['variant', 'value', 'disabledTab'], async frame => {
      await change('variant', 'line');
      await expect(frame.locator('[data-slot="tabs-list"]')).toHaveAttribute('data-variant', 'line');
      await change('value', 'code');
      await expect(frame.getByRole('tab', { name: '代码' })).toHaveAttribute('aria-selected', 'true');
      await frame.getByRole('tab', { name: '历史' }).click();
      await selected('value', 'history');
      await change('value', 'preview');
      await change('disabledTab', true);
      await expect(frame.getByRole('tab', { name: '历史' })).toBeDisabled();
    });
    await scenario('基础-select--playground', ['value', 'size', 'disabled'], async frame => {
      const select = frame.getByRole('combobox', { name: '选择执行位置' });
      await change('size', 'sm');
      await expect(select).toHaveAttribute('data-size', 'sm');
      await change('value', 'worktree');
      await expect(select).toContainText('隔离工作区');
      await select.click();
      await frame.getByRole('option', { name: '云端', exact: true }).click();
      await selected('value', 'cloud');
      await change('disabled', true);
      await expect(select).toBeDisabled();
    });
    await scenario('基础-popover--playground', ['open', 'title'], async frame => {
      await change('open', true);
      await expect(frame.getByRole('dialog')).toBeVisible();
      await change('title', '实时修改浮层标题');
      await expect(frame.getByRole('dialog')).toContainText('实时修改浮层标题');
      await frame.getByRole('button', { name: '查看工作区信息' }).click();
      await expect(page.locator('[id="control-open"]')).not.toBeChecked();
    });
    await scenario('ai-toolcall--playground', ['variant', 'status', 'open', 'title'], async frame => {
      await change('variant', 'card');
      await expect(frame.locator('[data-slot="collapsible"]')).toHaveClass(/bg-card/);
      await change('status', 'error');
      await change('open', true);
      await expect(frame.getByRole('button', { name: '重试此步骤' })).toBeVisible();
      await frame.getByRole('button', { name: '重试此步骤' }).click();
      await selected('status', 'running');
      await change('title', '实时工具标题');
      await frame.getByRole('button', { name: /实时工具标题/ }).click();
      await expect(page.locator('[id="control-open"]')).not.toBeChecked();
    });
    await scenario('ai-codeblock--playground', ['code', 'language', 'filename', 'copyable'], async frame => {
      await change('code', 'const value = 42;');
      await expect(frame.locator('[data-slot="code-content"]')).toHaveText('const value = 42;');
      await expect(frame.locator('[data-slot="code-content"]')).toHaveAttribute('data-highlighted', 'true');
      await change('language', 'text');
      await expect(frame.locator('[data-slot="code-content"]')).toHaveAttribute('data-highlighted', 'false');
      await change('filename', 'live-controls.txt');
      await expect(frame.getByLabel('live-controls.txt代码')).toBeVisible();
      await change('copyable', false);
      await expect(frame.getByRole('button', { name: '复制代码' })).toHaveCount(0);
    });
    const dataTable = playgrounds.find(entry => entry.title.startsWith('复杂/DataTable'));
    await scenario(dataTable.id, ['pageSize', 'selectable', 'empty', 'error'], async frame => {
      await change('pageSize', 3);
      await expect(frame.getByRole('row')).toHaveCount(4);
      await change('selectable', false);
      await expect(frame.getByRole('checkbox')).toHaveCount(0);
      await change('empty', true);
      await expect(frame.getByText('共 0 条', { exact: true })).toBeVisible();
      await change('error', '本地数据暂不可用');
      await expect(frame.getByRole('alert')).toHaveText('本地数据暂不可用');
    });
  }
} finally { await browser.close(); }
await mkdir('.logs/storybook-controls', { recursive: true });
await writeFile(output, JSON.stringify({ base, playgrounds: playgrounds.length, inventory, interactions }, null, 2));
console.log(`Verified ${inventory.length} Playground control contracts and ${interactions.length} live Controls scenarios.`);
