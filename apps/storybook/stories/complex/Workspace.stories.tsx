import { useMemo, type ComponentProps } from 'react';
import { useArgs } from 'storybook/preview-api';
import { LayoutDashboard, ListTodo, Settings } from 'lucide-react';
import { textControl, booleanControl, choiceControl, rangeControl, recipeControl } from '../feature-controls.js';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '../../../../packages/ui/src/basic.js';
import { AppShell, ResizableWorkspace, WorkspacePane, useWorkspaceLayoutState, type WorkspaceLayoutStorage } from '../../../../packages/ui/src/complex/index.js';
import { WorkspaceDemo } from '../../../../packages/ui/src/complex/catalog.js';
const meta = { title: '复杂/Workspace 工作区布局', component: WorkspaceDemo, parameters: { docs: { description: { component: 'AppShell 定义外壳，WorkspacePane 拥有单个滚动内容区，ResizableWorkspace 提供受控或非受控的两栏指针/键盘缩放。useWorkspaceLayoutState 负责 Sidebar 与分栏比例的版本化恢复、迁移和持久化。' } } } } satisfies Meta<typeof WorkspaceDemo>;
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

type PlaygroundArgs = Pick<ComponentProps<typeof ResizableWorkspace>, 'orientation' | 'defaultPrimaryPercent' | 'minPanelPercent'> & { controlled: boolean; primaryPercent: number; title: string; primaryTitle: string; secondaryTitle: string; description: string; scroll: boolean };
export const Playground: StoryObj<PlaygroundArgs> = {
 name: '参数调试', args: { orientation: 'horizontal', defaultPrimaryPercent: 30, controlled: true, primaryPercent: 30, minPanelPercent: 20, title: '本地工作区', primaryTitle: '文件目录', secondaryTitle: '文件预览', description: '与当前工作相关的内容。', scroll: true },
 argTypes: { orientation: choiceControl(['horizontal', 'vertical']), defaultPrimaryPercent: { ...rangeControl(20, 80), description: '非受控模式的初始主面板百分比。' }, controlled: booleanControl, primaryPercent: { ...rangeControl(20, 80), description: '受控模式的主面板百分比；键盘或指针调整会更新当前 Control。' }, minPanelPercent: rangeControl(5, 45), title: recipeControl(textControl, 'AppShell.header'), primaryTitle: recipeControl(textControl, '主 WorkspacePane.title'), secondaryTitle: recipeControl(textControl, '辅助 WorkspacePane.title'), description: recipeControl(textControl, '辅助 WorkspacePane.description'), scroll: recipeControl(booleanControl, '两个 WorkspacePane.scroll') },
 parameters: { controls: { include: ['orientation', 'controlled', 'primaryPercent', 'defaultPrimaryPercent', 'minPanelPercent', 'title', 'primaryTitle', 'secondaryTitle', 'description', 'scroll'] } },
 render: function PlaygroundRender(args) { const [, updateArgs] = useArgs<PlaygroundArgs>(); return <AppShell header={args.title} className="h-96"><ResizableWorkspace key={[args.orientation, args.defaultPrimaryPercent, args.minPanelPercent].join(':')} orientation={args.orientation} defaultPrimaryPercent={args.defaultPrimaryPercent} primaryPercent={args.controlled ? args.primaryPercent : undefined} onPrimaryPercentChange={(value, meta) => { if (args.controlled && meta.isUserInteraction) updateArgs({ primaryPercent: Math.round(value * 10) / 10 }); }} minPanelPercent={args.minPanelPercent} primaryLabel={args.primaryTitle} secondaryLabel={args.secondaryTitle} primary={<WorkspacePane title={args.primaryTitle} scroll={args.scroll} className="h-full"><p className="p-[var(--rui-content-padding)] text-sm">当前工作的目录与导航。</p></WorkspacePane>} secondary={<WorkspacePane title={args.secondaryTitle} description={args.description} scroll={args.scroll} className="h-full"><p className="p-[var(--rui-content-padding)] text-sm">主工作内容在这里展示。</p></WorkspacePane>} /></AppShell>; },
};
