import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
const catalog = JSON.parse(readFileSync('apps/lab/src/catalog-manifest.json', 'utf8'));
const axeSource=readFileSync('node_modules/axe-core/axe.min.js','utf8');
async function accessible(page: Page) {
  await page.evaluate(async()=>{await document.fonts.ready; await Promise.all(document.getAnimations().filter(a=>Number.isFinite(a.effect?.getTiming().iterations??Infinity)).map(a=>a.finished.catch(()=>{})));});
  await page.addScriptTag({content:axeSource});
  const violations=await page.evaluate(async()=> (await (window as any).axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.map((v:any)=>({id:v.id,targets:v.nodes.map((n:any)=>n.target)})));
  expect(violations).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
}

test('three layers expose the complete catalog and search reaches a working AI demo',async({page})=>{
  await page.goto('/');
  await expect(page.getByText(`${catalog.total} 个组件族`)).toBeVisible();
  await expect(page.locator('.lab-nav-item')).toHaveCount(catalog.counts.basic);
  await expect(page.getByRole('heading',{level:1,name:'Button',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'保存更改',exact:true}).click();
  await expect(page.getByText('已保存 1 次')).toBeVisible();
  await page.locator('.lab-layer-tabs').getByRole('button',{name:/复杂/}).click();
  await expect(page.locator('.lab-nav-item')).toHaveCount(catalog.counts.complex);
  await page.locator('.lab-layer-tabs').getByRole('button',{name:/AI/}).click();
  await expect(page.locator('.lab-nav-item')).toHaveCount(catalog.counts.ai);
  await page.getByRole('textbox',{name:'搜索组件'}).fill('权限');
  await expect(page.locator('.lab-nav-item')).toHaveCount(1);
  await page.locator('.lab-nav-item').click();
  await expect(page.getByRole('heading',{level:1,name:'PermissionRequest'})).toBeVisible();
  await expect(page).toHaveURL(/layer=ai&component=permission/);
  await page.reload();
  await expect(page.getByRole('heading',{level:1,name:'PermissionRequest'})).toBeVisible();
});

test('theme and density persist; shared controls change to 40px',async({page})=>{
  await page.goto('/?layer=basic&component=button');
  const control=page.getByRole('button',{name:'保存更改',exact:true});
  await expect(control).toHaveCSS('height','32px');
  await page.getByRole('button',{name:'切换组件密度'}).click();
  await expect(control).toHaveCSS('height','40px');
  await page.getByRole('button',{name:'切换明暗主题'}).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme','light');
  await page.reload();
  await expect(control).toHaveCSS('height','40px');
  await expect(page.locator('html')).toHaveAttribute('data-theme','light');
  expect(await page.evaluate(()=>document.fonts.check('14px "Inter Variable"'))).toBe(true);
});

test('review dialog saves local notes and confirmation then restores focus',async({page})=>{
  await page.goto('/');
  await page.getByRole('button',{name:'确认样式',exact:true}).click();
  const dialog=page.getByRole('dialog',{name:'确认 Button 的样式'});
  await dialog.getByLabel('修改意见').fill('按钮密度已检查');
  await dialog.getByRole('button',{name:'确认此组件'}).click();
  await expect(dialog).toBeHidden();
  const opener=page.getByRole('button',{name:'已确认',exact:true});
  await expect(opener).toBeFocused();
  await page.reload(); await opener.click();
  await expect(dialog.getByLabel('修改意见')).toHaveValue('按钮密度已检查');
  await page.keyboard.press('Escape'); await expect(opener).toBeFocused();
});

test('Base UI render composition retains the shared button density',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('reito-density','comfortable'));
  await page.goto('/?layer=basic&component=dialog');
  const trigger=page.getByRole('button',{name:'编辑项目',exact:true});
  await expect(trigger).toHaveAttribute('data-rui-button','');
  await expect(trigger).toHaveCSS('height','40px');
  await trigger.click();await expect(page.getByRole('dialog',{name:'编辑项目'})).toBeVisible();
  await expect(page.getByRole('button',{name:'确认保存',exact:true})).toHaveCSS('height','40px');
});

for(const theme of ['dark','light']) for(const density of ['compact','comfortable']) {
  test(`${theme}/${density}: explorer and portaled dialog share tokens and pass axe`,async({page})=>{
    await page.addInitScript(({theme,density})=>{localStorage.setItem('reito-theme',theme);localStorage.setItem('reito-density',density);},{theme,density});
    await page.goto('/?layer=basic&component=button');
    await accessible(page);
    const opener=page.getByRole('button',{name:'确认样式',exact:true}); await opener.click();
    const dialog=page.getByRole('dialog'); await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button',{name:'确认此组件'})).toHaveCSS('height',density==='compact'?'32px':'40px');
    await expect(dialog).toHaveCSS('font-family',/Inter Variable/);
    const expected=await page.locator('html').evaluate(e=>getComputedStyle(e).getPropertyValue('--rui-elevated').trim());
    expect(await dialog.evaluate(e=>getComputedStyle(e).getPropertyValue('--rui-elevated').trim())).toBe(expected);
    await page.keyboard.press('Tab'); expect(await dialog.evaluate(e=>e.contains(document.activeElement))).toBe(true);
    await page.keyboard.press('Shift+Tab'); expect(await dialog.evaluate(e=>e.contains(document.activeElement))).toBe(true);
    await accessible(page); await page.keyboard.press('Escape'); await expect(opener).toBeFocused();
  });
}

for(const viewport of [{width:1280,height:800},{width:960,height:720},{width:640,height:400},{width:390,height:844}]) {
  test(`responsive ${viewport.width}x${viewport.height}: every layer remains reachable`,async({page})=>{
    await page.setViewportSize(viewport);await page.goto('/');
    for(const name of ['基础','复杂','AI']) {
      await page.locator('.lab-layer-tabs').getByRole('button',{name:new RegExp(name)}).click();
      await expect(page.getByTestId('component-preview')).toBeVisible();
      await accessible(page);
    }
    if(viewport.width<=640) { await page.getByRole('button',{name:'显示组件目录'}).click(); await expect(page.getByRole('textbox',{name:'搜索组件'})).toBeVisible(); }
  });
}
