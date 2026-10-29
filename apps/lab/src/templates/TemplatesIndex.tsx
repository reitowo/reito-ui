import { useEffect, useState } from 'react';
import { Code2, PanelLeft } from 'lucide-react';
import { Button, ReitoThemeProvider } from '@reito/ui/basic';
import { ThemeControls, useDensityPreferences, useThemePreferences } from '../ThemeControls';
import { readThemeMode } from '../theme-preferences';
import { sitePath, templates } from '../routes';
import '../home.css';

const repository = 'https://github.com/reitowo/reito-ui';

function Thumb({ id }: { id: string }) {
  if (id === 'chat') {
    return (
      <div className="flex h-36 overflow-hidden rounded-md border bg-background" aria-hidden="true">
        <div className="flex w-16 flex-col gap-1 border-r bg-muted p-2">
          <span className="h-3 rounded-sm bg-foreground/25" />
          <span className="h-3 rounded-sm bg-foreground/15" />
          <span className="h-3 rounded-sm bg-foreground/15" />
        </div>
        <div className="flex flex-1 flex-col justify-end gap-2 p-3">
          <span className="h-4 w-2/3 rounded-md bg-muted" />
          <span className="ml-auto h-4 w-1/2 rounded-md bg-primary/70" />
          <span className="h-6 rounded-md border" />
        </div>
      </div>
    );
  }
  if (id === 'landing') {
    return (
      <div className="flex h-36 flex-col items-center justify-center gap-2 rounded-md border bg-background p-4" aria-hidden="true">
        <span className="h-3 w-2/3 rounded-sm bg-foreground/30" />
        <span className="h-2 w-1/2 rounded-sm bg-muted" />
        <span className="mt-2 h-5 w-16 rounded-md bg-primary" />
      </div>
    );
  }
  if (id === 'nanchuang') {
    return (
      <div className="grid h-36 grid-cols-4 gap-1 rounded-md border bg-background p-2" aria-hidden="true">
        {['选题', '改稿', '校对', '付印'].map((label) => (
          <span key={label} className="rounded-sm bg-muted p-1 text-xs text-muted-foreground">{label}</span>
        ))}
      </div>
    );
  }
  return (
    <div className="flex h-36 overflow-hidden rounded-md border bg-background" aria-hidden="true">
      <div className="flex w-10 flex-col gap-1 border-r bg-muted p-1">
        <span className="size-3 rounded-sm bg-foreground/30" />
        <span className="h-2 rounded-sm bg-foreground/20" />
        <span className="h-2 rounded-sm bg-foreground/20" />
        <span className="h-2 rounded-sm bg-foreground/15" />
      </div>
      <div className="grid flex-1 grid-cols-2 gap-2 p-2">
        <span className="rounded-sm bg-muted" />
        <span className="rounded-sm bg-muted" />
        <span className="col-span-2 rounded-sm bg-card" />
      </div>
    </div>
  );
}

export function TemplatesIndex() {
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
          <a href={sitePath()} className="home-logo" aria-label="Reito UI 首页"><PanelLeft className="size-5" /><span>Reito UI</span></a>
          <nav aria-label="主导航" className="order-last w-full justify-center sm:order-none sm:w-auto">
            <a href={sitePath()}>首页</a>
            <a href={sitePath('templates')} aria-current="page">示例</a>
            <a href={sitePath('overview')}>Component atlas</a>
            <a href={sitePath('components/button')}>组件</a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeControls colors={colors} onChange={setColors} mode={theme} onModeChange={setTheme} density={density} onDensityChange={setDensity} />
            <a className="home-github" href={repository} target="_blank" rel="noreferrer" aria-label="GitHub 源码"><Code2 className="size-4" /></a>
          </div>
        </header>
        <main id="examples-main" className="home-section home-container">
          <div className="home-section-heading">
            <h1>示例</h1>
            <p>这些是用 Reito UI 搭出来的完整界面。工作台、对话和落地页是中性模板；南窗仍是一本虚构杂志，刊名只留在那个应用里。</p>
          </div>
          <div className="home-layer-grid">
            {templates.map((item) => {
              const href = item.pages.length > 1 ? sitePath(`templates/${item.id}/${item.defaultPage}`) : sitePath(`templates/${item.id}`);
              return (
                <article className="home-layer" key={item.id}>
                  <Thumb id={item.id} />
                  <h2 className="text-lg font-medium">{item.title}</h2>
                  <p>{item.description}</p>
                  <Button className="mt-auto self-start" nativeButton={false} aria-label={`打开${item.title}`} render={<a href={href} />}>打开</Button>
                </article>
              );
            })}
          </div>
        </main>
      </div>
    </ReitoThemeProvider>
  );
}
