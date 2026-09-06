import { chromium } from '@playwright/test';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const option = name => { const i = process.argv.indexOf(name); return i < 0 ? undefined : process.argv[i + 1]; };
const baseUrl = option('--base-url') || process.env.STORYBOOK_URL || 'http://127.0.0.1:6006';
const reportPath = option('--output') || '.logs/storybook-audit.json';
const selected = option('--story-ids')?.split(',');
async function fingerprint() {
  const hash = createHash('sha256');
  async function visit(dir) { for (const entry of (await readdir(dir, { withFileTypes: true })).sort((a,b) => a.name.localeCompare(b.name))) { const path = join(dir,entry.name); if(entry.isDirectory()) await visit(path); else { hash.update(path); hash.update(await readFile(path)); } } }
  for(const dir of ['packages/tokens/src','packages/ui/src','apps/storybook/.storybook','apps/storybook/stories']) await visit(dir);
  return hash.digest('hex');
}
const fingerprintBefore = await fingerprint();
const startedAt = new Date().toISOString();
const index = await fetch(`${baseUrl}/index.json`).then(r => { if(!r.ok) throw new Error(`Storybook HTTP ${r.status}`); return r.json(); });
const stories = Object.values(index.entries).filter(x => x.type === 'story' && (!selected || selected.includes(x.id))).sort((a,b)=>a.id.localeCompare(b.id));
if(!stories.length) throw new Error('No stories found.');
const axeSource = await readFile(require.resolve('axe-core/axe.min.js'), 'utf8');
const browser = await chromium.launch({ headless: true, channel: process.env.REITO_BROWSER_CHANNEL || (process.platform === 'win32' ? 'msedge' : undefined) });
const results = [];
try {
  await Promise.all(['dark','light'].flatMap(theme => ['compact','comfortable'].map(async density => {
    const page = await browser.newPage({ viewport: { width: 1100, height: 850 } });
    try { for (const story of stories) {
      const result = { id: story.id, title: story.title, theme, density, pageErrors: [], consoleErrors: [] };
      const onError = error => result.pageErrors.push(error.message); page.on('pageerror',onError);
      const onConsole = message => { if(message.type() === 'error') result.consoleErrors.push(message.text()); }; page.on('console',onConsole);
      try {
        const url = new URL('/iframe.html',baseUrl); url.searchParams.set('id',story.id); url.searchParams.set('viewMode','story'); url.searchParams.set('globals',`theme:${theme};density:${density}`);
        await page.goto(url.href,{waitUntil:'domcontentloaded'});
        await page.waitForFunction(id => { const r = window.__STORYBOOK_PREVIEW__?.currentRender; return r?.id === id && ['finished','errored'].includes(r.phase); },story.id,{timeout:20000});
        await page.evaluate(async () => { await document.fonts.ready; await Promise.all(document.getAnimations().filter(a => Number.isFinite(a.effect?.getTiming().iterations ?? Infinity)).map(a=>a.finished.catch(()=>{}))); });
        Object.assign(result,await page.evaluate(()=>{const r=window.__STORYBOOK_PREVIEW__?.currentRender;return {phase:r?.phase,hasPlay:typeof r?.story?.playFunction==='function',rootTheme:document.documentElement.dataset.theme,rootDensity:document.documentElement.dataset.density,horizontalOverflow:document.documentElement.scrollWidth>innerWidth+1};}));
        await page.addScriptTag({content:axeSource});
        result.violations=await page.evaluate(async()=> (await window.axe.run(document.body,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,html:n.html,failureSummary:n.failureSummary}))})));
      } catch(error) { result.failure=error.message; }
      finally { page.off('pageerror',onError); page.off('console',onConsole); }
      result.passed=!result.failure && result.phase==='finished' && !result.pageErrors.length && !result.consoleErrors.length && !result.violations?.length && !result.horizontalOverflow && result.rootTheme===theme && result.rootDensity===density;
      results.push(result);
      if(results.length%40===0) console.log(`Audited ${results.length}/${stories.length*4} combinations`);
    } } finally { await page.close(); }
  })));
} finally { await browser.close(); }
const fingerprintAfter=await fingerprint();
const failed=results.filter(r=>!r.passed);
const summary={stories:stories.length,componentFamilies:new Set(stories.map(s=>s.title)).size,combinations:results.length,passed:results.length-failed.length,failed:failed.length,playStories:new Set(results.filter(r=>r.hasPlay).map(r=>r.id)).size,pageErrors:results.reduce((n,r)=>n+r.pageErrors.length,0),accessibilityViolations:results.reduce((n,r)=>n+(r.violations?.length||0),0),horizontalOverflow:results.filter(r=>r.horizontalOverflow).length};
await mkdir('.logs',{recursive:true});
await writeFile(reportPath,JSON.stringify({startedAt,completedAt:new Date().toISOString(),baseUrl,scope:'Settled story iframe body, including any open portals, automatic play functions, fonts and finite animations. WCAG 2A / 2AA / 2.1AA; no disabled rules.',disabledRules:[],fingerprintBefore,fingerprintAfter,sourceChangedDuringAudit:fingerprintBefore!==fingerprintAfter,summary,results},null,2)+'\n');
console.log(JSON.stringify(summary));
if(failed.length) console.log(JSON.stringify(failed.map(({id,theme,density,failure,pageErrors,consoleErrors,violations})=>({id,theme,density,failure,pageErrors,consoleErrors,violations})),null,2));
if(failed.length || fingerprintBefore!==fingerprintAfter) process.exitCode=1;
