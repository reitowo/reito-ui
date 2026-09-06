import { chromium } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';

// The consumer URL must serve an independent tarball installation, without Tailwind plugins.
const consumer = process.env.REITO_CONSUMER_URL || 'http://127.0.0.1:5174/';
const browser = await chromium.launch({headless:true,channel:process.env.REITO_BROWSER_CHANNEL || (process.platform==='win32'?'msedge':undefined)});
const measurements=[];
const fields=['fontFamily','fontSize','fontWeight','lineHeight','height','borderRadius','color','backgroundColor'];
const catalog=JSON.parse(await readFile('apps/lab/src/catalog-manifest.json','utf8'));
const version=JSON.parse(await readFile('package.json','utf8')).version;
const storyUrl=(layer,id,theme,density)=>`http://127.0.0.1:6006/iframe.html?id=${encodeURIComponent(catalog.entries.find(e=>e.layer===layer&&e.id===id).storyId)}&viewMode=story&globals=theme:${theme};density:${density}`;
const densityMeasurements=[];
try {
  for(const theme of ['dark','light']) for(const density of ['compact','comfortable']) {
    const targets=[
      {host:'lab',url:'http://127.0.0.1:5173/?layer=basic&component=button',selector:'.lab-demo [data-rui-button][data-size="default"][data-variant="default"]'},
      {host:'storybook',url:`http://127.0.0.1:6006/iframe.html?id=基础-button--overview&viewMode=story&globals=theme:${theme};density:${density}`,selector:'[data-rui-button][data-size="default"][data-variant="default"]'},
      {host:'tarball',url:`${consumer}?theme=${theme}&density=${density}`,selector:'[data-testid="control-default"]'},
    ];
    const row={theme,density,hosts:{}};
    for(const target of targets) {
      const page=await browser.newPage({viewport:{width:1440,height:1000}});
      await page.addInitScript(({theme,density})=>{localStorage.setItem('reito-theme',theme);localStorage.setItem('reito-density',density);},{theme,density});
      await page.goto(target.url,{waitUntil:'domcontentloaded'});
      const button=page.locator(target.selector).first();await button.waitFor({state:'visible'});
      await page.waitForFunction(({theme,density})=>document.documentElement.dataset.theme===theme&&document.documentElement.dataset.density===density,{theme,density});
      await page.evaluate(async()=>{await document.fonts.ready;await Promise.all(document.getAnimations().filter(a=>Number.isFinite(a.effect?.getTiming().iterations??Infinity)).map(a=>a.finished.catch(()=>{})));});
      row.hosts[target.host]=await button.evaluate((element,fields)=>Object.fromEntries(fields.map(field=>[field,getComputedStyle(element)[field]])),fields);
      await page.close();
    }
    row.passed=Object.values(row.hosts).every(value=>JSON.stringify(value)===JSON.stringify(row.hosts.lab));measurements.push(row);
    for(const component of ['data-table','artifact-code']) {
      const hosts={};
      const targets=component==='data-table' ? [
        {host:'lab',url:'http://127.0.0.1:5173/?layer=complex&component=data-table',selector:'.lab-demo tbody td'},
        {host:'storybook',url:storyUrl('complex','data-table',theme,density),selector:'#storybook-root tbody td'},
        {host:'tarball',url:`${consumer}?theme=${theme}&density=${density}`,selector:'[data-testid="consumer-data-table"] tbody td'},
      ] : [
        {host:'lab',url:'http://127.0.0.1:5173/?layer=ai&component=artifact',selector:'.lab-demo [role="tabpanel"] pre'},
        {host:'storybook',url:storyUrl('ai','artifact',theme,density),selector:'#storybook-root [role="tabpanel"] pre'},
        {host:'tarball',url:`${consumer}?theme=${theme}&density=${density}`,selector:'[data-testid="consumer-artifact"] [role="tabpanel"] pre'},
      ];
      for(const target of targets) {
        const page=await browser.newPage({viewport:{width:1440,height:1000}});
        await page.addInitScript(({theme,density})=>{localStorage.setItem('reito-theme',theme);localStorage.setItem('reito-density',density);},{theme,density});
        await page.goto(target.url,{waitUntil:'domcontentloaded'});
        if(target.host==='storybook') await page.waitForFunction(()=>window.__STORYBOOK_PREVIEW__?.currentRender?.phase==='finished');
        if(component==='artifact-code') await page.getByRole('tab',{name:'代码',exact:true}).click();
        const element=page.locator(target.selector).first();await element.waitFor({state:'visible'});
        await page.evaluate(async()=>{await document.fonts.ready;await Promise.all(document.getAnimations().filter(a=>Number.isFinite(a.effect?.getTiming().iterations??Infinity)).map(a=>a.finished.catch(()=>{})));});
        hosts[target.host]=await element.evaluate(e=>{const s=getComputedStyle(e);return {paddingTop:s.paddingTop,paddingRight:s.paddingRight,paddingBottom:s.paddingBottom,paddingLeft:s.paddingLeft,fontSize:s.fontSize,lineHeight:s.lineHeight,...(e.tagName==='PRE'?{parentPadding:getComputedStyle(e.closest('[role="tabpanel"]')).padding}:{})};});
        await page.close();
      }
      densityMeasurements.push({theme,density,component,hosts,passed:Object.values(hosts).every(value=>JSON.stringify(value)===JSON.stringify(hosts.lab))});
    }
  }
} finally {await browser.close();}
const passed=[...measurements,...densityMeasurements].every(x=>x.passed);
await writeFile(`.logs/host-contract-v${version.replaceAll('.','')}.json`,JSON.stringify({version,checkedAt:new Date().toISOString(),fields,scope:'Identical default Button props plus DataTable cells and embedded Artifact code in Lab, Storybook and independent tarball consumer; content width intentionally excluded.',passed,measurements,densityMeasurements},null,2)+'\n');
console.log(JSON.stringify({passed,buttonContracts:measurements.length,contentContracts:densityMeasurements.length,failures:[...measurements,...densityMeasurements].filter(x=>!x.passed)}));
if(!passed)process.exitCode=1;
