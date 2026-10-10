import { chooseThemeMode, chooseThemePalette } from './theme-menu';
import { test, expect, type Page } from '@playwright/test';
import { themeTokens } from '@reito/tokens/themes';
test.beforeEach(async ({page}) => { await page.addInitScript(() => { if (!sessionStorage.getItem('theme-test-ready')) { localStorage.removeItem('reito-colors'); sessionStorage.setItem('theme-test-ready','1'); } }); });
async function choose(page:Page,label:string,value:string) {
  await page.getByRole('combobox',{name:label,exact:true}).click();
  await page.getByRole('option',{name:value,exact:true}).click();
}
const rgb=(s:string)=>s.match(/[\d.]+/g)!.slice(0,3).map(Number);
function contrast(a:string,b:string) {
 const lum=(s:string)=>rgb(s).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
 const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
}
for(const scheme of ['dark','light']) test('theme guide reacts to global and local colors without losing form state: '+scheme,async({page})=>{
 await page.addInitScript(s=>localStorage.setItem('reito-theme',s),scheme);
 await page.goto('/?view=theme-guide');
 const preview=page.getByLabel('主题效果预览');
 const save=preview.getByRole('button',{name:'保存工作区',exact:true});
 const local=page.getByRole('button',{name:'单独配色的操作',exact:true});
 const color=(node:any)=>node.evaluate((n:Element)=>getComputedStyle(n).backgroundColor);
 const before=await color(save),localBefore=await color(local);
 expect(before).not.toBe(localBefore);
 await page.getByRole('textbox',{name:'工作区名称',exact:true}).fill('保留这个草稿');
 await page.getByRole('switch',{name:'任务完成提醒'}).uncheck();
 await choose(page,'主题主色','蓝色');
 await expect.poll(() => color(save)).not.toBe(before);expect(await color(local)).toBe(localBefore);
 await expect(page.getByRole('textbox',{name:'工作区名称',exact:true})).toHaveValue('保留这个草稿');
 await expect(page.getByRole('switch',{name:'任务完成提醒'})).not.toBeChecked();
 const base=await color(preview);
 await choose(page,'底色色系','Stone');
 await expect.poll(() => color(preview)).not.toBe(base);
 await choose(page,'组件颜色','琥珀');
 await expect.poll(() => color(local)).not.toBe(localBefore);
 await choose(page,'呈现样式','描边');
 await expect(local).toHaveCSS('background-color','rgba(0, 0, 0, 0)');
 const style=await local.evaluate(n=>({fg:getComputedStyle(n).color,bg:getComputedStyle(n.closest('[data-rui-theme]')!).backgroundColor}));
 expect(contrast(style.fg,style.bg)).toBeGreaterThanOrEqual(4.5);
 await save.click();await expect(preview.getByRole('status')).toHaveText('已保存在当前示例中。');
 await page.screenshot({path:'.logs/theme-guide-'+scheme+'.png',fullPage:true});
});
test('runtime palette combinations keep readable solid and soft text',async({page})=>{
 test.setTimeout(180_000);await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/?view=theme-guide');
 const preview=page.getByLabel('主题效果预览');
 for(const mode of ['深色','浅色']) {
  await choose(page,'明暗模式',mode);
  for(const neutral of ['Graphite 中性灰','Gray','Zinc','Slate','Stone','Neutral']) {
   await choose(page,'底色色系',neutral);
   for(const primary of ['灰白','蓝色','绿色','紫色','琥珀']) {
    await choose(page,'主题主色',primary);
    const pairs=await preview.evaluate(n=>{
      const button=n.querySelector('[data-slot=button]')!,badge=n.querySelector('[data-slot=badge]')!;
      const p=(x:Element)=>({fg:getComputedStyle(x).color,bg:getComputedStyle(x).backgroundColor});
      return [p(button),p(badge),{fg:getComputedStyle(n).color,bg:getComputedStyle(n).backgroundColor}];
    });
    await preview.getByRole('button',{name:'保存工作区',exact:true}).hover();
    pairs.push(await preview.getByRole('button',{name:'保存工作区',exact:true}).evaluate(n=>({fg:getComputedStyle(n).color,bg:getComputedStyle(n).backgroundColor})));
    for(const pair of pairs) expect(contrast(pair.fg,pair.bg),mode+'/'+neutral+'/'+primary).toBeGreaterThanOrEqual(4.5);
   }
  }
 }
});
test('guide fits a narrow screen and preserves keyboard selection',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/?view=theme-guide');
 const select=page.getByRole('combobox',{name:'主题主色',exact:true});
 await select.focus();await select.press('ArrowDown');await expect(page.getByRole('option',{name:'紫色',exact:true})).toHaveAttribute('data-highlighted','');
 await page.keyboard.press('ArrowUp');await page.keyboard.press('Enter');await expect(select).toContainText('绿色');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:'.logs/theme-guide-narrow.png',fullPage:true});
});

test('all named palettes have complete scales and readable color recipes', () => {
 const asRgb=(hex:string)=>'rgb('+[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)).join(',')+')';
 for(const [family,scale] of Object.entries(themeTokens.scales)) expect(Object.keys(scale),family).toEqual(['50','100','200','300','400','500','600','700','800','900','950']);
 for(const [family,modes] of Object.entries(themeTokens.colors)) for(const [mode,c] of Object.entries(modes)) {
  expect(contrast(asRgb(c.solid),asRgb(c['on-solid'])),family+'/'+mode+'/solid').toBeGreaterThanOrEqual(4.5);
  expect(contrast(asRgb(c.hover),asRgb(c['on-solid'])),family+'/'+mode+'/hover').toBeGreaterThanOrEqual(4.5);
  expect(contrast(asRgb(c.text),asRgb(c.soft)),family+'/'+mode+'/soft').toBeGreaterThanOrEqual(4.5);
 }
 for(const [family,modes] of Object.entries(themeTokens.neutrals)) for(const [mode,c] of Object.entries(modes)) for(const fg of ['text','text-secondary','text-muted']) for(const bg of ['bg','surface','elevated','hover','active'])
  expect(contrast(asRgb(c[fg]),asRgb(c[bg])),family+'/'+mode+'/'+fg+'/'+bg).toBeGreaterThanOrEqual(4.5);
});

test('nested light theme enters a portal and restores keyboard focus',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/?view=theme-guide');
 const trigger=page.getByRole('button',{name:'查看局部主题弹窗',exact:true});
 const outer=page.getByLabel('主题效果预览');
 const nested=page.getByLabel('局部浅色主题');
 await expect(nested).toHaveCSS('color','rgb(12, 10, 9)');
 const before=await outer.getByRole('button',{name:'保存工作区',exact:true}).evaluate(n=>getComputedStyle(n).backgroundColor);
 await trigger.focus();await trigger.press('Enter');
 const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();
 await expect(dialog.locator('[data-slot=dialog-footer]')).toHaveCSS('padding-top','12px');
 await expect(dialog.locator('[data-slot=dialog-footer]')).toHaveCSS('padding-bottom','12px');
 await expect(dialog.locator('[data-slot=dialog-footer]')).toHaveCSS('padding-left','16px');
 expect(await dialog.evaluate(n=>n.closest('[data-rui-theme="portal"]')?.getAttribute('data-theme'))).toBe('light');
 const colors=await dialog.getByRole('button',{name:'局部主题操作',exact:true}).evaluate(n=>({bg:getComputedStyle(n).backgroundColor,fg:getComputedStyle(n).color}));
 expect(contrast(colors.fg,colors.bg)).toBeGreaterThanOrEqual(4.5);expect(colors.bg).not.toBe(before);
 await expect(dialog.getByRole('button',{name:'独立绿色操作',exact:true})).toHaveCSS('background-color','rgba(0, 0, 0, 0)');
 await page.screenshot({path:'.logs/theme-runtime-portal.png'});
 await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();await expect(trigger).toBeFocused();
});

test('system mode tracks changes and selected palettes persist into the full atlas',async({page})=>{
 await page.emulateMedia({colorScheme:'dark',reducedMotion:'reduce'});await page.goto('/?view=theme-guide');
 await choose(page,'明暗模式','跟随系统');await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await page.getByRole('textbox',{name:'工作区名称',exact:true}).fill('系统切换不丢草稿');
 await page.emulateMedia({colorScheme:'light'});await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 await expect(page.getByRole('textbox',{name:'工作区名称',exact:true})).toHaveValue('系统切换不丢草稿');
 await chooseThemeMode(page,'dark');await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await chooseThemeMode(page,'light');await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 await choose(page,'明暗模式','跟随系统');
 await choose(page,'主题主色','蓝色');await choose(page,'底色色系','Zinc');
 const before=await page.getByLabel('主题效果预览').getByRole('button',{name:'保存工作区',exact:true}).evaluate(n=>getComputedStyle(n).backgroundColor);
 await page.getByRole('link',{name:'组件总览',exact:true}).click();await expect(page.getByRole('heading',{name:'全组件总览',exact:true})).toBeVisible({timeout:30_000});
 // The atlas shares palette preferences; choose its existing light-mode control if needed.
 if(await page.locator('html').getAttribute('data-theme')!=='light') await chooseThemeMode(page,'light');
 await expect(page.getByRole('button',{name:'主要操作',exact:true})).toHaveCSS('background-color',before);
 await expect(page.locator('iframe')).toHaveCount(0);
});

test('public component colors preserve shared geometry and disabled states in Storybook',async({page})=>{
 test.setTimeout(90_000);
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 for(const mode of ['dark','light']) for(const density of ['compact','comfortable']) {
  await page.goto((process.env.REITO_STORYBOOK_URL || 'http://127.0.0.1:6007') + '/iframe.html?id=基础-theme--'+(mode==='dark'?'playground':'light')+'&viewMode=story&globals=theme:'+mode+';density:'+density);
  const primary=page.getByRole('button',{name:'主题主色',exact:true});
  await expect(primary).toBeVisible({timeout:30_000});
  for(const label of ['主题主色','独立绿色','柔和琥珀','禁用操作','处理中']) {
   await expect(page.getByRole('button',{name:label,exact:true})).toHaveCSS('height',density==='compact'?'28px':'36px');
   await expect(page.getByRole('button',{name:label,exact:true})).toHaveCSS('border-radius','6px');
  }
  await expect(page.getByRole('button',{name:'禁用操作',exact:true})).toBeDisabled();
  await expect(page.getByRole('button',{name:'处理中',exact:true})).toHaveAttribute('aria-busy','true');
  const styles=await page.locator('[data-slot="checkbox"]').evaluate(n=>({bg:getComputedStyle(n).backgroundColor,fg:getComputedStyle(n).color}));
  expect(contrast(styles.fg,styles.bg)).toBeGreaterThanOrEqual(4.5);
  const primaryColor=await primary.evaluate(n=>getComputedStyle(n).backgroundColor);
  await page.getByRole('button',{name:'打开同主题弹窗',exact:true}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('button',{name:'弹层主操作',exact:true})).toHaveCSS('background-color',primaryColor);
  await page.keyboard.press('Escape');
 }
 expect(errors).toEqual([]);
});

test('atlas color controls update live without remounting component state',async({page})=>{
 await page.goto('/?view=overview');
 const save=page.locator('[data-component="basic/button"]').getByRole('button',{name:'保存更改',exact:true});
 await save.click();await expect(page.getByText('已保存 1 次',{exact:true})).toBeVisible();
 const before=await save.evaluate(n=>({bg:getComputedStyle(n).backgroundColor,h:n.getBoundingClientRect().height,r:getComputedStyle(n).borderRadius}));
 await chooseThemePalette(page,'primary','violet');await chooseThemePalette(page,'neutral','zinc');
 expect(await save.evaluate(n=>getComputedStyle(n).backgroundColor)).not.toBe(before.bg);
 await expect(page.getByText('已保存 1 次',{exact:true})).toBeVisible();
 const after=await save.evaluate(n=>({h:n.getBoundingClientRect().height,r:getComputedStyle(n).borderRadius}));
 expect(after).toEqual({h:before.h,r:before.r});
});

test('theme menu supports keyboard submenus, mode selection and reset on a narrow viewport',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/?view=theme-guide');
 const trigger=page.getByRole('button',{name:'主题',exact:true});await trigger.focus();await trigger.press('Enter');
 const primary=page.getByRole('menuitem',{name:/^主色 /});await expect(primary).toBeFocused();await primary.press('ArrowRight');
 const blue=page.getByRole('menuitemradio',{name:'Blue',exact:true});await expect(blue).toBeVisible();
 const bounds=await page.locator('[data-slot=dropdown-menu-sub-content]').evaluate(n=>({left:n.getBoundingClientRect().left,right:n.getBoundingClientRect().right}));
 expect(bounds.left).toBeGreaterThanOrEqual(0);expect(bounds.right).toBeLessThanOrEqual(390);
 await blue.click();await expect(blue).toHaveAttribute('aria-checked','true');
 await page.keyboard.press('Escape');await page.keyboard.press('Escape');await expect(trigger).toBeFocused();
 await expect(page.getByRole('combobox',{name:'主题主色',exact:true})).toContainText('蓝色');
 await chooseThemeMode(page,'system');
 await trigger.click();await expect(page.getByRole('menuitemradio',{name:'跟随系统',exact:true})).toHaveAttribute('aria-checked','true');
 await page.getByRole('menuitem',{name:'恢复默认主题',exact:true}).click();
 await expect(page.getByRole('combobox',{name:'主题主色',exact:true})).toContainText('灰白');
 await expect(page.getByRole('combobox',{name:'底色色系',exact:true})).toContainText('Graphite');
 await expect(page.getByRole('combobox',{name:'明暗模式',exact:true})).toContainText('深色');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
