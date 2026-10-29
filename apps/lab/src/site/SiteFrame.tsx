import { useEffect, useState, type ReactNode } from 'react';
import { Code2, ExternalLink, PanelLeft } from 'lucide-react';
import { ReitoThemeProvider, TooltipProvider } from '@reito/ui/basic';
import { ThemeControls, useDensityPreferences, useThemePreferences } from '../ThemeControls';
import { readThemeMode } from '../theme-preferences';
import { sitePath } from '../routes';
import { version } from '../../package.json';
import './site.css';

export const repository = 'https://github.com/reitowo/reito-ui';
export const siteBase = import.meta.env.BASE_URL;
export const storybookUrl = (import.meta.env.VITE_STORYBOOK_URL || (import.meta.env.PROD ? `${siteBase}storybook` : 'http://127.0.0.1:6007')).replace(/\/$/, '');
export const storyLink = (storyId: string, query = '') => `${storybookUrl}/?path=/story/${encodeURIComponent(storyId)}${query}`;

export type SiteSection = 'home' | 'docs' | 'gallery';

const navigation: Array<{ id: SiteSection | 'templates'; label: string; href: string }> = [
  { id: 'docs', label: '文档', href: sitePath('docs/introduction') },
  { id: 'gallery', label: '组件', href: sitePath('gallery') },
  { id: 'templates', label: '示例', href: sitePath('templates') },
];

function usePersistedMode() {
  const [mode, setMode] = useState(readThemeMode);
  useEffect(() => {
    try { localStorage.setItem('reito-theme', mode); } catch { /* Session theme remains available. */ }
  }, [mode]);
  return [mode, setMode] as const;
}

/** Shared chrome for the public homepage, docs and gallery. */
export function SiteFrame({ section, title, children, footer = true }: { section: SiteSection; title: string; children: ReactNode; footer?: boolean }) {
  const [density, setDensity] = useDensityPreferences();
  const [colors, setColors] = useThemePreferences();
  const [mode, setMode] = usePersistedMode();
  useEffect(() => { document.title = title; }, [title]);
  return (
    <ReitoThemeProvider root mode={mode} density={density} colors={colors}>
      <TooltipProvider>
        <div className="reito-root site-page" data-site-section={section}>
          <a className="site-skip" href="#site-main">跳到主要内容</a>
          <header className="site-header">
            <div className="site-header-inner">
              <a href={siteBase} className="site-logo" aria-label="Reito UI 首页"><PanelLeft className="size-5" aria-hidden="true" /><span>Reito UI</span><span className="site-version">{version}</span></a>
              <nav aria-label="主导航" className="site-nav">
                {navigation.map((item) => <a key={item.id} href={item.href} aria-current={item.id === section ? 'page' : undefined}>{item.label}</a>)}
                <a href={sitePath('components/button')}>Lab</a>
                <a href={`${storybookUrl}/`}>Storybook</a>
              </nav>
              <div className="site-tools">
                <ThemeControls colors={colors} onChange={setColors} mode={mode} onModeChange={setMode} density={density} onDensityChange={setDensity} />
                <a className="site-icon-link" href={repository} target="_blank" rel="noreferrer" aria-label="GitHub 源码"><Code2 className="size-4" aria-hidden="true" /></a>
              </div>
            </div>
          </header>
          {children}
          {footer && (
            <footer className="site-footer">
              <div className="site-container site-footer-inner">
                <a href={siteBase} className="site-logo"><PanelLeft className="size-4" aria-hidden="true" />Reito UI</a>
                <span>Graphite · 为个人工具而构建</span>
                <nav aria-label="页脚" className="site-footer-links">
                  <a href={sitePath('docs/introduction')}>文档</a>
                  <a href={sitePath('gallery')}>组件</a>
                  <a href={sitePath('docs/ai')}>与 AI 协作</a>
                  <a href={sitePath('llms.txt')}>llms.txt</a>
                  <a href={repository} target="_blank" rel="noreferrer">GitHub<ExternalLink className="size-3" aria-hidden="true" /></a>
                </nav>
              </div>
            </footer>
          )}
        </div>
      </TooltipProvider>
    </ReitoThemeProvider>
  );
}
