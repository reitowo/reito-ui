import type { ComponentProps } from 'react';
import { textControl, booleanControl, choiceControl, rangeControl, recipeControl } from '../feature-controls.js';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { AppShell, ResizableWorkspace, WorkspacePane } from '../../../../packages/ui/src/complex/index.js';
import { WorkspaceDemo } from '../../../../packages/ui/src/complex/catalog.js';
const meta = { title: '复杂/Workspace 工作区布局', component: WorkspaceDemo, parameters: { docs: { description: { component: 'AppShell 定义外壳，WorkspacePane 拥有单个滚动内容区，ResizableWorkspace 提供两栏指针/键盘缩放。尺寸回调为百分比，不内置业务状态。' } } } } satisfies Meta<typeof WorkspaceDemo>;
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
export const Vertical: Story = { name: '纵向工作区与独立滚动', render: () => <AppShell className="h-[420px]" header="本地日志"><ResizableWorkspace orientation="vertical" primary={<WorkspacePane title="输出" className="h-full"><pre className="p-4 text-xs leading-loose">{Array.from({ length: 30 }, (_, index) => `本地事件 ${index + 1}：已读取示例记录`).join('\n')}</pre></WorkspacePane>} secondary={<WorkspacePane title="详情" className="h-full"><p className="p-4 text-sm text-muted-foreground">聚焦分隔线，使用上下方向键调整面板。</p></WorkspacePane>} /></AppShell> };

export const Default: Story = { name: '横向分栏', render: () => <AppShell className="h-96" header="本地工作区"><ResizableWorkspace primary={<WorkspacePane title="主面板" className="h-full"><p className="p-[var(--rui-content-padding)] text-sm">当前工作的内容。</p></WorkspacePane>} secondary={<WorkspacePane title="辅助面板" className="h-full"><p className="p-[var(--rui-content-padding)] text-sm text-muted-foreground">与当前工作相关的说明。</p></WorkspacePane>} /></AppShell> };
export const SinglePane: Story = { name: '单个工作面板', render: () => <WorkspacePane title="文件预览" className="h-64 rounded-lg border"><p className="p-[var(--rui-content-padding)] text-sm">面板负责标题与独立滚动区域。</p></WorkspacePane> };
export const WithInspector: Story = { name: '外壳与检查器', render: () => <AppShell className="h-80" header="本地工作区" inspector={<p className="text-sm text-muted-foreground">当前文件的属性。</p>}><WorkspacePane title="主工作面"><p className="p-[var(--rui-content-padding)] text-sm">工作内容占用可用空间，检查器提供相关上下文。</p></WorkspacePane></AppShell> };

type PlaygroundArgs = Pick<ComponentProps<typeof ResizableWorkspace>, 'orientation' | 'defaultPrimaryPercent' | 'minPanelPercent'> & { title: string; primaryTitle: string; secondaryTitle: string; description: string; scroll: boolean };
export const Playground: StoryObj<PlaygroundArgs> = {
 name: '参数调试', args: { orientation: 'horizontal', defaultPrimaryPercent: 30, minPanelPercent: 20, title: '本地工作区', primaryTitle: '文件目录', secondaryTitle: '文件预览', description: '与当前工作相关的内容。', scroll: true },
 argTypes: { orientation: choiceControl(['horizontal', 'vertical']), defaultPrimaryPercent: { ...rangeControl(20, 80), description: '初始主面板百分比；修改时重建分栏。拖动后的尺寸由组件管理。' }, minPanelPercent: rangeControl(5, 45), title: recipeControl(textControl, 'AppShell.header'), primaryTitle: recipeControl(textControl, '主 WorkspacePane.title'), secondaryTitle: recipeControl(textControl, '辅助 WorkspacePane.title'), description: recipeControl(textControl, '辅助 WorkspacePane.description'), scroll: recipeControl(booleanControl, '两个 WorkspacePane.scroll') },
 parameters: { controls: { include: ['orientation', 'defaultPrimaryPercent', 'minPanelPercent', 'title', 'primaryTitle', 'secondaryTitle', 'description', 'scroll'] } },
 render: args => <AppShell header={args.title} className="h-96"><ResizableWorkspace key={[args.orientation, args.defaultPrimaryPercent, args.minPanelPercent].join(':')} orientation={args.orientation} defaultPrimaryPercent={args.defaultPrimaryPercent} minPanelPercent={args.minPanelPercent} primaryLabel={args.primaryTitle} secondaryLabel={args.secondaryTitle} primary={<WorkspacePane title={args.primaryTitle} scroll={args.scroll} className="h-full"><p className="p-[var(--rui-content-padding)] text-sm">当前工作的目录与导航。</p></WorkspacePane>} secondary={<WorkspacePane title={args.secondaryTitle} description={args.description} scroll={args.scroll} className="h-full"><p className="p-[var(--rui-content-padding)] text-sm">主工作内容在这里展示。</p></WorkspacePane>} /></AppShell>,
};
