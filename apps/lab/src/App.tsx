import { useEffect, useMemo, useState } from 'react';
import { Blocks, Braces, Check, ChevronRight, ExternalLink, Menu, Moon, PanelLeft, Search, SlidersHorizontal, Sparkles, Sun } from 'lucide-react';
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input, Label, Textarea, TooltipProvider } from '@reito/ui/basic';
import { basicCatalog } from '../../../packages/ui/src/basic/catalog';
import { complexCatalog } from '../../../packages/ui/src/complex/catalog';
import { aiCatalog } from '../../../packages/ui/src/ai/catalog';
import { TokenReference, downloadJson } from './TokenReference';
import catalogManifest from './catalog-manifest.json';
import { version } from '../package.json';

const layers = [
  { id: 'basic', name: '基础', icon: Blocks, description: '按钮、表单、导航与反馈。基于 shadcn / Base UI 的组合原语。', entries: basicCatalog },
  { id: 'complex', name: '复杂', icon: Braces, description: '将基础组件组合为表格、文件、搜索、设置与工作台。', entries: complexCatalog },
  { id: 'ai', name: 'AI', icon: Sparkles, description: '对话、输入、上下文、执行与产物。所有交互均为本地示例。', entries: aiCatalog },
] as const;
type LayerId = typeof layers[number]['id'];
type Review = { status: 'reviewing' | 'accepted'; note: string };
const all = layers.flatMap(layer => layer.entries.map(entry => ({ ...entry, layer: layer.id, layerName: layer.name })));
const readSetting = (key: string, fallback: string) => { try { return localStorage.getItem(key) || fallback; } catch { return fallback; } };
const saveSetting = (key: string, value: string) => { try { localStorage.setItem(key, value); } catch { /* Private browsing can disallow storage. The current session remains usable. */ } };
function readReviews(): Record<string, Review> { try { return JSON.parse(readSetting('reito-v3-reviews', '{}')); } catch { return {}; } }

export function App() {
  const initial = new URLSearchParams(location.search);
  const [selection, setSelection] = useState(() => all.find(entry => entry.layer === initial.get('layer') && entry.id === initial.get('component')) || all[0]);
  const [query, setQuery] = useState('');
  const [theme, setTheme] = useState(() => readSetting('reito-theme', 'dark') === 'light' ? 'light' : 'dark');
  const [density, setDensity] = useState(() => readSetting('reito-density', 'compact') === 'comfortable' ? 'comfortable' : 'compact');
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [tokensOpen, setTokensOpen] = useState(false);
  const [reviews, setReviews] = useState(readReviews);
  const key = `${selection.layer}/${selection.id}`;
  const review = reviews[key] || { status: 'reviewing', note: '' };
  const layer = layers.find(item => item.id === selection.layer)!;
  const Demo = selection.component;
  const filtered = useMemo(() => all.filter(entry => (query.trim() || entry.layer === selection.layer) && `${entry.id} ${entry.name} ${entry.description} ${entry.layerName}`.toLowerCase().includes(query.toLowerCase())), [query, selection.layer]);
  useEffect(() => { document.documentElement.dataset.theme = theme; document.documentElement.style.colorScheme = theme; saveSetting('reito-theme', theme); }, [theme]);
  useEffect(() => { document.documentElement.dataset.density = density; saveSetting('reito-density', density); }, [density]);
  useEffect(() => { const url = new URL(location.href); url.searchParams.set('layer', selection.layer); url.searchParams.set('component', selection.id); history.replaceState(null, '', url); }, [selection]);
  const selectLayer = (id: LayerId) => { setQuery(''); setSelection(all.find(entry => entry.layer === id)!); };
  const updateReview = (patch: Partial<Review>) => setReviews(previous => { const updated = { ...previous, [key]: { ...review, ...patch } }; saveSetting('reito-v3-reviews', JSON.stringify(updated)); return updated; });
  const storyId = catalogManifest.entries.find(entry => entry.layer === selection.layer && entry.id === selection.id)!.storyId;
  const storybookUrl = `http://127.0.0.1:6006/?path=/story/${encodeURIComponent(storyId)}&globals=theme:${theme};density:${density}`;
  return <TooltipProvider><div className="reito-root lab-shell">
    <header className="lab-titlebar">
      <div className="lab-brand"><PanelLeft className="size-4" /><span>Reito UI</span><span className="lab-version">{version.replace(/\.0$/, '')}</span></div>
      <span className="lab-project">Graphite / Component library</span>
      <div className="lab-tools">
        <Button variant="ghost" size="sm" onClick={() => setTokensOpen(true)}>Tokens</Button>
        <Button variant="ghost" size="icon-sm" aria-label="显示组件目录" className="lab-mobile-menu" onClick={() => setNavigationOpen(!navigationOpen)}><Menu /></Button>
        <Button variant="ghost" size="sm" onClick={() => setDensity(density === 'compact' ? 'comfortable' : 'compact')} aria-label="切换组件密度"><SlidersHorizontal />{density === 'compact' ? '紧凑' : '舒适'}</Button>
        <Button variant="ghost" size="icon-sm" aria-label="切换明暗主题" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? <Sun /> : <Moon />}</Button>
        <a className="lab-storybook-link" href="http://127.0.0.1:6006/" target="_blank" rel="noreferrer">Storybook <ExternalLink className="size-3" /></a>
      </div>
    </header>
    <div className="lab-body">
      <aside className={`lab-sidebar ${navigationOpen ? 'is-open' : ''}`} aria-label="组件目录">
        <div className="lab-search"><Search className="size-3.5" /><Input aria-label="搜索组件" placeholder="搜索组件…" value={query} onChange={event => setQuery(event.target.value)} /></div>
        <nav className="lab-navigation" aria-label="按应用层查找组件">
          {layers.map(group => { const entries = filtered.filter(entry => entry.layer === group.id); return entries.length ? <section key={group.id} className="lab-nav-group">
            <h2><group.icon className="size-3.5" />{group.name}<span>{entries.length}</span></h2>
            {entries.map(entry => <button key={entry.id} className={`lab-nav-item ${selection.layer === entry.layer && selection.id === entry.id ? 'is-active' : ''}`} aria-current={selection.layer === entry.layer && selection.id === entry.id ? 'page' : undefined} onClick={() => { setSelection(entry); setNavigationOpen(false); }}><span>{entry.name}</span>{reviews[`${entry.layer}/${entry.id}`]?.status === 'accepted' && <Check className="size-3" aria-label="已确认" />}</button>)}
          </section> : null; })}
          {!filtered.length && <p className="lab-no-results">未找到组件。试试“输入”或 “Tool”。</p>}
        </nav>
        <footer className="lab-sidebar-footer"><span className="lab-status-dot" />{all.length} 个组件族<span>shadcn · Base UI</span></footer>
      </aside>
      <main className="lab-main" id="main-content">
        <div className="lab-layer-tabs" aria-label="应用层">
          {layers.map(item => <button key={item.id} aria-pressed={selection.layer === item.id} onClick={() => selectLayer(item.id)}><item.icon className="size-3.5" />{item.name}<span>{item.entries.length}</span></button>)}
        </div>
        <div className="lab-content-scroll">
          <div className="lab-document">
            <div className="lab-breadcrumb">组件库<ChevronRight className="size-3" />{layer.name}<ChevronRight className="size-3" /><span>{selection.id}</span></div>
            <div className="lab-component-heading"><div><h1>{selection.name}</h1><p>{selection.description}</p></div><Button variant="outline" size="sm" onClick={() => setReviewOpen(true)}>{review.status === 'accepted' ? <Check /> : <SlidersHorizontal />}{review.status === 'accepted' ? '已确认' : '确认样式'}</Button></div>
            <div className="lab-preview" data-testid="component-preview"><div className="lab-preview-bar"><span>交互预览</span><span>{selection.layer === 'ai' ? '本地示例 · 无模型连接' : '与 Storybook 共用示例'}<span className="lab-preview-density">{theme} / {density}</span></span></div><div className="lab-demo" key={key}><Demo /></div></div>
            <div className="lab-component-meta"><span>{layer.description}</span><a href={storybookUrl} target="_blank" rel="noreferrer">查看 Storybook <ExternalLink className="size-3" /></a></div>
            <details className="lab-usage"><summary>在项目中复用<ChevronRight className="size-3" /></summary><div><p>安装 @reito/tokens 与 @reito/ui，应用入口引入两份样式；按层导入组件，具体组合见 Storybook 和源码示例。</p><pre><code>{`import '@reito/tokens/css';\nimport '@reito/ui/styles.css';\n\n// 基础: @reito/ui/basic\n// 复杂: @reito/ui/complex\n// AI:   @reito/ui/ai\n\ndocument.documentElement.dataset.theme = '${theme}';\ndocument.documentElement.dataset.density = '${density}';`}</code></pre></div></details>
          </div>
        </div>
        <footer className="lab-statusbar"><span>{layer.name} / {selection.id}</span><span>Inter Variable · Tailwind CSS 4 · Base Nova</span></footer>
      </main>
    </div>
    <Dialog open={reviewOpen} onOpenChange={setReviewOpen}><DialogContent><DialogHeader><DialogTitle>确认 {selection.name} 的样式</DialogTitle><DialogDescription>记录保存在当前浏览器。切换主题和密度后检查文字、边框、悬停与弹层。</DialogDescription></DialogHeader><div className="grid gap-2"><Label htmlFor="review-note">修改意见</Label><Textarea id="review-note" placeholder="例如：希望行距更紧凑…" value={review.note} onChange={event => updateReview({ note: event.target.value })} /></div><DialogFooter><Button variant="ghost" onClick={() => downloadJson(`reito-reviews-${version}.json`, { version, reviews })}>导出记录</Button><Button variant="outline" onClick={() => { updateReview({ status: 'reviewing' }); setReviewOpen(false); }}>待调整</Button><Button onClick={() => { updateReview({ status: 'accepted' }); setReviewOpen(false); }}><Check />确认此组件</Button></DialogFooter></DialogContent></Dialog>
    <TokenReference open={tokensOpen} onOpenChange={setTokensOpen} />
  </div></TooltipProvider>;
}
