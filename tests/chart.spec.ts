import {test,expect} from '@playwright/test';
import {validateChartData} from '../packages/ui/src/complex/chart-model.js';
test.use({ actionTimeout: 15000 });
test.beforeEach(async({page})=>{
 page.on('pageerror',error=>{throw error;});
});
const open=async(page:import('@playwright/test').Page,story='playground')=>page.goto(`http://127.0.0.1:6007/iframe.html?id=复杂-chart-图表--${story}&viewMode=story`);
test('Controls change chart type on the same page',async({page})=>{
 await page.goto('http://127.0.0.1:6007/?path=/story/复杂-chart-图表--playground');
 const frame=page.frameLocator('#storybook-preview-iframe');
 await expect(frame.locator('.recharts-line')).toHaveCount(2,{timeout:20000});
 await page.getByRole('tab',{name:/^Controls/}).click();
 await page.locator('#control-kind').selectOption({label:'donut'});
 await expect(frame.locator('.recharts-pie')).toHaveCount(1);
 await frame.getByText('查看数据表',{exact:true}).click();
 await expect(frame.getByRole('columnheader')).toHaveCount(2);
 expect(new URL(page.url()).searchParams.get('path')).toBe('/story/复杂-chart-图表--playground');
});
for(const theme of ['dark','light']) for(const density of ['compact','comfortable']) test(`${theme}/${density}: narrow chart and table`,async({page})=>{
 await page.setViewportSize({width:390,height:850});
 await page.goto(`http://127.0.0.1:6007/iframe.html?id=复杂-chart-图表--playground&viewMode=story&globals=theme:${theme};density:${density}`);
 await expect(page.locator('.recharts-surface')).toBeVisible({timeout:20000});
 await page.getByText('查看数据表',{exact:true}).click();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:`.logs/chart/${theme}-${density}.png`,fullPage:true});
});
for(const story of ['playground','bar','area','pie','donut']) test(`${story} renders chart and equivalent table`,async({page})=>{
 await open(page,story);
 await expect(page.locator('.recharts-surface')).toBeVisible();
 await page.getByText('查看数据表',{exact:true}).click();
 const table=page.getByRole('table',{name:'本地任务统计数据'});
 await expect(table).toBeVisible();
 await expect(table.getByRole('row')).toHaveCount(5);
 await expect(table.getByText('24',{exact:true})).toBeVisible();
});
test('legend toggles series while the original data remains available',async({page})=>{
 await open(page);
 const legend=page.getByRole('button',{name:'已完成',exact:true});
 await legend.click(); await expect(legend).toHaveAttribute('aria-pressed','false');
 await page.getByText('查看数据表',{exact:true}).click();
 await expect(page.getByRole('table').getByText('缺失',{exact:true})).toBeVisible();
 await legend.click(); await expect(legend).toHaveAttribute('aria-pressed','true');
});
test('keyboard data navigation exposes tooltip',async({page})=>{
 await open(page);
 const chart=page.locator('.recharts-surface');
 await chart.focus(); await chart.press('ArrowRight');
 await expect(page.getByRole('status')).toContainText('已完成');
});
test('invalid polar data is rejected explicitly',async({page})=>{
 await open(page,'invalid-data');
 await expect(page.getByRole('alert')).toHaveText('饼图和环形图不接受负数');
 await expect(page.locator('.recharts-surface')).toHaveCount(0);
});
test('host retry restores chart after an error',async({page})=>{
 await open(page,'retry');
 await expect(page.getByRole('alert')).toHaveText('本地数据请求失败');
 await page.getByRole('button',{name:'重试',exact:true}).click();
 await expect(page.getByRole('alert')).toHaveCount(0);
 await expect(page.locator('.recharts-surface')).toBeVisible();
});
test('invalid numbers and duplicate identities are rejected while null remains missing',()=>{
 const series=[{key:'v',label:'值'}];
 expect(validateChartData([{id:'a',label:'A',values:{v:null}}],series,'line')).toBeUndefined();
 expect(validateChartData([{id:'a',label:'A',values:{v:Infinity}}],series,'line')).toContain('有限数值');
 expect(validateChartData([{id:'a',label:'A',values:{v:0}}],series,'donut')).toContain('大于零');
 expect(validateChartData([{id:'a',label:'A',values:{v:1}},{id:'a',label:'B',values:{v:2}}],series,'line')).toContain('唯一');
});
test('long category names stay discoverable in the table',async({page})=>{
 await page.setViewportSize({width:390,height:850});
 await open(page,'long-labels');
 await expect(page.locator('.recharts-xAxis .recharts-cartesian-axis-tick')).toHaveCount(2);
 await page.getByText('查看数据表',{exact:true}).click();
 await expect(page.getByRole('rowheader',{name:'桌面工作区组件一致性检查'})).toBeVisible();
});
