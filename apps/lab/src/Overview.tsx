import { ThemeControls, useDensityPreferences, useThemePreferences } from './ThemeControls';
import { readThemeMode } from './theme-preferences';
import { ReitoThemeProvider } from '@reito/ui/basic';
import { memo, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Blocks, Check, PanelLeft, Search } from 'lucide-react';
import { Badge, Button, Input, TooltipProvider } from '@reito/ui/basic';
import { allComponents, componentName, layers, type CatalogEntry, type LayerId } from './catalog';
import manifest from './catalog-manifest.json';
import { PreviewBoundary } from './PreviewBoundary';
import { version } from '../package.json';
import './overview.css';

const base = import.meta.env.BASE_URL;
const storybook = (import.meta.env.VITE_STORYBOOK_URL || (import.meta.env.PROD ? `${base}storybook` : 'http://127.0.0.1:6007')).replace(/\/$/, '');
const surfaces = ['bg', 'surface', 'elevated', 'hover', 'active', 'border', 'text', 'text-muted', 'action-accent'] as const;

function StyleSpecimen() {
  return (
    <section className="atlas-style" aria-labelledby="style-title">
      <div className="atlas-section-heading"><h2 id="style-title">风格速览</h2><span>共享 tokens · 实际组件</span></div>
      <div className="atlas-label">操作与尺寸</div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="xs">主要操作</Button>
        <Button size="xs" variant="accent">强调操作</Button>
        <Button size="xs" variant="secondary">次要操作</Button>
        <Button size="xs" variant="outline">描边</Button>
        <Button size="xs" variant="ghost">轻量</Button>
        <Button size="xs" variant="destructive">删除</Button>
        <Button size="xs" disabled>禁用</Button>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button size="xs" variant="secondary">XS</Button>
        <Button size="sm" variant="secondary">Small</Button>
        <Button variant="secondary">Default</Button>
        <Button size="md" variant="secondary">Medium</Button>
        <Button size="lg" variant="secondary">Large</Button>
        <Badge variant="secondary"><Check />已完成</Badge>
      </div>
      <div className="atlas-swatches">{surfaces.map(role => <div key={role}><span style={{ background: `var(--rui-${role})` }} /><code>{role}</code></div>)}</div>
    </section>
  );
}

const PreviewTile = memo(function PreviewTile({ entry, theme, density }: { entry: CatalogEntry; theme: string; density: string }) {
  const [expanded, setExpanded] = useState(false);
  const [revision, setRevision] = useState(0);
  const id = entry.layer + '/' + entry.id;
  const Demo = entry.component;
  const storyId = manifest.entries.find(item => item.layer === entry.layer && item.id === entry.id)?.storyId;
  return <article id={`component-${entry.layer}-${entry.id}`} className={`atlas-tile ${expanded ? 'is-expanded' : ''}`} data-component={id}>
    <header><div><h3>{componentName(entry.name)}</h3><p>{entry.description}</p></div><a href={`${base}?layer=${entry.layer}&component=${entry.id}`} aria-label={`查看 ${componentName(entry.name)} 详情`} title="组件详情"><ArrowUpRight className="size-3.5" /></a></header>
    <div className="atlas-inline-preview" data-preview={id}><PreviewBoundary key={revision}><Demo /></PreviewBoundary></div>
    <footer><Button variant="ghost" size="xs" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? '收起预览' : '放大预览'}</Button><Button variant="ghost" size="xs" onClick={() => setRevision(revision + 1)}>重置</Button>{storyId && <a href={`${storybook}/?path=/story/${encodeURIComponent(storyId)}&globals=theme:${theme};density:${density}`} target="_blank" rel="noreferrer">Storybook<ArrowUpRight className="size-3" /></a>}</footer>
  </article>;
});

export function Overview() {
  const [colors, setColors] = useThemePreferences();
  const main = useRef<HTMLElement>(null);
  const [query, setQuery] = useState('');
  const [layer, setLayer] = useState<LayerId | 'all'>('all');
  const [theme, setTheme] = useState(readThemeMode);
  const [density, setDensity] = useDensityPreferences();
  const visible = allComponents.filter(entry => (layer === 'all' || layer === entry.layer) && `${entry.name} ${entry.description} ${entry.id} ${entry.layerName}`.toLowerCase().includes(query.trim().toLowerCase()));
  useEffect(() => { main.current?.scrollTo({ top: 0 }); }, [query, layer]);
  useEffect(() => {
    document.title = '全组件总览 · Reito UI';

    document.documentElement.dataset.density = density;

    try { localStorage.setItem('reito-theme', theme); localStorage.setItem('reito-density', density); } catch { /* Session preferences remain available. */ }
  }, [theme, density]);
  return <ReitoThemeProvider root mode={theme} density={density} colors={colors}><TooltipProvider><div className="reito-root atlas-shell"><a className="atlas-skip" href="#atlas-main">跳到组件总览</a><header className="atlas-toolbar"><a href={base} className="lab-brand"><PanelLeft className="size-4" />Reito UI<span className="lab-version">{version}</span></a><div className="ml-auto flex items-center gap-1"><ThemeControls colors={colors} onChange={setColors} mode={theme} onModeChange={setTheme} density={density} onDensityChange={setDensity}/><a className="atlas-text-link" href={base+'?view=theme-guide'}>配色示例<ArrowUpRight className="size-3" /></a><a className="atlas-text-link" href={`${base}?layer=basic&component=button`}>组件详情<ArrowUpRight className="size-3" /></a></div></header>
    <div className="atlas-body"><aside className="atlas-sidebar" aria-label="总览导航"><div className="relative"><Search className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" /><Input className="pl-7" aria-label="搜索全部组件" value={query} onChange={event => setQuery(event.target.value)} placeholder="搜索名称、功能…" /></div><nav aria-label="筛选应用层"><Button variant={layer === 'all' ? 'secondary' : 'ghost'} size="sm" onClick={() => setLayer('all')}><Blocks />全部组件<span>{allComponents.length}</span></Button>{layers.map(group => <Button key={group.id} variant={layer === group.id ? 'secondary' : 'ghost'} size="sm" onClick={() => setLayer(group.id as LayerId)} aria-pressed={layer === group.id}><group.icon />{group.name}<span>{group.entries.length}</span></Button>)}</nav><nav className="atlas-index" aria-label="跳转组件">{layers.map(group => { const entries = visible.filter(entry => entry.layer === group.id); return entries.length ? <section key={group.id}><h2>{group.name}</h2>{entries.map(entry => <a key={entry.id} href={`#component-${entry.layer}-${entry.id}`}>{componentName(entry.name)}</a>)}</section> : null; })}</nav><p className="atlas-sidebar-note">本地交互示例<br />AI 示例未连接模型</p></aside>
    <main ref={main} id="atlas-main" className="atlas-main" tabIndex={-1}><div className="atlas-intro"><h1>全组件总览</h1><p>在同一页比较控件、布局和 AI 工作面。滚动即可查看，点开预览可直接操作。</p><span role="status">显示 {visible.length} / {allComponents.length} 个组件族 · {theme} / {density}</span></div><StyleSpecimen />
    {layers.map(group => { const entries = visible.filter(entry => entry.layer === group.id); return entries.length ? <section key={group.id} className="atlas-component-section" aria-labelledby={`layer-${group.id}`}><div className="atlas-section-heading"><h2 id={`layer-${group.id}`}><group.icon className="size-4" />{group.name}<span>{entries.length}</span></h2><p>{group.description}</p></div><div className={`atlas-grid atlas-grid-${group.id}`}>{entries.map(entry => <PreviewTile key={`${entry.layer}/${entry.id}`} entry={entry} theme={theme} density={density} />)}</div></section> : null; })}
    {!visible.length && <div className="atlas-empty"><p>没有匹配的组件。</p><Button variant="secondary" size="sm" onClick={() => { setQuery(''); setLayer('all'); }}>清除筛选</Button></div>}<p className="atlas-end-note">本页直接展示共享组件；主题和密度更新样式，筛选移除或重置会初始化示例。完整尺寸和全部参数可在组件详情与 Storybook 中检查。</p></main></div></div></TooltipProvider></ReitoThemeProvider>;
}
