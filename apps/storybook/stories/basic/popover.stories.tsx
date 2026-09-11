import { useArgs } from "storybook/preview-api";
import { Button, Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverTitle, PopoverDescription, PopoverList, PopoverListItem } from '../../../../packages/ui/src/basic.js';
import type { Meta, StoryObj } from "@storybook/react-vite";
import { PopoverDemo } from "../../../../packages/ui/src/basic/catalog.js";

const meta = { id: "基础-popover",
  title: "基础/Popover 弹出面板",
  component: PopoverDemo,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "与触发器关联的辅助设置。 使用官方 shadcn Base UI / base-nova 组合 API；交互只更新本地示例状态。",
      },
    },
  },
} satisfies Meta<typeof PopoverDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: "交互演示",
};

function EvidenceList({ long = false, empty = false, stacked = false }: { long?: boolean; empty?: boolean; stacked?: boolean }) {
  const rows = empty ? [] : long ? Array.from({length: 30}, (_, index) => ({ label: `/api/v1/workspaces/research/requests/${index}/observations/details`, metadata: `GET · ${index + 1} 次` })) : [
    {label: '/health', metadata: 'HEAD · 16 次'},
    {label: '/health/readiness', metadata: 'HEAD · 3 次'},
    {label: '路径未记录', metadata: 'HEAD · 2 次'},
  ];
  return <Popover defaultOpen><PopoverTrigger render={<Button variant="outline" />}>查看请求路径</PopoverTrigger>
    <PopoverContent variant="list" align="start" aria-label="请求路径" className="max-w-[min(var(--rui-container-xs),var(--available-width))]">
      {empty ? <p role="status" className="m-0 px-[var(--rui-cell-padding-x)] py-[var(--rui-cell-padding-y)] text-muted-foreground">暂无请求路径</p> : <PopoverList aria-label="请求路径列表">{rows.map(row => <PopoverListItem key={row.label} metadata={row.metadata} layout={stacked ? 'stacked' : 'inline'}><code title={row.label}>{row.label}</code></PopoverListItem>)}</PopoverList>}
    </PopoverContent>
  </Popover>;
}
export const CompactList: Story = { parameters: { docs: { story: { inline: false, height: 'var(--rui-container-lg)' } } }, name: '紧凑单行列表', render: () => <EvidenceList /> };
export const LongList: Story = { parameters: { docs: { story: { inline: false, height: 'var(--rui-container-lg)' } } }, name: '长路径与滚动', render: () => <EvidenceList long /> };
export const StackedList: Story = { parameters: { docs: { story: { inline: false, height: 'var(--rui-container-lg)' } } }, name: '显式多行', render: () => <EvidenceList stacked /> };
export const EmptyList: Story = { parameters: { docs: { story: { inline: false, height: 'var(--rui-container-lg)' } } }, name: '空列表', render: () => <EvidenceList empty /> };

function OpenPopover({ align = 'center' }: { align?: 'start' | 'center' | 'end' }) { return <Popover defaultOpen><PopoverTrigger render={<Button variant="outline" />}>查看工作区信息</PopoverTrigger><PopoverContent align={align}><PopoverHeader><PopoverTitle>研究工作台</PopoverTitle><PopoverDescription>本地组件预览空间。</PopoverDescription></PopoverHeader><p>包含基础、复杂与 AI 三层组件。</p></PopoverContent></Popover>; }
export const Default: Story = { name: "打开的浮层", parameters: { docs: { story: { inline: false, height: 'var(--rui-container-lg)' } } }, render: () => <OpenPopover /> };
export const StartAligned: Story = { name: "起点对齐", parameters: { docs: { story: { inline: false, height: 'var(--rui-container-lg)' } } }, render: () => <OpenPopover align="start" /> };
export const EndAligned: Story = { name: "终点对齐", parameters: { docs: { story: { inline: false, height: 'var(--rui-container-lg)' } } }, render: () => <OpenPopover align="end" /> };

export const Playground: StoryObj<{ open: boolean; align: 'start' | 'center' | 'end'; side: 'top' | 'right' | 'bottom' | 'left'; title: string; description: string }> = {
  name: "参数调试", args: { open: false, align: 'center', side: 'bottom', title: '研究工作台', description: '本地组件预览空间。' },
  argTypes: { open: { control: 'boolean' }, align: { control: 'select', options: ['start', 'center', 'end'], table: { category: 'PopoverContent' } }, side: { control: 'select', options: ['top', 'right', 'bottom', 'left'], table: { category: 'PopoverContent' } }, title: { control: 'text', table: { category: '组合示例' }, description: 'PopoverTitle 的 children。' }, description: { control: 'text', table: { category: '组合示例' }, description: 'PopoverDescription 的 children。' } },
  parameters: { controls: { include: ['open', 'align', 'side', 'title', 'description'] }, docs: { story: { inline: false, height: 'var(--rui-container-lg)' } } },
  render: function Render(args) { const [, updateArgs] = useArgs(); return <div className="flex min-h-40 items-center justify-center"><Popover open={args.open} onOpenChange={open => updateArgs({ open })}><PopoverTrigger render={<Button variant="outline" />}>查看工作区信息</PopoverTrigger><PopoverContent align={args.align} side={args.side}><PopoverHeader><PopoverTitle>{args.title}</PopoverTitle><PopoverDescription>{args.description}</PopoverDescription></PopoverHeader></PopoverContent></Popover></div>; },
};
