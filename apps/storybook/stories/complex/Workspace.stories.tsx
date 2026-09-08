import { useMemo, type ComponentProps } from 'react';
import { useArgs } from 'storybook/preview-api';
import { LayoutDashboard, ListTodo, Settings } from 'lucide-react';
import { textControl, booleanControl, choiceControl, rangeControl, recipeControl } from '../feature-controls.js';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '../../../../packages/ui/src/basic.js';
import { AppShell, ResizableWorkspace, WorkspacePane, WorkspacePreset, useWorkspaceLayoutState, useWorkspacePresetState, type WorkspaceLayoutStorage, type WorkspacePresetPanelId, type WorkspacePresetSlot, type WorkspacePresetView } from '../../../../packages/ui/src/complex/index.js';
import { WorkspaceDemo } from '../../../../packages/ui/src/complex/catalog.js';
const meta = { title: '复杂/Workspace 工作区布局', component: WorkspaceDemo, parameters: { docs: { description: { component: 'AppShell 定义自由外壳，WorkspacePane 拥有单个滚动内容区，ResizableWorkspace 保留基础两栏缩放。WorkspacePreset 提供导航、主工作面和检查器槽位，在窄布局切换单面板；useWorkspacePresetState 独立保存显隐与当前面板。' } } } } satisfies Meta<typeof WorkspaceDemo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Interactive: Story = {
  name: '交互场景：文件目录与可调整预览',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const file = canvas.getByRole('button', { name: 'input.tsx' });
    file.focus();
    await userEvent.keyboard('{Enter}');
    await expect(file).toHaveAttribute('aria-pressed', 'true');
    const preview = canvas.getByRole('region', { name: '文件预览' });
    await expect(within(preview).getByRole('heading', { name: 'input' })).toBeVisible();
    const directory = canvas.getByRole('region', { name: '文件目录' });
    const before = directory.getBoundingClientRect().width;
    await expect(before).toBeLessThan(preview.getBoundingClientRect().width);
    const separator = canvas.getByRole('separator', { name: '调整文件目录与文件预览的大小' });
    separator.focus();
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(directory.getBoundingClientRect().width).toBeGreaterThan(before));
    await expect(separator).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    await waitFor(() => expect(Math.abs(directory.getBoundingClientRect().width - before)).toBeLessThanOrEqual(1));
    await expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth + 1);
  },
};
export const Vertical: Story = { name: '纵向工作区与独立滚动', render: () => <AppShell className="h-[420px]" header="本地日志"><ResizableWorkspace orientation="vertical" primary={<WorkspacePane title="输出" className="h-full"><pre className="p-[var(--rui-content-padding)] text-xs leading-loose">{Array.from({ length: 30 }, (_, index) => `本地事件 ${index + 1}：已读取示例记录`).join('\n')}</pre></WorkspacePane>} secondary={<WorkspacePane title="详情" className="h-full"><p className="p-[var(--rui-content-padding)] text-sm text-muted-foreground">聚焦分隔线，使用上下方向键调整面板。</p></WorkspacePane>} /></AppShell> };

export const Default: Story = { name: '横向分栏', render: () => <AppShell className="h-96" header="本地工作区"><ResizableWorkspace primary={<WorkspacePane title="主面板" className="h-full"><p className="p-[var(--rui-content-padding)] text-sm">当前工作的内容。</p></WorkspacePane>} secondary={<WorkspacePane title="辅助面板" className="h-full"><p className="p-[var(--rui-content-padding)] text-sm text-muted-foreground">与当前工作相关的说明。</p></WorkspacePane>} /></AppShell> };
export const SinglePane: Story = { name: '单个工作面板', render: () => <WorkspacePane title="文件预览" className="h-64 rounded-lg border"><p className="p-[var(--rui-content-padding)] text-sm">面板负责标题与独立滚动区域。</p></WorkspacePane> };
export const WithInspector: Story = { name: '外壳与检查器', render: () => <AppShell className="h-80" header="本地工作区" inspector={<p className="text-sm text-muted-foreground">当前文件的属性。</p>}><WorkspacePane title="主工作面"><p className="p-[var(--rui-content-padding)] text-sm">工作内容占用可用空间，检查器提供相关上下文。</p></WorkspacePane></AppShell> };

function memoryStorage(initial: string | null): WorkspaceLayoutStorage {
  let value = initial;
  return {
    getItem: () => value,
    setItem: (_key, next) => { value = next; },
    removeItem: () => { value = null; },
  };
}

function StatefulWorkspace({ storage, storageKey = 'reito.story.workspace', defaultPrimaryPercent = 34 }: { storage?: WorkspaceLayoutStorage | null; storageKey?: string; defaultPrimaryPercent?: number }) {
  const layout = useWorkspaceLayoutState({ storage, storageKey, defaultPrimaryPercent, defaultSidebarOpen: true, minPanelPercent: 20 });
  return <SidebarProvider className="h-[var(--rui-container-lg)] min-h-0" open={layout.state.sidebarOpen} onOpenChange={layout.setSidebarOpen} persistOpen={false}>
    <Sidebar collapsible="icon">
      <SidebarContent><SidebarGroup><SidebarGroupLabel>工作区</SidebarGroupLabel><SidebarGroupContent><SidebarMenu>
        {[{ label: '概览', Icon: LayoutDashboard }, { label: '任务', Icon: ListTodo }, { label: '设置', Icon: Settings }].map(({ label, Icon }) => <SidebarMenuItem key={label}><SidebarMenuButton isActive={label === '概览'} aria-label={label}><Icon /><span>{label}</span></SidebarMenuButton></SidebarMenuItem>)}
      </SidebarMenu></SidebarGroupContent></SidebarGroup></SidebarContent>
    </Sidebar>
    <SidebarInset className="min-h-0">
      <header className="flex shrink-0 flex-wrap items-center gap-[var(--rui-content-gap-sm)] border-b border-border px-[var(--rui-content-padding)] py-[var(--rui-cell-padding-y)]">
        <SidebarTrigger aria-label="切换持久化侧栏" />
        <span className="text-sm font-medium">持久化工作区</span>
        <Button type="button" size="xs" variant="ghost" onClick={() => layout.setPrimaryPercent(35)}>35 / 65</Button>
        <Button type="button" size="xs" variant="ghost" onClick={() => layout.setPrimaryPercent(60)}>60 / 40</Button>
        <Button type="button" size="xs" variant="ghost" onClick={layout.reset}>重置布局</Button>
      </header>
      <div className="min-h-0 flex-1">
        <ResizableWorkspace primaryLabel="项目导航" secondaryLabel="文件内容" primaryPercent={layout.state.primaryPercent} minPanelPercent={20} onPrimaryPercentChange={(value, meta) => { if (meta.isUserInteraction) layout.setPrimaryPercent(value); }} primary={<WorkspacePane title="项目导航" className="h-full"><p className="p-[var(--rui-content-padding)] text-sm">侧栏与分栏比例由同一个版本化状态管理。</p></WorkspacePane>} secondary={<WorkspacePane title="文件内容" className="h-full"><p className="p-[var(--rui-content-padding)] text-sm text-muted-foreground">键盘调整分隔线后，比例会保存并在重新挂载时恢复。</p></WorkspacePane>} />
      </div>
      <p role="status" className="shrink-0 border-t border-border px-[var(--rui-content-padding)] py-[var(--rui-cell-padding-y)] text-xs text-muted-foreground">来源：{layout.source} · 侧栏：{layout.state.sidebarOpen ? '展开' : '折叠'} · 主面板：{Math.round(layout.state.primaryPercent)}%</p>
    </SidebarInset>
  </SidebarProvider>;
}

export const PersistedLayout: Story = { name: '持久化侧栏与分栏', parameters: { layout: 'fullscreen', docs: { story: { inline: false, height: 'var(--rui-container-lg)' } } }, render: () => <StatefulWorkspace /> };

export const LegacyLayout: Story = {
  name: '旧配置迁移',
  parameters: { layout: 'fullscreen', docs: { story: { inline: false, height: 'var(--rui-container-lg)' } } },
  render: function LegacyRender() {
    const storage = useMemo(() => memoryStorage(JSON.stringify({ sidebar: false, layout: { primary: 42, secondary: 58 } })), []);
    return <StatefulWorkspace storage={storage} storageKey="legacy-layout" />;
  },
};

export const InvalidLayoutFallback: Story = {
  name: '非法尺寸回退',
  parameters: { layout: 'fullscreen', docs: { story: { inline: false, height: 'var(--rui-container-lg)' } } },
  render: function InvalidRender() {
    const storage = useMemo(() => memoryStorage(JSON.stringify({ version: 1, sidebarOpen: false, primaryPercent: 140 })), []);
    return <StatefulWorkspace storage={storage} storageKey="invalid-layout" defaultPrimaryPercent={38} />;
  },
};

export const StorageUnavailable: Story = {
  name: '存储不可用',
  parameters: { layout: 'fullscreen', docs: { story: { inline: false, height: 'var(--rui-container-lg)' } } },
  render: function UnavailableRender() {
    const storage = useMemo<WorkspaceLayoutStorage>(() => ({ getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } }), []);
    return <StatefulWorkspace storage={storage} storageKey="unavailable-layout" defaultPrimaryPercent={40} />;
  },
};

const navigationSlot: WorkspacePresetSlot = {
  title: '项目',
  content: <nav aria-label="项目文件" className="grid gap-[var(--rui-space-1)] p-[var(--rui-content-padding)]">{['src', 'components', 'Workspace.tsx', 'stories', 'docs'].map((item, index) => <Button key={item} type="button" size="xs" variant={index === 2 ? 'secondary' : 'ghost'} className="w-full justify-start">{item}</Button>)}</nav>,
};
const workspaceSlot: WorkspacePresetSlot = {
  title: 'Workspace.tsx',
  description: '主工作面保持优先',
  content: <div className="space-y-[var(--rui-content-gap)] p-[var(--rui-content-padding)]">{Array.from({ length: 24 }, (_, index) => <p key={index} className="text-sm leading-relaxed">第 {index + 1} 行本地示例内容，用于验证主工作面自己的滚动区域。</p>)}</div>,
};
const inspectorSlot: WorkspacePresetSlot = {
  title: '检查器',
  content: <dl className="grid gap-[var(--rui-content-gap)] p-[var(--rui-content-padding)] text-xs">{Array.from({ length: 18 }, (_, index) => <div key={index} className="grid gap-[var(--rui-space-1)]"><dt className="text-muted-foreground">属性 {index + 1}</dt><dd>本地值 {index + 1}</dd></div>)}</dl>,
};

function PresetExample({ mode = 'wide', storage, storageKey = 'reito.story.workspace-preset', defaultActivePanel = 'workspace' }: { mode?: 'auto' | 'wide' | 'narrow'; storage?: WorkspaceLayoutStorage | null; storageKey?: string; defaultActivePanel?: WorkspacePresetPanelId }) {
  const preset = useWorkspacePresetState({ storage, storageKey, defaultActivePanel });
  return <WorkspacePreset className="h-[var(--rui-container-lg)]" mode={mode} title="组件工作区" navigation={navigationSlot} workspace={workspaceSlot} inspector={inspectorSlot} view={preset.state} onViewChange={preset.setView} footer={`来源：${preset.source} · 当前：${preset.state.activePanel} · 导航：${preset.state.navigationOpen ? '开' : '关'} · 检查器：${preset.state.inspectorOpen ? '开' : '关'}`} />;
}

export const PresetDesktop: Story = { name: '布局预设：宽工作面', render: () => <PresetExample /> };
export const PresetNarrow: Story = { name: '布局预设：窄屏面板切换', render: () => <div className="max-w-[var(--rui-container-sm)]"><PresetExample mode="narrow" /></div> };
export const PresetAuto: Story = { name: '布局预设：容器自适应', render: () => <PresetExample mode="auto" /> };
export const PresetIndependentScroll: Story = { name: '布局预设：槽位独立滚动', render: () => <PresetExample mode="wide" /> };
export const PresetOptionalPanels: Story = { name: '布局预设：可选辅助面板', render: () => <WorkspacePreset className="h-80" mode="auto" title="单工作面" workspace={{ ...workspaceSlot, content: <p className="p-[var(--rui-content-padding)] text-sm">导航和检查器不是必填槽位。</p> }} /> };

export const PresetPersisted: Story = {
  name: '布局预设：持久化视图',
  render: function PersistedPresetRender() {
    const storage = useMemo(() => memoryStorage(JSON.stringify({ version: 1, navigationOpen: false, inspectorOpen: true, activePanel: 'inspector' })), []);
    return <PresetExample mode="narrow" storage={storage} storageKey="preset-current" />;
  },
};

export const PresetLegacy: Story = {
  name: '布局预设：旧状态迁移',
  render: function LegacyPresetRender() {
    const storage = useMemo(() => memoryStorage(JSON.stringify({ navigation: true, inspector: false, panel: 'navigation' })), []);
    return <PresetExample mode="narrow" storage={storage} storageKey="preset-legacy" />;
  },
};

export const PresetStorageUnavailable: Story = {
  name: '布局预设：存储不可用',
  render: function UnavailablePresetRender() {
    const storage = useMemo<WorkspaceLayoutStorage>(() => ({ getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } }), []);
    return <PresetExample mode="wide" storage={storage} storageKey="preset-unavailable" />;
  },
};

type PlaygroundArgs = Pick<ComponentProps<typeof ResizableWorkspace>, 'orientation' | 'defaultPrimaryPercent' | 'minPanelPercent'> & { preset: boolean; presetMode: 'auto' | 'wide' | 'narrow'; navigationOpen: boolean; inspectorOpen: boolean; activePanel: WorkspacePresetPanelId; controlled: boolean; primaryPercent: number; title: string; primaryTitle: string; secondaryTitle: string; description: string; scroll: boolean };
export const Playground: StoryObj<PlaygroundArgs> = {
 name: '参数调试', args: { preset: true, presetMode: 'auto', navigationOpen: true, inspectorOpen: true, activePanel: 'workspace', orientation: 'horizontal', defaultPrimaryPercent: 30, controlled: true, primaryPercent: 30, minPanelPercent: 20, title: '本地工作区', primaryTitle: '文件目录', secondaryTitle: '文件预览', description: '与当前工作相关的内容。', scroll: true },
 argTypes: { preset: booleanControl, presetMode: choiceControl(['auto', 'wide', 'narrow']), navigationOpen: booleanControl, inspectorOpen: booleanControl, activePanel: choiceControl(['navigation', 'workspace', 'inspector']), orientation: choiceControl(['horizontal', 'vertical']), defaultPrimaryPercent: { ...rangeControl(20, 80), description: '非受控模式的初始主面板百分比。' }, controlled: booleanControl, primaryPercent: { ...rangeControl(20, 80), description: '受控模式的主面板百分比；键盘或指针调整会更新当前 Control。' }, minPanelPercent: rangeControl(5, 45), title: recipeControl(textControl, 'AppShell.header / WorkspacePreset.title'), primaryTitle: recipeControl(textControl, '主 WorkspacePane.title'), secondaryTitle: recipeControl(textControl, '辅助 WorkspacePane.title'), description: recipeControl(textControl, '辅助 WorkspacePane.description'), scroll: recipeControl(booleanControl, 'WorkspacePane.scroll') },
 parameters: { controls: { include: ['preset', 'presetMode', 'navigationOpen', 'inspectorOpen', 'activePanel', 'orientation', 'controlled', 'primaryPercent', 'defaultPrimaryPercent', 'minPanelPercent', 'title', 'primaryTitle', 'secondaryTitle', 'description', 'scroll'] } },
 render: function PlaygroundRender(args) { const [, updateArgs] = useArgs<PlaygroundArgs>(); const presetView: WorkspacePresetView = { navigationOpen: args.navigationOpen, inspectorOpen: args.inspectorOpen, activePanel: args.activePanel }; return args.preset ? <WorkspacePreset title={args.title} className="h-96" mode={args.presetMode} navigation={{ ...navigationSlot, scroll: args.scroll, title: args.primaryTitle }} workspace={{ ...workspaceSlot, scroll: args.scroll, title: args.secondaryTitle, description: args.description }} inspector={{ ...inspectorSlot, scroll: args.scroll }} view={presetView} onViewChange={view => updateArgs(view)} /> : <AppShell header={args.title} className="h-96"><ResizableWorkspace key={[args.orientation, args.defaultPrimaryPercent, args.minPanelPercent].join(':')} orientation={args.orientation} defaultPrimaryPercent={args.defaultPrimaryPercent} primaryPercent={args.controlled ? args.primaryPercent : undefined} onPrimaryPercentChange={(value, meta) => { if (args.controlled && meta.isUserInteraction) updateArgs({ primaryPercent: Math.round(value * 10) / 10 }); }} minPanelPercent={args.minPanelPercent} primaryLabel={args.primaryTitle} secondaryLabel={args.secondaryTitle} primary={<WorkspacePane title={args.primaryTitle} scroll={args.scroll} className="h-full"><p className="p-[var(--rui-content-padding)] text-sm">当前工作的目录与导航。</p></WorkspacePane>} secondary={<WorkspacePane title={args.secondaryTitle} description={args.description} scroll={args.scroll} className="h-full"><p className="p-[var(--rui-content-padding)] text-sm">主工作内容在这里展示。</p></WorkspacePane>} /></AppShell>; },
};
