import { useState } from 'react';
import { useArgs } from 'storybook/preview-api';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Bookmark, ChevronLeft, ChevronRight, FileText, Link, Search } from 'lucide-react';
import { Button } from '../../../../packages/ui/src/basic.js';
import { MarkdownContent } from '../../../../packages/ui/src/ai/index.js';
import {
  ApplicationSearch,
  AppShell,
  ContentNavigation,
  ResourceView,
  Toolbar,
  WorkspacePreset,
  type CommandGroupDefinition,
  type ContentNavigationSection,
  type ResourceItem,
  type ResourceLayout,
  type WorkspacePresetView,
} from '../../../../packages/ui/src/complex/index.js';
import { booleanControl, choiceControl, recipeControl, textControl } from '../feature-controls.js';

type ContentState = 'ready' | 'empty' | 'loading' | 'error';

interface GuideDocument extends ResourceItem {
  category: string;
  readTime: string;
  sections: Array<{ id: string; title: string; description: string; markdown: string }>;
}

const documents: GuideDocument[] = [
  {
    id: 'guide-start',
    name: '快速开始',
    description: '安装、主题与第一个工作面',
    category: '指南',
    updatedAt: '2026-09-08T10:20:00Z',
    readTime: '4 分钟',
    sections: [
      { id: 'start-install', title: '安装', description: '引入组件、tokens 与全局样式', markdown: '安装工作区包后，从明确的层级入口导入组件。\n\n```tsx\nimport { Button } from "@reito/ui/basic";\nimport "@reito/tokens/css";\n```' },
      { id: 'start-theme', title: '主题与密度', description: '由文档根节点统一控制', markdown: '在 `html` 上设置主题和密度，弹层 portal 会继承同一环境。\n\n- `data-theme="dark | light"`\n- `data-density="compact | comfortable"`' },
      { id: 'start-compose', title: '组合工作面', description: '让当前任务占据主要空间', markdown: '使用 **AppShell** 和 **WorkspacePreset** 组合导航、内容与检查器。辅助面板按需显示，避免把每段内容包进卡片。' },
    ],
  },
  {
    id: 'guide-tokens',
    name: '设计 Tokens',
    description: '语义角色、密度与 Tailwind bridge',
    category: '规范',
    updatedAt: '2026-09-07T16:40:00Z',
    readTime: '6 分钟',
    sections: [
      { id: 'tokens-source', title: '唯一来源', description: '版本化 JSON 驱动生成结果', markdown: '`packages/tokens/src/tokens.json` 是唯一来源。修改后运行 `npm run tokens:build`，不要直接编辑生成 CSS。' },
      { id: 'tokens-semantic', title: '语义角色', description: '组件只消费工作语义', markdown: '| 用途 | 角色 |\n| --- | --- |\n| 页面 | `background` |\n| 次要文字 | `muted-foreground` |\n| 键盘焦点 | `ring` |' },
      { id: 'tokens-audit', title: '审计', description: '发现未登记的视觉常量', markdown: '运行 `npm run tokens:audit`，未批准项必须为零。结构例外需要在策略文件中给出准确原因。' },
    ],
  },
  {
    id: 'guide-storybook',
    name: 'Storybook 验收',
    description: 'Controls、状态与主题密度检查',
    category: '流程',
    updatedAt: '2026-09-06T11:15:00Z',
    readTime: '5 分钟',
    sections: [
      { id: 'stories-playground', title: '参数调试', description: '在同一 Canvas 调整公开能力', markdown: 'Playground 应消费 `args`，并通过 Controls 修改真实 props。受控交互要把状态同步回 Storybook。' },
      { id: 'stories-states', title: '状态覆盖', description: '固定预设保留可分享入口', markdown: '根据组件能力覆盖默认、禁用、加载、错误和空态。弹层补充 Escape 与焦点恢复，输入补充中文 IME。' },
      { id: 'stories-visual', title: '视觉核对', description: '主题、密度、窄屏与完整工作面', markdown: '自动测试证明行为和部分可访问性；视觉相似度仍需要检查完整页面、层级、边界与阅读空间。' },
    ],
  },
  {
    id: 'guide-ai',
    name: 'AI 工作面',
    description: '消息、上下文与宿主边界',
    category: '指南',
    updatedAt: '2026-09-05T09:30:00Z',
    readTime: '7 分钟',
    sections: [
      { id: 'ai-message', title: '消息内容', description: '正文保持自然文档流', markdown: '消息正文使用共享 14px 界面尺度。Markdown 表格和代码在自己的容器滚动，不扩大整页宽度。' },
      { id: 'ai-host', title: '宿主职责', description: '请求、权限和持久化由应用管理', markdown: '组件只接收数据与回调。真实模型请求、工具执行、授权、取消和恢复都必须由宿主显式实现。' },
    ],
  },
];

interface ContentWorkspaceRecipeProps {
  title?: string;
  libraryState: ContentState;
  onLibraryStateChange?: (state: ContentState) => void;
  readerState: ContentState;
  onReaderStateChange?: (state: ContentState) => void;
  documentId: string;
  onDocumentIdChange: (id: string) => void;
  sectionId: string;
  onSectionIdChange: (id: string) => void;
  query: string;
  onQueryChange: (query: string) => void;
  libraryLayout: ResourceLayout;
  onLibraryLayoutChange: (layout: ResourceLayout) => void;
  layoutMode: 'auto' | 'wide' | 'narrow';
  readerMode: 'auto' | 'wide' | 'narrow';
  outerView: WorkspacePresetView;
  onOuterViewChange: (view: WorkspacePresetView) => void;
  readerView: WorkspacePresetView;
  onReaderViewChange: (view: WorkspacePresetView) => void;
  searchOpen: boolean;
  onSearchOpenChange: (open: boolean) => void;
  saved: boolean;
  onSavedChange: (saved: boolean) => void;
  emptyMessage?: string;
}

function ContentWorkspaceRecipe({
  title = 'Reito 文档',
  libraryState,
  onLibraryStateChange,
  readerState,
  onReaderStateChange,
  documentId,
  onDocumentIdChange,
  sectionId,
  onSectionIdChange,
  query,
  onQueryChange,
  libraryLayout,
  onLibraryLayoutChange,
  layoutMode,
  readerMode,
  outerView,
  onOuterViewChange,
  readerView,
  onReaderViewChange,
  searchOpen,
  onSearchOpenChange,
  saved,
  onSavedChange,
  emptyMessage = '文档库中还没有内容。',
}: ContentWorkspaceRecipeProps) {
  const [receipt, setReceipt] = useState('本地示例尚未执行操作');
  const currentIndex = documents.findIndex(document => document.id === documentId);
  const current = currentIndex >= 0 ? documents[currentIndex] : undefined;
  const previous = currentIndex > 0 ? documents[currentIndex - 1] : undefined;
  const next = currentIndex >= 0 && currentIndex < documents.length - 1 ? documents[currentIndex + 1] : undefined;

  const openDocument = (id: string) => {
    const document = documents.find(item => item.id === id);
    if (!document) return;
    onDocumentIdChange(id);
    onSectionIdChange(document.sections[0]?.id ?? '');
    onOuterViewChange({ ...outerView, activePanel: 'workspace' });
    onReaderViewChange({ ...readerView, activePanel: 'workspace' });
    setReceipt(`已在本地打开：${document.name}`);
  };

  const contentSections: ContentNavigationSection[] = current?.sections.map(section => ({
    id: section.id,
    title: section.title,
    description: section.description,
    content: <MarkdownContent value={section.markdown} />,
  })) ?? [];

  const commands: CommandGroupDefinition[] = [
    { id: 'documents', label: '文档', commands: documents.map(document => ({ id: `document-${document.id}`, label: document.name, description: document.description, icon: <FileText />, actionLabel: '打开', keywords: [document.category, document.readTime] })) },
    { id: 'sections', label: '当前文档', commands: (current?.sections ?? []).map(section => ({ id: `section-${section.id}`, label: section.title, description: section.description, actionLabel: '定位' })) },
    { id: 'actions', label: '操作', commands: [{ id: 'action-save', label: saved ? '取消收藏当前文档' : '收藏当前文档', actionLabel: saved ? '取消' : '收藏' }, { id: 'action-copy', label: '复制当前文档链接', actionLabel: '复制' }] },
  ];

  const toolbar = <Toolbar
    label="文档操作"
    overflow="menu"
    maxVisibleItems={4}
    groups={[
      { id: 'find', label: '查找', items: [{ id: 'search', label: '搜索', icon: <Search />, showLabel: true, overflow: 'never', onSelect: () => onSearchOpenChange(true) }] },
      { id: 'move', label: '翻页', items: [
        { id: 'previous', label: '上一篇', icon: <ChevronLeft />, disabled: !previous, onSelect: () => previous && openDocument(previous.id) },
        { id: 'next', label: '下一篇', icon: <ChevronRight />, disabled: !next, onSelect: () => next && openDocument(next.id) },
      ] },
      { id: 'related', label: '相关操作', items: [
        { id: 'saved', label: '收藏', icon: <Bookmark />, kind: 'toggle', pressed: saved, onPressedChange: onSavedChange, onSelect: () => setReceipt(saved ? '已在本地取消收藏' : '已在本地收藏当前文档') },
        { id: 'copy', label: '复制链接', icon: <Link />, overflow: 'always', onSelect: () => setReceipt(`已在本地记录链接：${current?.id ?? '无文档'}`) },
      ] },
    ]}
  />;

  const libraryItems = libraryState === 'empty' || libraryState === 'loading' ? [] : documents;
  const library = <div className="min-w-0 p-[var(--rui-preview-padding)]">
    <ResourceView
      items={libraryItems}
      label="文档库"
      layout={libraryLayout}
      onLayoutChange={onLibraryLayoutChange}
      query={query}
      onQueryChange={onQueryChange}
      sort="name-asc"
      pageSize={8}
      selectionMode="single"
      selectedIds={current ? [current.id] : []}
      onSelectionChange={ids => { const id = ids.at(-1); if (id) openDocument(id); }}
      loading={libraryState === 'loading'}
      error={libraryState === 'error' ? '文档索引读取失败，正文仍保留上次内容。' : undefined}
      onRetry={() => onLibraryStateChange?.('ready')}
      emptyMessage={emptyMessage}
    />
  </div>;

  const reader = !current
    ? <p role="status" className="p-[var(--rui-empty-padding)] text-center text-sm text-muted-foreground">{emptyMessage}</p>
    : readerState === 'loading'
      ? <div aria-busy="true" role="status" className="p-[var(--rui-empty-padding)] text-center text-sm text-muted-foreground">正在加载正文…</div>
      : readerState === 'error'
        ? <div role="alert" className="grid justify-items-start gap-[var(--rui-content-gap)] p-[var(--rui-empty-padding)] text-sm text-destructive"><p>正文读取失败，已保留当前文档选择。</p><Button size="sm" variant="outline" onClick={() => onReaderStateChange?.('ready')}>重试加载正文</Button></div>
        : <ContentNavigation
          className="h-full"
          sections={readerState === 'empty' ? [] : contentSections}
          value={sectionId}
          onValueChange={onSectionIdChange}
          title="文档结构"
          navigationTitle="页内目录"
          contentTitle="正文"
          navigationLabel={`${current.name}目录`}
          contentLabel={`${current.name}正文`}
          emptyMessage="此文档还没有正文。"
          layoutMode={readerMode}
          layoutView={readerView}
          onLayoutViewChange={onReaderViewChange}
        />;

  return <AppShell
    className="h-svh rounded-none border-0"
    header={<div className="flex min-w-0 items-center gap-[var(--rui-content-gap)]"><div className="min-w-0 flex-1"><p className="truncate font-medium">{title}</p><p className="truncate text-xs text-muted-foreground">{current ? `${current.name} · ${current.readTime}` : '未选择文档'}</p></div>{toolbar}</div>}
    footer={<span role="status">{receipt} · {documents.length} 篇本地文档</span>}
  >
    <WorkspacePreset
      className="h-full rounded-none border-0"
      mode={layoutMode}
      title="内容工作面"
      navigation={{ title: '文档库', description: '本地内容索引', content: library }}
      workspace={{
        title: current?.name ?? '阅读',
        description: current?.description,
        content: reader,
        scroll: !current || readerState !== 'ready',
        footer: current && <nav aria-label="相邻文档" className="flex min-w-0 items-center justify-between gap-[var(--rui-content-gap)]"><Button size="xs" variant="ghost" disabled={!previous} onClick={() => previous && openDocument(previous.id)}><ChevronLeft />{previous?.name ?? '上一篇'}</Button><Button size="xs" variant="ghost" disabled={!next} onClick={() => next && openDocument(next.id)}>{next?.name ?? '下一篇'}<ChevronRight /></Button></nav>,
      }}
      view={outerView}
      onViewChange={onOuterViewChange}
      navigationLabel="文档"
      workspaceLabel="阅读"
      wideControlsLabel="内容工作区面板"
      narrowControlsLabel="内容工作区面板"
    />
    <ApplicationSearch
      open={searchOpen}
      onOpenChange={onSearchOpenChange}
      groups={commands}
      context={current ? `${title} / ${current.name}` : title}
      contextLabel="当前阅读"
      label="搜索文档与章节"
      placeholder="搜索文档、章节或操作…"
      onSelect={command => {
        if (command.id.startsWith('document-')) openDocument(command.id.slice('document-'.length));
        else if (command.id.startsWith('section-')) { onSectionIdChange(command.id.slice('section-'.length)); onReaderViewChange({ ...readerView, activePanel: 'workspace' }); setReceipt(`已定位：${command.label}`); }
        else if (command.id === 'action-save') { onSavedChange(!saved); setReceipt(saved ? '已在本地取消收藏' : '已在本地收藏当前文档'); }
        else if (command.id === 'action-copy') setReceipt(`已在本地记录链接：${current?.id ?? '无文档'}`);
      }}
    />
  </AppShell>;
}

function LocalContentRecipe({ initialLibraryState = 'ready', initialReaderState = 'ready', mode = 'wide', readerMode = 'wide', initialDocumentId = 'guide-start', initialOuterPanel = 'workspace' }: { initialLibraryState?: ContentState; initialReaderState?: ContentState; mode?: ContentWorkspaceRecipeProps['layoutMode']; readerMode?: ContentWorkspaceRecipeProps['readerMode']; initialDocumentId?: string; initialOuterPanel?: WorkspacePresetView['activePanel'] }) {
  const initialDocument = documents.find(document => document.id === initialDocumentId);
  const [libraryState, setLibraryState] = useState(initialLibraryState);
  const [readerState, setReaderState] = useState(initialReaderState);
  const [documentId, setDocumentId] = useState(initialDocumentId);
  const [sectionId, setSectionId] = useState(initialDocument?.sections[0]?.id ?? '');
  const [query, setQuery] = useState('');
  const [layout, setLayout] = useState<ResourceLayout>('list');
  const [outerView, setOuterView] = useState<WorkspacePresetView>({ navigationOpen: true, inspectorOpen: false, activePanel: initialOuterPanel });
  const [readerView, setReaderView] = useState<WorkspacePresetView>({ navigationOpen: true, inspectorOpen: false, activePanel: 'workspace' });
  const [searchOpen, setSearchOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  return <ContentWorkspaceRecipe title="Reito 文档" libraryState={libraryState} onLibraryStateChange={setLibraryState} readerState={readerState} onReaderStateChange={setReaderState} documentId={documentId} onDocumentIdChange={setDocumentId} sectionId={sectionId} onSectionIdChange={setSectionId} query={query} onQueryChange={setQuery} libraryLayout={layout} onLibraryLayoutChange={setLayout} layoutMode={mode} readerMode={readerMode} outerView={outerView} onOuterViewChange={setOuterView} readerView={readerView} onReaderViewChange={setReaderView} searchOpen={searchOpen} onSearchOpenChange={setSearchOpen} saved={saved} onSavedChange={setSaved} />;
}

const defaultView: WorkspacePresetView = { navigationOpen: true, inspectorOpen: false, activePanel: 'workspace' };
const meta = { id: "复杂-contentrecipe-内容工作面配方",
  title: "复杂/ContentRecipe 内容工作面配方",
  component: ContentWorkspaceRecipe,
  args: {
    libraryState: 'ready',
    readerState: 'ready',
    documentId: 'guide-start',
    onDocumentIdChange: () => {},
    sectionId: 'start-install',
    onSectionIdChange: () => {},
    query: '',
    onQueryChange: () => {},
    libraryLayout: 'list',
    onLibraryLayoutChange: () => {},
    layoutMode: 'wide',
    readerMode: 'wide',
    outerView: defaultView,
    onOuterViewChange: () => {},
    readerView: defaultView,
    onReaderViewChange: () => {},
    searchOpen: false,
    onSearchOpenChange: () => {},
    saved: false,
    onSavedChange: () => {},
  },
  parameters: { layout: 'fullscreen', docs: { story: { inline: false, height: 'var(--rui-container-lg)' }, description: { component: '应用级内容配方：直接复用 ResourceView、ContentNavigation、MarkdownContent、Toolbar、ApplicationSearch、WorkspacePreset 与 AppShell。配方位于 Storybook，不新增公共 Content 原语；全部内容与动作均为本地示例。' } } },
} satisfies Meta<typeof ContentWorkspaceRecipe>;
export default meta;
type Story = StoryObj<typeof meta>;

type PlaygroundArgs = {
  title: string;
  libraryState: ContentState;
  readerState: ContentState;
  documentId: string;
  sectionId: string;
  query: string;
  libraryLayout: ResourceLayout;
  layoutMode: 'auto' | 'wide' | 'narrow';
  readerMode: 'auto' | 'wide' | 'narrow';
  outerPanel: 'navigation' | 'workspace';
  readerPanel: 'navigation' | 'workspace';
  searchOpen: boolean;
  saved: boolean;
  emptyMessage: string;
};

export const Playground: StoryObj<PlaygroundArgs> = {
  name: "参数调试",
  args: { title: 'Reito 文档', libraryState: 'ready', readerState: 'ready', documentId: 'guide-start', sectionId: 'start-install', query: '', libraryLayout: 'list', layoutMode: 'wide', readerMode: 'wide', outerPanel: 'workspace', readerPanel: 'workspace', searchOpen: false, saved: false, emptyMessage: '文档库中还没有内容。' },
  argTypes: {
    title: textControl,
    libraryState: recipeControl(choiceControl(['ready', 'empty', 'loading', 'error']), '文档列表的本地数据状态。'),
    readerState: recipeControl(choiceControl(['ready', 'empty', 'loading', 'error']), '当前正文的本地数据状态。'),
    documentId: choiceControl(['', ...documents.map(document => document.id)]),
    sectionId: choiceControl(['', ...documents.flatMap(document => document.sections.map(section => section.id))]),
    query: textControl,
    libraryLayout: choiceControl(['list', 'grid']),
    layoutMode: choiceControl(['auto', 'wide', 'narrow']),
    readerMode: choiceControl(['auto', 'wide', 'narrow']),
    outerPanel: choiceControl(['navigation', 'workspace']),
    readerPanel: choiceControl(['navigation', 'workspace']),
    searchOpen: booleanControl,
    saved: booleanControl,
    emptyMessage: textControl,
  },
  parameters: { controls: { include: ['title', 'libraryState', 'readerState', 'documentId', 'sectionId', 'query', 'libraryLayout', 'layoutMode', 'readerMode', 'outerPanel', 'readerPanel', 'searchOpen', 'saved', 'emptyMessage'] } },
  render: function PlaygroundRender(args) {
    const [, updateArgs] = useArgs<PlaygroundArgs>();
    const outerView: WorkspacePresetView = { navigationOpen: true, inspectorOpen: false, activePanel: args.outerPanel };
    const readerView: WorkspacePresetView = { navigationOpen: true, inspectorOpen: false, activePanel: args.readerPanel };
    return <ContentWorkspaceRecipe {...args} outerView={outerView} readerView={readerView} onLibraryStateChange={libraryState => updateArgs({ libraryState })} onReaderStateChange={readerState => updateArgs({ readerState })} onDocumentIdChange={documentId => { const document = documents.find(item => item.id === documentId); updateArgs({ documentId, sectionId: document?.sections[0]?.id ?? '', outerPanel: 'workspace', readerPanel: 'workspace' }); }} onSectionIdChange={sectionId => updateArgs({ sectionId })} onQueryChange={query => updateArgs({ query })} onLibraryLayoutChange={libraryLayout => updateArgs({ libraryLayout })} onOuterViewChange={view => updateArgs({ outerPanel: view.activePanel as PlaygroundArgs['outerPanel'] })} onReaderViewChange={view => updateArgs({ readerPanel: view.activePanel as PlaygroundArgs['readerPanel'] })} onSearchOpenChange={searchOpen => updateArgs({ searchOpen })} onSavedChange={saved => updateArgs({ saved })} />;
  },
};

export const Default: Story = { name: "内容阅读工作面", render: () => <LocalContentRecipe /> };
export const Narrow: Story = { name: "窄屏文档选择与阅读", render: () => <LocalContentRecipe mode="narrow" readerMode="narrow" initialOuterPanel="navigation" /> };
export const GridLibrary: Story = { name: "网格文档库", render: function Render() { const [layout, setLayout] = useState<ResourceLayout>('grid'); const [documentId, setDocumentId] = useState('guide-tokens'); const [sectionId, setSectionId] = useState('tokens-source'); const [query, setQuery] = useState(''); const [outerView, setOuterView] = useState(defaultView); const [readerView, setReaderView] = useState(defaultView); return <ContentWorkspaceRecipe title="网格文档库" libraryState="ready" readerState="ready" documentId={documentId} onDocumentIdChange={setDocumentId} sectionId={sectionId} onSectionIdChange={setSectionId} query={query} onQueryChange={setQuery} libraryLayout={layout} onLibraryLayoutChange={setLayout} layoutMode="wide" readerMode="wide" outerView={outerView} onOuterViewChange={setOuterView} readerView={readerView} onReaderViewChange={setReaderView} searchOpen={false} onSearchOpenChange={() => {}} saved={false} onSavedChange={() => {}} />; } };
export const EmptyLibrary: Story = { name: "空文档库", render: () => <LocalContentRecipe initialLibraryState="empty" initialDocumentId="" /> };
export const LoadingLibrary: Story = { name: "文档库加载中", render: () => <LocalContentRecipe initialLibraryState="loading" initialDocumentId="" /> };
export const ErrorLibrary: Story = { name: "文档索引失败与恢复", render: () => <LocalContentRecipe initialLibraryState="error" /> };
export const EmptyDocument: Story = { name: "空正文", render: () => <LocalContentRecipe initialReaderState="empty" /> };
export const LoadingDocument: Story = { name: "正文加载中", render: () => <LocalContentRecipe initialReaderState="loading" /> };
export const ErrorDocument: Story = { name: "正文失败与恢复", render: () => <LocalContentRecipe initialReaderState="error" /> };
export const Interactive: Story = {
  name: "交互 · 选择、定位与收藏",
  render: () => <LocalContentRecipe mode="narrow" readerMode="narrow" initialOuterPanel="navigation" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '选择 设计 Tokens' }));
    await expect(canvas.getByRole('heading', { name: '设计 Tokens' })).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: '目录' }));
    await userEvent.click(canvas.getByRole('treeitem', { name: /语义角色/ }));
    await userEvent.click(canvas.getByRole('button', { name: '正文' }));
    await expect(canvas.getByRole('heading', { name: '语义角色' })).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: '收藏' }));
    await expect(canvas.getByRole('button', { name: '收藏' })).toHaveAttribute('aria-pressed', 'true');
    await expect(canvas.getByRole('status')).toHaveTextContent('已在本地收藏当前文档');
  },
};
