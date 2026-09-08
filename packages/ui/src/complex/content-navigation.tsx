import * as React from 'react';
import { TreeView, type TreeViewNode } from './tree-view.js';
import { WorkspacePreset, type WorkspacePresetProps, type WorkspacePresetView } from './workspace.js';
import { cx } from './shared.js';

export interface ContentNavigationSection {
  id: string;
  title: string;
  description?: string;
  content?: React.ReactNode;
  disabled?: boolean;
  children?: ContentNavigationSection[];
}
export interface ContentNavigationChangeMeta {
  reason: 'navigation' | 'scroll';
}
export interface ContentNavigationProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'children' | 'onChange'> {
  sections: ContentNavigationSection[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string, meta: ContentNavigationChangeMeta) => void;
  title?: React.ReactNode;
  navigationTitle?: React.ReactNode;
  contentTitle?: React.ReactNode;
  navigationLabel?: string;
  contentLabel?: string;
  emptyMessage?: string;
  emptySectionMessage?: string;
  scrollBehavior?: ScrollBehavior;
  layoutMode?: WorkspacePresetProps['mode'];
  layoutView?: WorkspacePresetView;
  defaultLayoutView?: Partial<WorkspacePresetView>;
  onLayoutViewChange?: (view: WorkspacePresetView) => void;
}

interface FlatContentSection {
  section: ContentNavigationSection;
  level: number;
}

function flattenSections(sections: ContentNavigationSection[], level = 1): FlatContentSection[] {
  return sections.flatMap(section => [
    { section, level },
    ...flattenSections(section.children ?? [], level + 1),
  ]);
}

function toTreeNodes(sections: ContentNavigationSection[]): TreeViewNode[] {
  return sections.map(section => ({
    id: section.id,
    label: section.title,
    description: section.description,
    disabled: section.disabled,
    children: section.children ? toTreeNodes(section.children) : undefined,
  }));
}

function sectionTop(viewport: HTMLElement, section: HTMLElement) {
  return section.getBoundingClientRect().top - viewport.getBoundingClientRect().top + viewport.scrollTop;
}

/** A host-neutral table of contents synchronized with one document scroll region. */
export function ContentNavigation({
  sections,
  value,
  defaultValue,
  onValueChange,
  title = '文档',
  navigationTitle = '目录',
  contentTitle = '正文',
  navigationLabel = '文档目录',
  contentLabel = '文档正文',
  emptyMessage = '没有可显示的章节',
  emptySectionMessage = '此章节暂无内容',
  scrollBehavior = 'auto',
  layoutMode = 'auto',
  layoutView,
  defaultLayoutView,
  onLayoutViewChange,
  className,
  ...props
}: ContentNavigationProps) {
  const flat = React.useMemo(() => flattenSections(sections), [sections]);
  const tree = React.useMemo(() => toTreeNodes(sections), [sections]);
  const branchIds = React.useMemo(() => flat.filter(item => item.section.children).map(item => item.section.id), [flat]);
  const knownIds = React.useMemo(() => new Set(flat.map(item => item.section.id)), [flat]);
  const firstEnabledId = flat.find(item => !item.section.disabled)?.section.id;
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? firstEnabledId);
  const selected = value ?? internalValue;
  const current = selected && knownIds.has(selected) ? selected : firstEnabledId;
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const sectionRefs = React.useRef(new Map<string, HTMLElement>());
  const frameRef = React.useRef<number | undefined>(undefined);
  const pendingControlledValue = React.useRef<string | undefined>(undefined);
  const programmaticTarget = React.useRef<string | undefined>(undefined);
  const headingPrefix = React.useId();

  const emit = React.useCallback((id: string, reason: ContentNavigationChangeMeta['reason']) => {
    if (value === undefined) setInternalValue(id);
    pendingControlledValue.current = id;
    onValueChange?.(id, { reason });
  }, [onValueChange, value]);

  const scrollToSection = React.useCallback((id: string, behavior: ScrollBehavior) => {
    const viewport = viewportRef.current;
    const section = sectionRefs.current.get(id);
    if (!viewport || !section) return;
    programmaticTarget.current = id;
    viewport.scrollTo({ top: sectionTop(viewport, section), behavior });
    requestAnimationFrame(() => {
      const lastId = flat.at(-1)?.section.id;
      const atEnd = viewport.scrollTop + viewport.clientHeight >= viewport.scrollHeight - 1;
      const reached = Math.abs(viewport.scrollTop - sectionTop(viewport, section)) <= 1 || (atEnd && id === lastId);
      if (reached && programmaticTarget.current === id) programmaticTarget.current = undefined;
    });
  }, [flat]);

  React.useEffect(() => {
    if (!value || !knownIds.has(value)) return;
    if (pendingControlledValue.current === value) {
      pendingControlledValue.current = undefined;
      return;
    }
    scrollToSection(value, scrollBehavior);
  }, [knownIds, scrollBehavior, scrollToSection, value]);

  React.useEffect(() => () => {
    if (frameRef.current !== undefined) cancelAnimationFrame(frameRef.current);
  }, []);

  const synchronizeScroll = React.useCallback(() => {
    if (frameRef.current !== undefined) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = undefined;
      const viewport = viewportRef.current;
      if (!viewport || !flat.length) return;
      const atEnd = viewport.scrollTop + viewport.clientHeight >= viewport.scrollHeight - 1;
      let candidate = atEnd ? flat.at(-1)?.section.id : flat[0]?.section.id;
      if (!atEnd) {
        const marker = viewport.scrollTop + 1;
        for (const item of flat) {
          const element = sectionRefs.current.get(item.section.id);
          if (!element || sectionTop(viewport, element) > marker) break;
          candidate = item.section.id;
        }
      }
      const target = programmaticTarget.current;
      if (target) {
        const targetElement = sectionRefs.current.get(target);
        const lastId = flat.at(-1)?.section.id;
        const reached = Boolean(targetElement) && (Math.abs(viewport.scrollTop - sectionTop(viewport, targetElement!)) <= 1 || (atEnd && target === lastId));
        if (reached) programmaticTarget.current = undefined;
        return;
      }
      if (candidate && candidate !== current) emit(candidate, 'scroll');
    });
  }, [current, emit, flat]);

  React.useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.addEventListener('scroll', synchronizeScroll, { passive: true });
    return () => viewport.removeEventListener('scroll', synchronizeScroll);
  }, [synchronizeScroll]);

  const choose = (id: string) => {
    if (!knownIds.has(id)) return;
    emit(id, 'navigation');
    scrollToSection(id, scrollBehavior);
  };

  const navigation = <TreeView
    nodes={tree}
    value={current}
    currentId={current}
    defaultExpanded={branchIds}
    onValueChange={choose}
    label={navigationLabel}
    emptyMessage={emptyMessage}
  />;
  const document = flat.length ? <article aria-label={contentLabel} className="min-w-0 p-[var(--rui-preview-padding)]">
    {flat.map(({ section, level }) => {
      const Heading = `h${Math.min(6, level + 1)}` as keyof React.JSX.IntrinsicElements;
      const headingId = `${headingPrefix}-${section.id}-heading`;
      return <section
        key={section.id}
        ref={element => { if (element) sectionRefs.current.set(section.id, element); else sectionRefs.current.delete(section.id); }}
        data-current={current === section.id || undefined}
        aria-labelledby={headingId}
        className="min-w-0 border-l-[length:var(--rui-outline-width)] border-transparent py-[var(--rui-space-3)] pl-[var(--rui-content-padding)] first:pt-0 data-current:border-primary"
      >
        <Heading id={headingId} className={cx('break-words font-semibold tracking-tight', level === 1 ? 'text-base' : 'text-sm')}>{section.title}</Heading>
        {section.description && <p className="mt-[var(--rui-space-1)] text-xs text-muted-foreground">{section.description}</p>}
        <div className="mt-[var(--rui-space-2)] min-w-0 text-sm leading-relaxed">{section.content ?? <p className="text-muted-foreground">{emptySectionMessage}</p>}</div>
      </section>;
    })}
  </article> : <p role="status" className="p-[var(--rui-empty-padding)] text-center text-sm text-muted-foreground">{emptyMessage}</p>;

  return <div {...props} data-slot="content-navigation" className={cx('min-h-0 min-w-0', className)}>
    <WorkspacePreset
      className="h-full rounded-none"
      mode={layoutMode}
      title={title}
      navigation={{ title: navigationTitle, content: navigation }}
      workspace={{ title: contentTitle, content: document, bodyRef: viewportRef }}
      view={layoutView}
      defaultView={{ navigationOpen: true, inspectorOpen: false, activePanel: 'workspace', ...defaultLayoutView }}
      onViewChange={onLayoutViewChange}
      navigationLabel="目录"
      workspaceLabel="正文"
    />
  </div>;
}
