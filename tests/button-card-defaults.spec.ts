import { test, expect } from '@playwright/test';

for (const theme of ['dark', 'light']) for (const density of ['compact', 'comfortable']) {
  test('compact button defaults and Card region spacing: ' + theme + '/' + density, async ({ page }) => {
    await page.addInitScript(({ theme, density }) => {
      localStorage.setItem('reito-theme', theme); localStorage.setItem('reito-density', density);
    }, { theme, density });
    await page.goto('/?layer=basic&component=button');
    const height = density === 'compact' ? '28px' : '32px';
    const save = page.getByRole('button', { name: '保存更改', exact: true });
    await expect(save).toBeVisible({ timeout: 15_000 });
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--rui-motion-duration').trim())).toBe('150ms');
    const rest = await save.evaluate((el) => {
      const probe = document.createElement('div');
      probe.style.backgroundColor = 'var(--rui-primary)';
      document.body.append(probe);
      const primary = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return { button: getComputedStyle(el).backgroundColor, primary, duration: getComputedStyle(el).transitionDuration };
    });
    expect(rest.button).toBe(rest.primary);
    expect(rest.duration === '150ms' || rest.duration === '0.15s').toBe(true);
    await save.hover();
    const hover = await page.evaluate(() => {
      const probe = document.createElement('div');
      probe.style.backgroundColor = 'var(--rui-primary-hover)';
      document.body.append(probe);
      const value = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return value;
    });
    await expect.poll(() => save.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(hover);
    for (const name of ['保存更改', '强调操作', '次要操作', '描边按钮', '轻量操作', '不可用', 'Default']) {
      const button = page.getByRole('button', { name, exact: true });
      await expect(button).toHaveCSS('height', height);
      await expect(button).toHaveCSS('font-size', '14px');
      await expect(button).toHaveCSS('border-radius', '6px');
    }
    await expect(page.locator('[data-slot="button"][aria-busy="true"]')).toHaveCSS('height', height);
    const icon = page.getByRole('button', { name: '添加项目', exact: true });
    await expect(icon).toHaveCSS('height', height);
    await expect(icon).toHaveCSS('width', height);
    await expect(page.getByRole('button', { name: 'Small', exact: true })).toHaveCSS('height', density === 'compact' ? '28px' : '32px');
    await expect(page.getByRole('button', { name: 'Medium', exact: true })).toHaveCSS('height', density === 'compact' ? '32px' : '36px');
    await expect(page.getByRole('button', { name: 'Large', exact: true })).toHaveCSS('height', density === 'compact' ? '36px' : '40px');
    await save.click();
    await expect(page.getByText('已保存 1 次')).toBeVisible();
    await page.goto('/?layer=basic&component=card');
    const card = page.locator('[data-slot="card"]');
    await expect(card).toBeVisible();
    const header = card.locator('[data-slot="card-header"]');
    const body = card.locator('[data-slot="card-content"]');
    const footer = card.locator('[data-slot="card-footer"]');
    const gap = '0px';
    const x = density === 'compact' ? '16px' : '20px';
    const y = density === 'compact' ? '12px' : '16px';
    const textGap = density === 'compact' ? 8 : 10;
    await expect(card).toHaveCSS('row-gap', gap);
    for (const slot of [header, body, footer]) await expect(slot).toHaveCSS('padding-left', x);
    const geometry = () => card.evaluate(node => {
      const header = node.querySelector('[data-slot="card-header"]')!.getBoundingClientRect();
      const body = node.querySelector('[data-slot="card-content"]')!.getBoundingClientRect();
      const footer = node.querySelector('[data-slot="card-footer"]')!.getBoundingClientRect();
      const description = node.querySelector('[data-slot=card-description]')!.getBoundingClientRect();
      const text = node.querySelector('[data-slot=card-content] > p')!.getBoundingClientRect();
      return { headerToBody: body.top - header.bottom, bodyToFooter: footer.top - body.bottom, descriptionToText: text.top-description.bottom, contentBottom: footer.top-text.bottom };
    });
    await expect.poll(geometry).toEqual({ headerToBody: 0, bodyToFooter: 0, descriptionToText: textGap, contentBottom: parseFloat(y) });
    await expect(footer.getByRole('button', { name: '打开工作区' })).toHaveCSS('height', height);
    await expect(footer).toHaveCSS('padding-top', y);
    await expect(footer).toHaveCSS('padding-bottom', y);
    await card.screenshot({ path: '.logs/card-spacing-fixed-' + theme + '-' + density + '.png' });
    await page.evaluate(() => document.documentElement.style.setProperty('--rui-card-text-gap', '10px'));
    await expect.poll(geometry).toEqual({ headerToBody: 0, bodyToFooter: 0, descriptionToText: 10, contentBottom: parseFloat(y) });
    await page.goto('/?view=overview#component-ai-agent-task');
    const task = page.locator('[data-slot="agent-task-card"]');
    await expect(task).toBeVisible({ timeout: 30_000 });
    for (const slot of ['card-header','card-content','agent-task-actions']) {
      const region = task.locator('[data-slot="' + slot + '"]');
      await expect(region).toHaveCSS('padding-left', x);
      await expect(region).toHaveCSS('padding-right', x);
      await expect(region).toHaveCSS('padding-top', y);
      await expect(region).toHaveCSS('padding-bottom', y);
      const edges = await region.evaluate(n=>({width:n.getBoundingClientRect().width,parentWidth:n.parentElement!.getBoundingClientRect().width}));
      expect(edges.width).toBe(edges.parentWidth);
    }
    await task.screenshot({path:'.logs/task-card-regions-' + theme + '-' + density + '.png'});
    const taskHeight = await task.evaluate(n=>n.getBoundingClientRect().height);
    await task.getByRole('button',{name:'标记示例完成'}).click();
    await expect(task.getByText('已完成',{exact:true})).toBeVisible();
    expect(await task.evaluate(n=>n.getBoundingClientRect().height)).toBe(taskHeight);
    await task.getByRole('button',{name:'重置示例',exact:true}).click();
    expect(await task.evaluate(n=>n.getBoundingClientRect().height)).toBe(taskHeight);
    await page.goto('/?layer=ai&component=tool-call');
    const tool = page.locator('[data-slot="tool-call"]').filter({has:page.getByRole('button',{name:/检查组件示例/})});
    for (const slot of ['tool-call-header','tool-call-content','tool-call-actions']) {
      const region = tool.locator('[data-slot="' + slot + '"]');
      await expect(region).toHaveCSS('padding-left', x);
      await expect(region).toHaveCSS('padding-top', y);
      await expect(region).toHaveCSS('padding-bottom', y);
    }
    const toolEdges = await tool.evaluate(n=>{
      const content=n.querySelector('[data-slot=tool-call-content]')!.getBoundingClientRect();
      const actions=n.querySelector('[data-slot=tool-call-actions]')!.getBoundingClientRect();
      const button=n.querySelector('[data-slot=tool-call-actions] button')!.getBoundingClientRect();
      return {gap:actions.top-content.bottom,buttonBelowContent:button.top>=content.bottom};
    });
    expect(toolEdges.gap).toBe(0);
    expect(toolEdges.buttonBelowContent).toBe(true);
    await tool.screenshot({path:'.logs/tool-call-regions-' + theme + '-' + density + '.png'});
    await tool.getByRole('button',{name:'重试此步骤'}).click();
    await expect(tool.getByText('正在播放本地状态变化…',{exact:true})).toBeVisible();
    await expect(tool.getByText('本地状态示例已完成，没有执行命令。',{exact:true})).toBeVisible();
    await tool.getByRole('button',{name:/检查组件示例/}).click();
    await expect(tool.locator('[data-slot=tool-call-body]')).toBeHidden();
    await tool.getByRole('button',{name:/检查组件示例/}).click();
    await expect(tool.locator('[data-slot=tool-call-content]')).toBeVisible();


  });
}
