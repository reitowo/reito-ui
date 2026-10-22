import { mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';

// Captures the Lab dense example pages in both themes. Usage:
// node scripts/capture-dense-examples.mjs [baseUrl] [outDir]
const base = process.argv[2] ?? 'http://127.0.0.1:5173/';
const out = process.argv[3] ?? '.logs/dense-examples';
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1024, height: 864 }, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));

const shots = [
  { page: 'trace', prepare: async () => {
    await page.getByRole('button', { name: '读周宁的开头源码，13 行' }).click();
  } },
  { page: 'trace', suffix: 'error', prepare: async () => {
    await page.getByRole('region', { name: '改稿记录' }).evaluate((element) => { element.scrollTop = element.scrollHeight; });
  } },
  { page: 'events' },
  { page: 'inspector', prepare: async () => {
    await page.getByRole('button', { name: '林夏 操作' }).click();
    await page.getByRole('menuitem', { name: '转到栏目' }).hover();
    await page.getByRole('menuitem', { name: '城市' }).waitFor();
  } },
  { page: 'inspector', suffix: 'context-menu', prepare: async () => {
    await page.getByRole('row', { name: /周宁/ }).click({ button: 'right' });
    await page.getByRole('menuitem', { name: '再约一次' }).waitFor();
  } },
  { page: 'commands', prepare: async () => {
    await page.getByRole('menuitem', { name: '编辑' }).click();
    await page.getByRole('menuitem', { name: '重命名' }).hover();
  } },
  { page: 'commands', suffix: 'dropdown', prepare: async () => {
    await page.getByRole('button', { name: '打开详情' }).click();
    await page.getByRole('menuitemradio', { name: '展开原稿' }).hover();
  } },
];
for (const theme of ['dark', 'light']) {
  for (const shot of shots) {
    await page.goto(`${base}?view=dense&page=${shot.page}&theme=${theme}`);
    await page.locator('main').waitFor();
    await page.evaluate(() => document.fonts.ready);
    await shot.prepare?.();
    await page.waitForTimeout(250);
    const name = `dense-${shot.page}${shot.suffix ? '-' + shot.suffix : ''}-${theme}.png`;
    await page.screenshot({ path: `${out}/${name}` });
    console.log(`${out}/${name}`);
  }
}
// The refreshed menus at the default compact density, from the Lab component pages.
for (const theme of ['dark', 'light']) {
  await page.addInitScript(([mode]) => { localStorage.setItem('reito-theme', mode); localStorage.setItem('reito-density', 'compact'); }, [theme]);
  await page.goto(`${base}?layer=basic&component=dropdown-menu`);
  const preview = page.getByTestId('component-preview');
  await preview.getByRole('button').first().click();
  await page.getByRole('menu').first().waitFor();
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${out}/compact-dropdown-menu-${theme}.png` });
  console.log(`${out}/compact-dropdown-menu-${theme}.png`);
}
await browser.close();
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
}
