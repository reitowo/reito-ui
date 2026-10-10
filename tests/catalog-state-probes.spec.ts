import { test, expect } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
const manifest = JSON.parse(readFileSync('apps/lab/src/catalog-manifest.json','utf8'));
const stable = new Set(['button','button-group','rating','listbox','checkbox','switch','radio-group','slider','toggle','toggle-group','meter','knob','number-field','one-time-code','message-actions','permission','card','token-usage']);
test('every catalog family gets a default state probe and geometry record', async ({ page }) => {
  test.setTimeout(240_000);
  await page.addInitScript(() => {
    localStorage.setItem('reito-theme','dark');localStorage.setItem('reito-density','compact');
    Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>undefined}});
  });
  await page.goto('/?view=overview');
  await expect(page.locator('[data-preview]')).toHaveCount(manifest.total);
  await page.evaluate(() => document.fonts.ready);
  const results: any[] = [];
  for (const entry of manifest.entries) {
    const id = entry.layer + '/' + entry.id;
    const tile = page.locator('[data-component="' + id + '"]');
    const preview = tile.locator('.atlas-inline-preview');
    const candidates = preview.locator('button, [role="checkbox"], [role="switch"], [role="radio"], [role="slider"], summary, input:not([type="file"]):not([type="hidden"]), textarea');
    let actor: any;
    let label = '';
    for (const node of await candidates.all()) {
      if (!await node.isVisible() || !await node.isEnabled()) continue;
      const meta = await node.evaluate(n => ({ label:n.getAttribute('aria-label') || n.textContent?.trim() || '', skip:n.matches('.sr-only,[aria-hidden="true"]') || n.hasAttribute('readonly') }));
      if (meta.skip || /上传|添加文件|下载|导出|全屏|新窗口|外部|认证/.test(meta.label)) continue;
      actor = node;label = meta.label;break;
    }
    const before = await preview.evaluate(n => ({ height:n.getBoundingClientRect().height, width:n.getBoundingClientRect().width }));
    if (!actor) { results.push({id,kind:'source/static-or-special-input',before});continue; }
    await actor.scrollIntoViewIfNeeded();
    const target = await actor.elementHandle();
    const targetBefore = await target.boundingBox();
    const role = await actor.getAttribute('role');
    const tag = await actor.evaluate(n => n.tagName);
    try {
      if (role === 'slider') await actor.press('ArrowRight');
      else if (['INPUT','TEXTAREA'].includes(tag)) {
        if (await actor.getAttribute('type') === 'checkbox' || await actor.getAttribute('type') === 'radio') await actor.check();
        else await actor.press('ArrowUp');
      } else await actor.click();
      // UI actions are local examples. Allow async feedback to settle without a fixed sleep.
      await expect.poll(async () => {
        const busy = await preview.locator('[aria-busy="true"]').count();
        return busy;
      }, {timeout:2500}).toBe(0).catch(() => {});
      const after = await preview.evaluate(n => ({ height:n.getBoundingClientRect().height,width:n.getBoundingClientRect().width }));
      const connected = await target.evaluate((n: Element) => n.isConnected);
      const targetAfter = connected ? await target.boundingBox().catch(() => null) : null;
      const record = { id,label,kind:'interactive',before,after,targetBefore,targetAfter,delta:after.height-before.height };
      results.push(record);
      if (stable.has(entry.id)) expect(Math.abs(record.delta),id + ' changed its stable outer height').toBeLessThan(.5);
      if (targetBefore && targetAfter && !/STEP|移除|删除|添加|打开|关闭|展开|收起|分支|切换|归档|创建|重试|恢复|下一|上一|日|周|月/.test(label)) {
        expect(Math.abs(targetAfter.height-targetBefore.height),id + ' changed control height').toBeLessThan(.5);
      }
    } catch (error) {
      results.push({id,label,kind:'probe-failure',error:String(error)});
    }
    await page.keyboard.press('Escape');
    // Reset only this demo; avoid timers and open portals leaking into subsequent probes.
    const reset = tile.locator(':scope > footer').getByRole('button',{name:'重置',exact:true});
    await reset.click();
  }
  writeFileSync('.logs/catalog-state-probes.json',JSON.stringify(results,null,2));
  expect(results.filter(r=>r.kind==='probe-failure')).toEqual([]);
  expect(new Set(results.map(r=>r.id)).size).toBe(manifest.total);
});
