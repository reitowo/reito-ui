import { Children, isValidElement, lazy, Suspense, useEffect, useMemo, useState, type MouseEvent, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Copy, FileText, Menu, Pencil, Search } from 'lucide-react';
import { Button, Input, Spinner, Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@reito/ui/basic';
import { MarkdownContent } from '@reito/ui/ai';
import rawDocs from 'virtual:reito-docs';
import type { DocPage, DocsData } from './docs-types';
import { sitePath } from '../routes';
import { repository, SiteFrame, storybookUrl, storyLink } from './SiteFrame';

const docs = rawDocs as DocsData;
const ComponentPreview = lazy(() => import('./ComponentPreview'));

const pages = new Map<string, DocPage>(docs.pages.map((page) => [page.slug, page]));
const order = docs.sections.flatMap((section) => section.slugs);
const siteUrl = () => new URL(sitePath(), location.origin).href.replace(/\/$/, '');

const plainText = (markdown: string) => markdown.replace(/`([^`]*)`/g, '$1').replace(/\*\*([^*]*)\*\*/g, '$1').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').trim();
export const headingId = (text: string) => text.toLowerCase().trim().replace(/[\s/]+/g, '-').replace(/[^\p{L}\p{N}_-]/gu, '').replace(/-+/g, '-') || 'section';

function nodeText(node: ReactNode): string {
  return Children.toArray(node).map((child) => (typeof child === 'string' || typeof child === 'number' ? String(child) : isValidElement<{ children?: ReactNode }>(child) ? nodeText(child.props.children) : '')).join('');
}

function outline(body: string) {
  const items: Array<{ id: string; text: string; level: 2 | 3 }> = [];
  let fenced = false;
  for (const line of body.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;
    const match = !fenced && /^(##|###)\s+(.+)$/.exec(line);
    if (match) { const text = plainText(match[2]); items.push({ id: headingId(text), text, level: match[1].length as 2 | 3 }); }
  }
  return items;
}

function resolveBody(page: DocPage) {
  return page.body.replaceAll('{{SITE_URL}}', siteUrl()).replaceAll('{{STORYBOOK_URL}}', storybookUrl);
}

const internalHref = (href: string) => (href.startsWith('/') && !href.startsWith('//') ? sitePath(href) : href);

function CopyMarkdown({ page }: { page: DocPage }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  useEffect(() => setState('idle'), [page.slug]);
  const copy = async () => {
    try {
      const response = await fetch(sitePath(`docs/${page.slug}.md`));
      const text = response.ok ? await response.text() : `# ${page.title}\n\n${resolveBody(page)}`;
      await navigator.clipboard.writeText(text);
      setState('copied');
    } catch {
      setState('failed');
    }
  };
  return (
    <Button variant="outline" size="sm" onClick={copy} aria-live="polite">
      {state === 'copied' ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      {state === 'copied' ? '已复制' : state === 'failed' ? '复制失败' : '复制 Markdown'}
    </Button>
  );
}

function DocsSidebar({ current, onNavigate, open }: { current: string; onNavigate: (event: MouseEvent<HTMLAnchorElement>, slug: string, hash?: string) => void; open: boolean }) {
  const [query, setQuery] = useState('');
  const normalized = query.trim().toLowerCase();
  return (
    <aside className={`docs-sidebar ${open ? 'is-open' : ''}`} aria-label="文档导航">
      <div className="docs-filter"><Search className="size-3.5" aria-hidden="true" /><Input aria-label="筛选文档" placeholder="筛选文档…" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
      <nav className="docs-nav">
        {docs.sections.map((section) => {
          const items = section.slugs.map((slug) => pages.get(slug)!).filter((page) => !normalized || `${page.title} ${page.description} ${page.slug}`.toLowerCase().includes(normalized));
          if (!items.length) return null;
          return (
            <section key={section.title}>
              <h2>{section.title}</h2>
              {items.map((page) => (
                <a key={page.slug} href={sitePath(`docs/${page.slug}`)} aria-current={page.slug === current ? 'page' : undefined} onClick={(event) => onNavigate(event, page.slug)}>{page.title}</a>
              ))}
            </section>
          );
        })}
      </nav>
      <a className="docs-llms" href={sitePath('llms.txt')}><FileText className="size-3.5" aria-hidden="true" />llms.txt</a>
    </aside>
  );
}

function Article({ page, onNavigate }: { page: DocPage; onNavigate: (event: MouseEvent<HTMLAnchorElement>, slug: string, hash?: string) => void }) {
  const body = useMemo(() => resolveBody(page), [page]);
  const toc = useMemo(() => outline(page.body), [page]);
  const index = order.indexOf(page.slug);
  const previous = pages.get(order[index - 1]);
  const next = pages.get(order[index + 1]);
  const linkClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const href = event.currentTarget.getAttribute('href') ?? '';
    const prefix = sitePath('docs/');
    if (href.startsWith(prefix) && !href.endsWith('.md')) {
      const [slug, hash] = href.slice(prefix.length).split('#');
      if (pages.has(slug)) onNavigate(event, slug, hash);
    }
  };
  const heading = (Tag: 'h2' | 'h3') => ({ children }: { children?: ReactNode }) => <Tag id={headingId(nodeText(children))}>{children}</Tag>;
  const components = useMemo(() => ({ h2: heading('h2'), h3: heading('h3') }), []);
  return (
    <>
      <article className="docs-article" aria-labelledby="docs-title">
        <div className="docs-breadcrumb">{page.section}</div>
        <h1 id="docs-title">{page.title}</h1>
        {page.description && <p className="docs-description">{page.description}</p>}
        <div className="docs-actions">
          <CopyMarkdown page={page} />
          <Button variant="ghost" size="sm" nativeButton={false} render={<a href={sitePath(`docs/${page.slug}.md`)} />}><FileText aria-hidden="true" />Markdown</Button>
          <Button variant="ghost" size="sm" nativeButton={false} render={<a href={`${repository}/blob/main/${page.source}`} target="_blank" rel="noreferrer" />}><Pencil aria-hidden="true" />在 GitHub 查看源文件</Button>
        </div>
        {page.component && (
          <div className="docs-component">
            <Suspense fallback={<div className="site-preview site-preview-loading"><Spinner /></div>}><ComponentPreview id={page.component.id} /></Suspense>
            <div className="docs-component-links">
              <a href={sitePath(`gallery/${page.component.id}`)}>组件库大图<ArrowRight className="size-3" aria-hidden="true" /></a>
              <a href={sitePath(`components/${page.component.id}`)}>在 Lab 中检查<ArrowRight className="size-3" aria-hidden="true" /></a>
              {page.component.storyId && <a href={storyLink(page.component.storyId)}>Storybook 参数调试<ArrowUpRight className="size-3" aria-hidden="true" /></a>}
            </div>
          </div>
        )}
        <MarkdownContent className="docs-prose" value={body} components={components} urlTransform={internalHref} onLinkClick={linkClick} externalLinkTarget="_blank" />
        <nav className="docs-pager" aria-label="上一页与下一页">
          {previous ? <a href={sitePath(`docs/${previous.slug}`)} onClick={(event) => onNavigate(event, previous.slug)}><span><ArrowLeft className="size-3" aria-hidden="true" />上一页</span>{previous.title}</a> : <span />}
          {next ? <a href={sitePath(`docs/${next.slug}`)} onClick={(event) => onNavigate(event, next.slug)} className="is-next"><span>下一页<ArrowRight className="size-3" aria-hidden="true" /></span>{next.title}</a> : <span />}
        </nav>
      </article>
      <aside className="docs-toc" aria-label="本页目录">
        {toc.length > 0 && <><h2>本页内容</h2>{toc.map((item, position) => <a key={`${item.id}-${position}`} href={`#${item.id}`} data-level={item.level}>{item.text}</a>)}</>}
      </aside>
    </>
  );
}

export function Docs({ slug: initial }: { slug: string }) {
  const [slug, setSlug] = useState(initial);
  const [menuOpen, setMenuOpen] = useState(false);
  const page = pages.get(slug);
  useEffect(() => {
    const restore = () => {
      const prefix = sitePath('docs/');
      setSlug(location.pathname.startsWith(prefix) ? decodeURIComponent(location.pathname.slice(prefix.length)) || 'introduction' : 'introduction');
    };
    addEventListener('popstate', restore);
    return () => removeEventListener('popstate', restore);
  }, []);
  useEffect(() => {
    if (location.pathname === sitePath('docs') || location.pathname === sitePath('docs/')) history.replaceState(null, '', sitePath('docs/introduction') + location.search + location.hash);
  }, []);
  useEffect(() => {
    if (location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
  }, [slug]);
  const navigate = (event: MouseEvent<HTMLAnchorElement>, target: string, hash?: string) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    history.pushState(null, '', sitePath(`docs/${target}`) + (hash ? `#${hash}` : ''));
    setSlug(target);
    setMenuOpen(false);
    if (!hash) scrollTo({ top: 0 });
  };
  return (
    <SiteFrame section="docs" title={page ? `${page.title} · Reito UI 文档` : '页面不存在 · Reito UI 文档'} footer={false}>
      <div className="docs-mobile-bar"><Button variant="ghost" size="sm" aria-expanded={menuOpen} aria-controls="docs-layout" onClick={() => setMenuOpen(!menuOpen)}><Menu aria-hidden="true" />文档目录</Button></div>
      <div id="docs-layout" className="docs-layout">
        <DocsSidebar current={slug} onNavigate={navigate} open={menuOpen} />
        <main id="site-main" className="docs-main" tabIndex={-1}>
          {page ? <Article key={page.slug} page={page} onNavigate={navigate} /> : (
            <Empty>
              <EmptyHeader><EmptyTitle>没有这一页</EmptyTitle><EmptyDescription>链接可能已过期。可以从介绍开始，或在左侧筛选文档。</EmptyDescription></EmptyHeader>
              <Button nativeButton={false} render={<a href={sitePath('docs/introduction')} onClick={(event) => navigate(event, 'introduction')} />}>打开介绍</Button>
            </Empty>
          )}
        </main>
      </div>
    </SiteFrame>
  );
}
