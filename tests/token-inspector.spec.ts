import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { tokenCatalog } from '@reito/tokens/catalog';

const source = JSON.parse(readFileSync('packages/tokens/src/tokens.json', 'utf8'));
function leaves(node: Record<string, any>, prefix = ''): Array<{path: string; node: any}> {
  return Object.entries(node).flatMap(([key, value]) => {
    if (key.startsWith('$')) return [];
    const path = prefix ? `${prefix}.${key}` : key;
    return '$value' in value ? [{ path, node: value }] : leaves(value, path);
  });
}

test('inspection catalog covers every source definition exactly once', () => {
  const expected = leaves(source);
  expect(tokenCatalog.map(token => token.path).sort()).toEqual(expected.map(token => token.path).sort());
  expect(new Set(tokenCatalog.map(token => token.path)).size).toBe(tokenCatalog.length);
  const definitions = new Map(tokenCatalog.map(token => [token.path, token]));
  for (const {path, node} of expected) expect(definitions.get(path)?.sourceValue, path).toEqual(node.$value);
});

test('catalog preserves public namespace, aliases and CSS expressions without inventing recipe variables', () => {
  const find = (path: string) => tokenCatalog.find(token => token.path === path)!;
  expect(find('density.compact.font-interface').cssVariable).toBe('--rui-font-interface');
  expect(find('density.compact.font-interface').cssValue).toBe('var(--rui-text-sm)');
  expect(find('components.menu.item-padding-y').cssValue).toContain('--rui-component-menu-item-height');
  expect(find('density.comfortable.control-height').cssVariable).toBe('--rui-control-height');
  expect(tokenCatalog.filter(token => token.group === 'colorThemes').every(token => token.cssVariable === null)).toBe(true);
});

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) {
  test(`${theme}/${density}: inspector filters, selects, tracks live values and returns focus`, async ({ page }) => {
    await page.addInitScript(({theme, density}) => {
      localStorage.setItem('reito-theme', theme);
      localStorage.setItem('reito-density', density);
    }, {theme, density});
    await page.goto('/?view=overview');
    const trigger = page.getByRole('button', {name:'主题',exact:true});
    await expect(page.getByRole('button', {name:'Tokens',exact:true})).toHaveCount(0);
    await trigger.click();
    await page.getByRole('menuitem', {name:'查看设计变量',exact:true}).click();
    const dialog = page.getByRole('dialog', {name:'设计变量',exact:true});
    const search = dialog.getByRole('textbox', {name:'搜索设计变量'});
    await expect(search).toBeFocused();
    await expect(dialog).toHaveCSS('height', '640px');
    const navigation = dialog.getByRole('navigation', {name:'变量分类导航'});
    await navigation.getByRole('button', {name:/^全部变量/}).click();
    await dialog.getByRole('checkbox', {name:'全部模式'}).check();
    await expect(dialog.locator('[data-token-path]')).toHaveCount(tokenCatalog.length);
    await navigation.getByRole('button', {name:/^密度/}).click();
    await search.fill('font-interface');
    await dialog.getByRole('button', {name:`查看变量 density.${density}.font-interface`,exact:true}).click();
    const detail = dialog.getByRole('complementary', {name:'变量详情'});
    await expect(detail).toContainText('var(--rui-text-sm)');
    await page.evaluate(() => document.documentElement.style.setProperty('--rui-font-interface','18px'));
    await expect(detail).toContainText('18px');
    await page.evaluate(() => document.documentElement.style.removeProperty('--rui-font-interface'));
    await search.fill('不存在的变量 xyz');
    await expect(dialog.getByText('没有匹配的变量。')).toBeVisible();
    await expect(dialog).toHaveCSS('height','640px');
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
  });
}

test('all Lab headers open the same catalog and export the complete source', async ({ page }) => {
  for (const route of ['/', '/?view=overview', '/?layer=basic&component=button', '/?view=theme-guide']) {
    await page.goto(route);
    const trigger = page.getByRole('button',{name:'主题',exact:true});
    await trigger.click();
    await page.getByRole('menuitem',{name:'查看设计变量',exact:true}).click();
    const dialog = page.getByRole('dialog',{name:'设计变量',exact:true});
    await expect(dialog.getByRole('status')).toContainText(`完整源定义 ${tokenCatalog.length} 条`);
    if (route === '/?view=theme-guide') {
      const download = page.waitForEvent('download');
      await dialog.getByRole('button',{name:'导出完整 JSON'}).click();
      const path = await (await download).path();
      expect(JSON.parse(readFileSync(path!, 'utf8'))).toEqual(source);
    }
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
  }
});

test('narrow inspector keeps categories and selected details reachable without page overflow', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('/?view=overview');
  await page.getByRole('button',{name:'主题',exact:true}).click();
  await page.getByRole('menuitem',{name:'查看设计变量',exact:true}).click();
  const dialog = page.getByRole('dialog',{name:'设计变量',exact:true});
  await expect(dialog.getByRole('combobox',{name:'变量分类'})).toBeVisible();
  await dialog.getByRole('button',{name:'查看变量 themes.dark.bg',exact:true}).click();
  await expect(dialog.locator('details').getByText('--rui-bg',{exact:true})).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const bounds = await dialog.boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390);
  await page.addScriptTag({content:readFileSync('node_modules/axe-core/axe.min.js','utf8')});
  const violations = await dialog.evaluate(async dialog => (await (window as any).axe.run(dialog)).violations.map((v:any)=>v.id));
  expect(violations).toEqual([]);
});
