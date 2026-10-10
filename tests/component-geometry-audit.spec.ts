import { test, expect } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import { readFileSync } from 'node:fs';
const count = JSON.parse(readFileSync('apps/lab/src/catalog-manifest.json', 'utf8')).total;

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) {
  test('catalog geometry audit and consistent compact action surfaces: ' + theme + '/' + density, async ({ page }) => {
    test.setTimeout(90_000);
    await page.addInitScript(({ theme, density }) => {
      localStorage.setItem('reito-theme', theme); localStorage.setItem('reito-density', density);
    }, { theme, density });
    await page.setViewportSize({ width: 1303, height: 1244 });
    await page.goto('/?view=overview');
    await expect(page.locator('[data-preview]')).toHaveCount(count);
    await expect(page.getByText('预览未能显示，请重置或在组件详情中打开。', { exact: true })).toHaveCount(0);
    const inventory = await page.locator('[data-component]').evaluateAll(tiles => tiles.map(tile => ({
      component: tile.getAttribute('data-component'),
      buttons: [...tile.querySelectorAll('[data-rui-button], [data-slot="toggle"], [data-slot="toggle-group-item"], [data-slot="tabs-trigger"], [data-slot="menubar-trigger"], [data-slot="select-trigger"]')].map(node => {
        const style = getComputedStyle(node);
        return { slot: node.getAttribute('data-slot'), size: node.getAttribute('data-size'), label: node.getAttribute('aria-label') || node.textContent?.trim().slice(0,60), height: style.height, icon: node.querySelector('svg') ? getComputedStyle(node.querySelector('svg')!).width : null, classes: node.className };
      }),
      surfaces: [...tile.querySelectorAll('article, section, [data-slot="card"], [data-slot="card-footer"]')].filter(node => parseFloat(getComputedStyle(node).borderTopWidth) > 0 || node.getAttribute('data-slot') === 'card').map(node => {
        const style = getComputedStyle(node);
        return { slot: node.getAttribute('data-slot'), label: node.getAttribute('aria-label'), x: style.paddingLeft, top: style.paddingTop, bottom: style.paddingBottom, gap: style.rowGap };
      }),
    })));
    writeFileSync('.logs/component-geometry-' + theme + '-' + density + '.json', JSON.stringify(inventory, null, 2));
    expect(inventory).toHaveLength(count);
    const sizes = density === 'compact' ? { default:28, icon:28, xs:24, 'icon-xs':24, sm:28, 'icon-sm':28, md:32, 'icon-md':32, lg:36, 'icon-lg':36 } : { default:36, icon:36, xs:32, 'icon-xs':32, sm:36, 'icon-sm':36, md:40, 'icon-md':40, lg:44, 'icon-lg':44 };
    const unexpected = inventory.flatMap(tile => tile.buttons.filter(button => {
      if (button.slot !== 'button' || !button.size || !(button.size in sizes)) return false;
      if (Math.abs(parseFloat(button.height) - sizes[button.size as keyof typeof sizes]) < .1) return false;
      // These are compound content targets rather than ordinary action buttons.
      if (tile.component === 'basic/calendar' && button.classes.includes('--cell-size')) return false;
      if (['complex/kanban', 'complex/stepper'].includes(tile.component!) && button.classes.includes('h-auto')) return false;
      return true;
    }).map(button => ({ component: tile.component, label: button.label, height: button.height })));
    expect(unexpected).toEqual([]);
    const height = density === 'compact' ? '28px' : '36px';
    const y = density === 'compact' ? '8px' : '12px';
    const x = density === 'compact' ? '12px' : '16px';
    const task = page.locator('[data-slot="agent-task-card"]');
    await expect(task).toHaveCSS('padding-left', '0px');
    await expect(task).toHaveCSS('padding-top', '0px');
    await expect(task).toHaveCSS('padding-bottom', '0px');
    const actions = task.locator('[data-slot="agent-task-actions"]');
    await expect(actions).toHaveCSS('padding-top', density === 'compact' ? '12px' : '16px');
    await expect(actions).toHaveCSS('padding-left', density === 'compact' ? '16px' : '20px');
    await expect(actions.getByRole('button', { name: '标记示例完成' })).toHaveCSS('height', height);
    for (const id of ['permission', 'token-usage', 'checkpoint']) {
      const surface = page.locator('[data-component="ai/' + id + '"] .atlas-inline-preview > div > section').first();
      await expect(surface).toHaveCSS('padding-left', x);
      await expect(surface).toHaveCSS('padding-top', y);
      await expect(surface).toHaveCSS('padding-bottom', y);
    }
    for (const id of ['message-actions','message-branch']) {
      const buttons = page.locator('[data-component="ai/' + id + '"] .atlas-inline-preview [data-rui-button]');
      for (const button of await buttons.all()) {
        await expect(button).toHaveCSS('height', height);
        await expect(button.locator('svg')).toHaveCSS('width', '14px');
      }
    }
    for (const slot of ['toggle','toggle-group-item','tabs-trigger','menubar-trigger']) {
      const controls = page.locator('[data-component^="basic/"] [data-slot="' + slot + '"]');
      for (const control of await controls.all()) await expect(control).toHaveCSS('height', height);
    }
    const composer = page.locator('[data-component="ai/composer"]');
    await expect(composer.getByRole('button', { name: '发送消息', exact: true })).toHaveCSS('height', height);
    await expect(composer.getByRole('combobox', { name: '选择模型' })).toHaveCSS('height', height);
    await expect(page.locator('[data-component="ai/task-queue"]').getByRole('combobox', { name: '筛选任务队列' })).toHaveCSS('height', height);
    const region = page.locator('[data-component="ai/agent-task"]');
    await region.scrollIntoViewIfNeeded();
    await region.screenshot({ path: '.logs/action-panel-' + theme + '-' + density + '.png' });
    await page.locator('[data-component="ai/message-actions"]').screenshot({ path: '.logs/message-actions-' + theme + '-' + density + '.png' });
    await actions.getByRole('button', { name: '标记示例完成' }).click();
    await expect(task.getByText('已完成', { exact: true })).toBeVisible();
    const message = page.locator('[data-component="ai/message-actions"]');
    await message.getByRole('button', { name: '有帮助', exact: true }).click();
    await expect(message.getByRole('button', { name: '有帮助', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(message.getByText('反馈已记录')).toBeVisible();
  });
}
