import { useState, type ComponentProps } from 'react';
import { useArgs } from 'storybook/preview-api';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Button } from '../../../../packages/ui/src/basic.js';
import { ContentNavigation, type ContentNavigationSection, type WorkspacePresetPanelId, type WorkspacePresetView } from '../../../../packages/ui/src/complex/index.js';
import { booleanControl, choiceControl, recipeControl, textControl } from '../feature-controls.js';

function Paragraphs({ label, count = 7 }: { label: string; count?: number }) {
  return <div className="space-y-[var(--rui-content-gap)]">{Array.from({ length: count }, (_, index) => <p key={index}>{label}的第 {index + 1} 段本地示例，用于验证阅读位置和目录同步。</p>)}</div>;
}

const sections: ContentNavigationSection[] = [
  { id: 'overview', title: '概览', description: '组件目标与边界', content: <Paragraphs label="概览" /> },
  { id: 'usage', title: '使用方式', description: '受控位置与滚动', content: <Paragraphs label="使用方式" />, children: [
    { id: 'keyboard', title: '键盘操作', description: '方向键与 Enter', content: <Paragraphs label="键盘操作" count={5} /> },
    { id: 'routing', title: '路由同步', description: '由宿主保存章节 ID', content: <Paragraphs label="路由同步" count={5} /> },
  ] },
  { id: 'tokens', title: '视觉与 tokens', content: <Paragraphs label="视觉规范" /> },
  { id: 'boundary', title: '宿主集成边界', content: <Paragraphs label="宿主边界" /> },
];

const meta = {
  title: '复杂/ContentNavigation 文档导航',
  component: ContentNavigation,
  args: { sections },
  parameters: { docs: { description: { component: 'ContentNavigation 组合 TreeView 与 WorkspacePreset，使目录选择、正文滚动和受控路由值保持一致。正文节点由宿主提供，组件不绑定 Markdown 解析器或路由库。' } } },
} satisfies Meta<typeof ContentNavigation>;
export default meta;
type Story = StoryObj<typeof meta>;

function ControlledExample({ initial = 'overview', mode = 'wide', source = sections }: { initial?: string; mode?: ComponentProps<typeof ContentNavigation>['layoutMode']; source?: ContentNavigationSection[] }) {
  const [current, setCurrent] = useState(initial);
  const [reason, setReason] = useState('初始');
  return <div className="grid gap-[var(--rui-content-gap)]">
    <div className="flex flex-wrap gap-[var(--rui-content-gap-sm)]">
      <Button type="button" size="xs" variant="outline" onClick={() => setCurrent('overview')}>路由到概览</Button>
      <Button type="button" size="xs" variant="outline" onClick={() => setCurrent('boundary')}>路由到边界</Button>
      <span role="status" className="self-center text-xs text-muted-foreground">当前位置：{current} · {reason}</span>
    </div>
    <ContentNavigation className="h-[var(--rui-container-lg)]" sections={source} value={current} onValueChange={(id, meta) => { setCurrent(id); setReason(meta.reason); }} layoutMode={mode} title="Reito UI 指南" contentTitle="组件设计" />
  </div>;
}

function NavigationVisibilityExample() {
  const [view, setView] = useState<WorkspacePresetView>({ navigationOpen: false, inspectorOpen: false, activePanel: 'workspace' });
  return <ContentNavigation className="h-[var(--rui-container-lg)]" sections={sections} layoutMode="wide" layoutView={view} onLayoutViewChange={setView} title="专注阅读" />;
}

export const Default: Story = { name: '默认文档工作面', render: () => <ControlledExample /> };
export const Nested: Story = { name: '嵌套目录', render: () => <ControlledExample initial="keyboard" /> };
export const ControlledRoute: Story = { name: '受控路由定位', render: () => <ControlledExample /> };
export const ScrollSynchronization: Story = { name: '正文滚动同步目录', render: () => <ControlledExample /> };
export const LongTitle: Story = { name: '长标题与截断', render: () => <ControlledExample source={[...sections, { id: 'long', title: '这是一个非常长的章节标题，用于验证紧凑导航列中的截断与正文工作面中的自然换行行为', description: '完整标题保留在可访问名称与 title 中', content: <Paragraphs label="长标题" /> }]} /> };
export const EmptySection: Story = { name: '空章节', render: () => <ControlledExample source={[...sections.slice(0, 1), { id: 'empty', title: '暂未编写的章节' }]} initial="empty" /> };
export const EmptyDocument: Story = { name: '空文档', render: () => <ContentNavigation className="h-80" sections={[]} title="空白指南" /> };
export const DisabledSection: Story = { name: '禁用目录项', render: () => <ControlledExample source={[sections[0]!, { ...sections[1]!, disabled: true }]} /> };
export const NarrowLayout: Story = { name: '窄屏目录与正文切换', render: () => <div className="max-w-[var(--rui-container-sm)]"><ControlledExample mode="narrow" /></div> };
export const NavigationHidden: Story = { name: '宽布局隐藏目录', render: () => <NavigationVisibilityExample /> };

export const Interactive: Story = {
  name: '交互场景：键盘选择与滚动联动',
  render: () => <ControlledExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tree = canvas.getByRole('tree', { name: '文档目录' });
    const overview = within(tree).getByRole('treeitem', { name: /概览/ });
    const usage = within(tree).getByRole('treeitem', { name: /使用方式/ });
    overview.focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(usage).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('status')).toHaveTextContent('当前位置：usage · navigation');
    await expect(usage).toHaveAttribute('aria-current', 'location');
  },
};

type PlaygroundArgs = {
  layoutMode: 'auto' | 'wide' | 'narrow';
  current: string;
  navigationOpen: boolean;
  activePanel: WorkspacePresetPanelId;
  scrollBehavior: ScrollBehavior;
  title: string;
  navigationTitle: string;
  contentTitle: string;
  emptyMessage: string;
  emptySectionMessage: string;
  longTitle: boolean;
  emptyDocument: boolean;
  emptySection: boolean;
  disabledSection: boolean;
};

export const Playground: StoryObj<PlaygroundArgs> = {
  name: '参数调试',
  args: { layoutMode: 'auto', current: 'overview', navigationOpen: true, activePanel: 'workspace', scrollBehavior: 'auto', title: 'Reito UI 指南', navigationTitle: '目录', contentTitle: '组件设计', emptyMessage: '没有可显示的章节', emptySectionMessage: '此章节暂无内容', longTitle: false, emptyDocument: false, emptySection: false, disabledSection: false },
  argTypes: {
    layoutMode: choiceControl(['auto', 'wide', 'narrow']),
    current: choiceControl(['overview', 'usage', 'keyboard', 'routing', 'tokens', 'boundary', 'empty', 'long']),
    navigationOpen: booleanControl,
    activePanel: choiceControl(['navigation', 'workspace']),
    scrollBehavior: choiceControl(['auto', 'smooth']),
    title: textControl,
    navigationTitle: textControl,
    contentTitle: textControl,
    emptyMessage: textControl,
    emptySectionMessage: textControl,
    longTitle: recipeControl(booleanControl, '追加长标题章节。'),
    emptyDocument: recipeControl(booleanControl, '传入空 sections。'),
    emptySection: recipeControl(booleanControl, '追加无 content 的章节。'),
    disabledSection: recipeControl(booleanControl, '禁用“使用方式”目录项。'),
  },
  parameters: { controls: { include: ['layoutMode', 'current', 'navigationOpen', 'activePanel', 'scrollBehavior', 'title', 'navigationTitle', 'contentTitle', 'emptyMessage', 'emptySectionMessage', 'longTitle', 'emptyDocument', 'emptySection', 'disabledSection'] } },
  render: function PlaygroundRender(args) {
    const [, updateArgs] = useArgs<PlaygroundArgs>();
    const source: ContentNavigationSection[] = args.emptyDocument ? [] : [
      ...sections.map(section => section.id === 'usage' ? { ...section, disabled: args.disabledSection } : section),
      ...(args.emptySection ? [{ id: 'empty', title: '暂未编写的章节' }] : []),
      ...(args.longTitle ? [{ id: 'long', title: '这是一个非常长的章节标题，用于验证紧凑导航列中的截断与正文工作面中的自然换行行为', content: <Paragraphs label="长标题" /> }] : []),
    ];
    const view: WorkspacePresetView = { navigationOpen: args.navigationOpen, inspectorOpen: false, activePanel: args.activePanel };
    return <ContentNavigation className="h-[var(--rui-container-lg)]" sections={source} value={args.current} onValueChange={(current) => updateArgs({ current })} layoutMode={args.layoutMode} layoutView={view} onLayoutViewChange={next => updateArgs({ navigationOpen: next.navigationOpen, activePanel: next.activePanel })} scrollBehavior={args.scrollBehavior} title={args.title} navigationTitle={args.navigationTitle} contentTitle={args.contentTitle} emptyMessage={args.emptyMessage} emptySectionMessage={args.emptySectionMessage} />;
  },
};
