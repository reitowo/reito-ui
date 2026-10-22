import { useEffect, useState } from 'react';
import { Code2, PanelLeft } from 'lucide-react';
import { Button, ReitoThemeProvider } from '@reito/ui/basic';
import { ThemeControls, useDensityPreferences, useThemePreferences } from '../ThemeControls';
import { readThemeMode } from '../theme-preferences';
import { examples } from './registry';
import '../home.css';

const repository = 'https://github.com/reitowo/reito-ui';
const siteBase = import.meta.env.BASE_URL;

export function ExamplesIndex() {
  const [density, setDensity] = useDensityPreferences();
  const [colors, setColors] = useThemePreferences();
  const [theme, setTheme] = useState(readThemeMode);
  useEffect(() => {
    document.title = '示例 · Reito UI';
    document.documentElement.dataset.density = density;
    try { localStorage.setItem('reito-theme', theme); } catch { /* Session theme remains available. */ }
  }, [theme, density]);

  return (
    <ReitoThemeProvider root mode={theme} density={density} colors={colors}>
      <div className="reito-root home-page min-h-dvh">
        <a className="home-skip" href="#examples-main">跳到主要内容</a>
        <header className="home-header">
          <a href={siteBase} className="home-logo" aria-label="Reito UI 首页"><PanelLeft className="size-5" /><span>Reito UI</span></a>
          <nav aria-label="主导航" className="order-last w-full justify-center sm:order-none sm:w-auto">
            <a href={siteBase}>首页</a>
            <a href={`${siteBase}?view=examples`} aria-current="page">示例</a>
            <a href={`${siteBase}?view=overview`}>Component atlas</a>
            <a href={`${siteBase}?layer=basic&component=button`}>组件</a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeControls colors={colors} onChange={setColors} mode={theme} onModeChange={setTheme} density={density} onDensityChange={setDensity} />
            <a className="home-github" href={repository} target="_blank" rel="noreferrer" aria-label="GitHub 源码"><Code2 className="size-4" /></a>
          </div>
        </header>
        <main id="examples-main" className="home-section home-container">
          <div className="home-section-heading">
            <h1>示例</h1>
            <p>这些是用 Reito UI 搭出来的完整应用，用来看组件在真实界面里怎么配合。它们不改变组件库本身。</p>
          </div>
          <div className="home-layer-grid">
            {examples.map((item) => (
              <article className="home-layer" key={item.id}>
                <h2 className="text-lg font-medium">{item.title}</h2>
                <p>{item.description}</p>
                <Button className="mt-auto self-start" nativeButton={false} aria-label={`打开${item.title}`} render={<a href={item.href} />}>打开</Button>
              </article>
            ))}
          </div>
        </main>
      </div>
    </ReitoThemeProvider>
  );
}
