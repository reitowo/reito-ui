import type { Page } from '@playwright/test';
export async function chooseThemeMode(page: Page, mode: 'dark'|'light'|'system') {
  await page.getByRole('button', {name:'主题',exact:true}).click();
  await page.getByRole('menuitemradio', {name: mode==='dark'?'深色':mode==='light'?'浅色':'跟随系统',exact:true}).click();
  await page.keyboard.press('Escape');
}
export async function chooseThemePalette(page: Page, role: 'primary'|'neutral', color: string) {
  await page.getByRole('button', {name:'主题',exact:true}).click();
  await page.getByRole('menuitem', {name: role==='primary'?/^主色 /:/^底色色系 /}).click();
  await page.getByRole('menuitemradio', {name: role==='primary'&&color==='neutral'?'灰白':color[0].toUpperCase()+color.slice(1),exact:true}).click();
  await page.keyboard.press('Escape');await page.keyboard.press('Escape');
}
