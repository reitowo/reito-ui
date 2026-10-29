import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Blocks, Braces, FileText, LayoutTemplate, Search, Sparkles } from 'lucide-react';
import { Badge, Button, Input, Spinner, Tabs, TabsList, TabsTrigger, Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@reito/ui/basic';
import manifest from '../catalog-manifest.json';
import { sitePath, templates } from '../routes';
import { SiteFrame, storyLink } from './SiteFrame';

const ComponentPreview = lazy(() => import('./ComponentPreview'));

type Entry = (typeof manifest.entries)[number];
type Filter = 'all' | 'basic' | 'complex' | 'ai' | 'patterns';

export const layerMeta = {
  basic: { name: '基础', icon: Blocks, description: '按钮、表单、导航、反馈与页面积木。' },
  complex: { name: '复杂', icon: Braces, description: '表格、树、表单管理、设置与工作区。' },
  ai: { name: 'AI', icon: Sparkles, description: '对话、上下文、工具调用、产物与任务流。' },
} as const;

const recipes = [
  { slug: 'recipes/dashboard-workspace', title: 'Dashboard 工作面', description: 'Sidebar、AppShell、WorkspacePreset 与 DataTable 组合的紧凑工作台。' },
  { slug: 'recipes/content-workspace', title: '内容工作面', description: '阅读、编辑与检查内容的工作面组合。' },
  { slug: 'recipes/dynamic-form', title: '动态条件表单', description: 'FormField、AsyncForm 与基础输入组成的条件字段。' },
];

export const displayName = (name: string) => name.replace(/\s*[\u3400-\u9fff].*$/u, '').trim() || name;

/** Mounts the live demo once the tile approaches the viewport. */
function LazyTilePreview({ id }: { id: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver((records) => {
      if (records.some((record) => record.isIntersecting)) { setVisible(true); observer.disconnect(); }
    }, { rootMargin: '200px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className="gallery-tile-stage" inert aria-hidden="true">
      {visible && <Suspense fallback={<Spinner />}><ComponentPreview id={id} label={false} /></Suspense>}
    </div>
  );
}

function ComponentTile({ entry }: { entry: Entry }) {
  return (
    <a className="gallery-tile" href={sitePath(`gallery/${entry.id}`)} data-component={entry.id}>
      <LazyTilePreview id={entry.id} />
      <div className="gallery-tile-meta">
        <span className="gallery-tile-name">{displayName(entry.name)}</span>
        <span className="gallery-tile-description">{entry.description}</span>
      </div>
    </a>
  );
}

function Patterns() {
  return (
    <section className="gallery-section" aria-labelledby="gallery-patterns">
      <div className="gallery-section-heading"><h2 id="gallery-patterns"><LayoutTemplate className="size-4" aria-hidden="true" />页面模式</h2><p>完整页面示例与组合配方。示例只使用本地状态。</p></div>
      <div className="gallery-pattern-grid">
        {templates.map((template) => (
          <a key={template.id} className="gallery-pattern" href={sitePath(`templates/${template.id}`)}>
            <LayoutTemplate className="size-5" aria-hidden="true" />
            <span className="gallery-tile-name">{template.title}<ArrowUpRight className="size-3" aria-hidden="true" /></span>
            <span className="gallery-tile-description">{template.description}</span>
            <Badge variant="outline">页面示例</Badge>
          </a>
        ))}
        {recipes.map((recipe) => (
          <a key={recipe.slug} className="gallery-pattern" href={sitePath(`docs/${recipe.slug}`)}>
            <FileText className="size-5" aria-hidden="true" />
            <span className="gallery-tile-name">{recipe.title}<ArrowRight className="size-3" aria-hidden="true" /></span>
            <span className="gallery-tile-description">{recipe.description}</span>
            <Badge variant="secondary">配方文档</Badge>
          </a>
        ))}
      </div>
    </section>
  );
}

function GalleryIndex() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const normalized = query.trim().toLowerCase();
  const visible = useMemo(() => manifest.entries.filter((entry) => (filter === 'all' || filter === entry.layer) && `${entry.id} ${entry.name} ${entry.description}`.toLowerCase().includes(normalized)), [filter, normalized]);
  const showPatterns = filter === 'patterns' || (filter === 'all' && !normalized);
  return (
    <main id="site-main" className="site-container gallery-main">
      <div className="gallery-intro">
        <h1>组件库</h1>
        <p>{manifest.total} 个组件族的实时预览，按基础、复杂与 AI 三层组织。打开任意组件查看大尺寸预览、文档与 Storybook 参数调试。</p>
      </div>
      <div className="gallery-toolbar">
        <Tabs value={filter} onValueChange={(value) => setFilter(value as Filter)}>
          <TabsList aria-label="按层筛选">
            <TabsTrigger value="all">全部 <span className="gallery-count">{manifest.total}</span></TabsTrigger>
            {(Object.keys(layerMeta) as Array<keyof typeof layerMeta>).map((layer) => <TabsTrigger key={layer} value={layer}>{layerMeta[layer].name} <span className="gallery-count">{manifest.counts[layer]}</span></TabsTrigger>)}
            <TabsTrigger value="patterns">页面模式</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="gallery-search"><Search className="size-4" aria-hidden="true" /><Input aria-label="搜索组件" placeholder="搜索名称、功能…" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
      </div>
      {showPatterns && <Patterns />}
      {filter !== 'patterns' && (Object.keys(layerMeta) as Array<keyof typeof layerMeta>).map((layer) => {
        const entries = visible.filter((entry) => entry.layer === layer);
        if (!entries.length) return null;
        const Icon = layerMeta[layer].icon;
        return (
          <section key={layer} className="gallery-section" aria-labelledby={`gallery-${layer}`}>
            <div className="gallery-section-heading"><h2 id={`gallery-${layer}`}><Icon className="size-4" aria-hidden="true" />{layerMeta[layer].name}<span className="gallery-count">{entries.length}</span></h2><p>{layerMeta[layer].description}</p></div>
            <div className="gallery-grid">{entries.map((entry) => <ComponentTile key={entry.id} entry={entry} />)}</div>
          </section>
        );
      })}
      {filter !== 'patterns' && !visible.length && (
        <Empty>
          <EmptyHeader><EmptyTitle>没有匹配的组件</EmptyTitle><EmptyDescription>换一个关键词，或查看全部组件。</EmptyDescription></EmptyHeader>
          <Button variant="secondary" onClick={() => { setQuery(''); setFilter('all'); }}>清除筛选</Button>
        </Empty>
      )}
    </main>
  );
}

function GalleryDetail({ entry }: { entry: Entry }) {
  const siblings = manifest.entries.filter((item) => item.layer === entry.layer);
  const index = siblings.findIndex((item) => item.id === entry.id);
  const previous = siblings[index - 1];
  const next = siblings[index + 1];
  const related = siblings.filter((item) => item.id !== entry.id).slice(Math.max(0, index - 2), Math.max(0, index - 2) + 4);
  const meta = layerMeta[entry.layer as keyof typeof layerMeta];
  return (
    <main id="site-main" className="site-container gallery-main">
      <nav aria-label="面包屑" className="gallery-breadcrumb"><a href={sitePath('gallery')}><ArrowLeft className="size-3" aria-hidden="true" />组件库</a><span aria-hidden="true">/</span><span>{meta.name}</span></nav>
      <div className="gallery-detail-heading">
        <div>
          <h1>{displayName(entry.name)}</h1>
          <p>{entry.description}</p>
          <div className="gallery-detail-badges"><Badge variant="secondary">{meta.name}</Badge><Badge variant="outline">{entry.name}</Badge></div>
        </div>
        <div className="gallery-detail-actions">
          <Button nativeButton={false} render={<a href={sitePath(`docs/components/${entry.id}`)} />}><BookOpen aria-hidden="true" />文档</Button>
          <Button variant="outline" nativeButton={false} render={<a href={sitePath(`components/${entry.id}`)} />}>在 Lab 中检查</Button>
          {entry.storyId && <Button variant="ghost" nativeButton={false} render={<a href={storyLink(entry.storyId)} />}>Storybook<ArrowUpRight aria-hidden="true" /></Button>}
        </div>
      </div>
      <Suspense fallback={<div className="site-preview site-preview-loading"><Spinner /></div>}><ComponentPreview id={entry.id} /></Suspense>
      <nav aria-label="同层组件" className="gallery-pager">
        {previous ? <a href={sitePath(`gallery/${previous.id}`)}><span>上一个</span>{displayName(previous.name)}</a> : <span />}
        {next ? <a href={sitePath(`gallery/${next.id}`)} className="is-next"><span>下一个</span>{displayName(next.name)}</a> : <span />}
      </nav>
      {related.length > 0 && (
        <section className="gallery-section" aria-labelledby="gallery-related">
          <div className="gallery-section-heading"><h2 id="gallery-related">更多{meta.name}组件</h2></div>
          <div className="gallery-grid">{related.map((item) => <ComponentTile key={item.id} entry={item} />)}</div>
        </section>
      )}
    </main>
  );
}

export function Gallery({ id }: { id?: string }) {
  const entry = id ? manifest.entries.find((item) => item.id === id) : undefined;
  const title = entry ? `${displayName(entry.name)} · 组件库 · Reito UI` : '组件库 · Reito UI';
  return (
    <SiteFrame section="gallery" title={title}>
      {id && !entry ? (
        <main id="site-main" className="site-container gallery-main">
          <Empty><EmptyHeader><EmptyTitle>没有找到这个组件</EmptyTitle><EmptyDescription>它可能已改名，或者链接有误。</EmptyDescription></EmptyHeader><Button nativeButton={false} render={<a href={sitePath('gallery')} />}>返回组件库</Button></Empty>
        </main>
      ) : entry ? <GalleryDetail entry={entry} /> : <GalleryIndex />}
    </SiteFrame>
  );
}
