import { useArgs } from 'storybook/preview-api';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Bold, Columns3, Eye, Italic, LoaderCircle, PanelRightOpen, Redo2, Share2, Undo2, WrapText } from 'lucide-react';
import { Toolbar, type ToolbarGroup, type ToolbarOverflow, type ToolbarSize } from '../../../../packages/ui/src/complex/toolbar.js';
import { ToolbarDemo } from '../../../../packages/ui/src/complex/catalog.js';
import { booleanControl, numberControl, textControl } from '../feature-controls.js';

const meta = {
  title: '复杂/Toolbar 工具栏',
  component: Toolbar,
  args: { label: '编辑操作', groups: [] },
  tags: ['autodocs'],
  parameters: {
    docs: {
      story: { inline: false, height: 'var(--rui-container-lg)' },
      description: {
        component: '紧凑桌面操作栏：相关命令以带名称的组分隔，切换项公开 pressed 状态。scroll 策略保留所有行内动作并允许横向滚动；menu 策略按显式可见数量把低优先级动作移入 Base UI 菜单。行内控件使用单一 Tab 停靠点，方向键与 Home/End 在可用动作间移动。',
      },
    },
  },
} satisfies Meta<typeof Toolbar>;
export default meta;
type Story = StoryObj<typeof meta>;

type PlaygroundArgs = {
  label: string;
  size: ToolbarSize;
  overflow: ToolbarOverflow;
  maxVisibleItems: number;
  showLabels: boolean;
  disabled: boolean;
  bold: boolean;
  busy: boolean;
  status: string;
  receipt: string;
};

function groupsFor(args: Pick<PlaygroundArgs, 'bold' | 'busy'>, update?: (next: Partial<PlaygroundArgs>) => void): ToolbarGroup[] {
  const select = (label: string) => update?.({ receipt: `已触发：${label}（本地示例）` });
  return [
    { id: 'history', label: '历史', items: [
      { id: 'undo', label: '撤销', icon: <Undo2 aria-hidden="true" />, shortcut: 'Control+Z', overflow: 'never', onSelect: () => select('撤销') },
      { id: 'redo', label: '重做', icon: <Redo2 aria-hidden="true" />, shortcut: 'Control+Shift+Z', disabled: true, onSelect: () => select('重做') },
    ] },
    { id: 'format', label: '格式', items: [
      { id: 'bold', label: '加粗', icon: <Bold aria-hidden="true" />, kind: 'toggle', pressed: args.bold, shortcut: 'Control+B', onPressedChange: bold => update?.({ bold, receipt: bold ? '已打开加粗。' : '已关闭加粗。' }) },
      { id: 'italic', label: '斜体', icon: <Italic aria-hidden="true" />, kind: 'toggle', pressed: false, onPressedChange: pressed => update?.({ receipt: pressed ? '已打开斜体。' : '已关闭斜体。' }) },
      { id: 'wrap', label: '自动换行', icon: <WrapText aria-hidden="true" />, kind: 'toggle', pressed: true, onPressedChange: pressed => update?.({ receipt: pressed ? '已打开自动换行。' : '已关闭自动换行。' }) },
    ] },
    { id: 'view', label: '视图与共享', items: [
      { id: 'preview', label: '打开预览', icon: <Eye aria-hidden="true" />, onSelect: () => select('打开预览') },
      { id: 'split', label: '拆分编辑器', icon: <Columns3 aria-hidden="true" />, onSelect: () => select('拆分编辑器') },
      { id: 'inspector', label: '打开检查器', icon: <PanelRightOpen aria-hidden="true" />, overflow: 'always', onSelect: () => select('打开检查器') },
      { id: 'share', label: '共享快照', icon: <Share2 aria-hidden="true" />, loading: args.busy, overflow: 'always', onSelect: () => select('共享快照') },
    ] },
  ];
}

export const Playground: StoryObj<PlaygroundArgs> = {
  name: '参数调试',
  args: { label: '编辑操作', size: 'xs', overflow: 'menu', maxVisibleItems: 4, showLabels: false, disabled: false, bold: true, busy: false, status: '本地草稿', receipt: '等待操作。' },
  argTypes: {
    label: textControl,
    size: { control: 'select', options: ['xs', 'sm'] },
    overflow: { control: 'select', options: ['scroll', 'menu'] },
    maxVisibleItems: { ...numberControl, control: { type: 'number', min: 0, max: 9, step: 1 } },
    showLabels: booleanControl,
    disabled: booleanControl,
    bold: booleanControl,
    busy: booleanControl,
    status: textControl,
    receipt: { control: false },
  },
  parameters: { controls: { include: ['label', 'size', 'overflow', 'maxVisibleItems', 'showLabels', 'disabled', 'bold', 'busy', 'status'] } },
  render: function PlaygroundRender(args) {
    const [, updateArgs] = useArgs<PlaygroundArgs>();
    return <div className="grid gap-[var(--rui-content-gap-sm)]">
      <Toolbar {...args} groups={groupsFor(args, updateArgs)} onItemSelect={item => item.kind !== 'toggle' && updateArgs({ receipt: `已选择：${String(item.label)}。` })} />
      <p role="status" className="text-xs text-muted-foreground">{args.receipt}</p>
    </div>;
  },
};

export const Default: Story = { name: '默认本地示例', render: () => <ToolbarDemo /> };

export const ActionGroups: Story = {
  name: '命令分组',
  render: () => <Toolbar label="文件操作" groups={groupsFor({ bold: false, busy: false }).slice(0, 2)} showLabels />,
};

export const ToggleStates: Story = {
  name: '切换状态',
  render: () => <Toolbar label="格式状态" groups={groupsFor({ bold: true, busy: false }).slice(1, 2)} />,
};

export const MenuOverflow: Story = {
  name: '溢出菜单',
  render: () => <div className="w-[var(--rui-container-xs)] max-w-full"><Toolbar label="窄编辑操作" groups={groupsFor({ bold: true, busy: false })} overflow="menu" maxVisibleItems={3} /></div>,
};

export const ScrollOverflow: Story = {
  name: '横向滚动保留动作',
  render: () => <div className="w-[var(--rui-container-2xs)] max-w-full"><Toolbar label="可滚动编辑操作" groups={groupsFor({ bold: true, busy: false })} overflow="scroll" showLabels /></div>,
};

export const DisabledAndLoading: Story = {
  name: '禁用与忙碌',
  render: () => <Toolbar label="任务操作" groups={groupsFor({ bold: false, busy: true })} overflow="menu" maxVisibleItems={5} />,
};

export const StatusAndLabels: Story = {
  name: '文字标签与状态',
  render: () => <Toolbar label="工作区操作" groups={groupsFor({ bold: true, busy: false }).slice(0, 2)} size="sm" showLabels status="已保存" />,
};

export const KeyboardNavigation: Story = {
  name: '方向键漫游焦点',
  render: () => <Toolbar label="键盘编辑操作" groups={groupsFor({ bold: false, busy: false })} overflow="menu" maxVisibleItems={3} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const undo = canvas.getByRole('button', { name: '撤销' });
    undo.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('button', { name: '加粗' })).toHaveFocus();
    await userEvent.keyboard('{End}');
    await expect(canvas.getByRole('button', { name: '更多操作' })).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect(undo).toHaveFocus();
  },
};

export const EntireToolbarDisabled: Story = {
  name: '整栏禁用',
  render: () => <Toolbar label="只读编辑操作" groups={groupsFor({ bold: true, busy: false })} overflow="menu" maxVisibleItems={4} disabled status="只读" />,
};

export const CustomLoadingIcon: Story = {
  name: '宿主状态内容',
  render: () => <Toolbar label="同步操作" groups={[{ id: 'sync', label: '同步', items: [{ id: 'syncing', label: '正在同步', icon: <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" />, disabled: true, showLabel: true }] }]} status="2 / 4" />,
};
