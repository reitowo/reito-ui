import { useArgs } from "storybook/preview-api";
import { Plus } from 'lucide-react';
import { Button, Tooltip, TooltipTrigger, TooltipContent, Kbd } from '../../../../packages/ui/src/basic.js';
import type { Meta, StoryObj } from "@storybook/react-vite";
import { TooltipDemo } from "../../../../packages/ui/src/basic/catalog.js";

const meta = {
  title: "基础/Tooltip",
  component: TooltipDemo,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "悬停与键盘焦点说明。 使用官方 shadcn Base UI / base-nova 组合 API；交互只更新本地示例状态。",
      },
    },
  },
} satisfies Meta<typeof TooltipDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: "交互示例",
};

function OpenTooltip({ shortcut = false, side = 'top' }: { shortcut?: boolean; side?: 'top' | 'right' | 'bottom' | 'left' }) { return <div className="flex min-h-40 items-center justify-center"><Tooltip defaultOpen><TooltipTrigger render={<Button variant="outline" size="icon" aria-label="新增任务" />}><Plus /></TooltipTrigger><TooltipContent side={side}>新增任务{shortcut && <Kbd>⌘ N</Kbd>}</TooltipContent></Tooltip></div>; }
export const Default: Story = { name: '文字提示', parameters: { docs: { story: { inline: false, height: 'var(--rui-container-lg)' } } }, render: () => <OpenTooltip /> };
export const WithShortcut: Story = { name: '快捷键提示', parameters: { docs: { story: { inline: false, height: 'var(--rui-container-lg)' } } }, render: () => <OpenTooltip shortcut /> };
export const Right: Story = { name: '右侧提示', parameters: { docs: { story: { inline: false, height: 'var(--rui-container-lg)' } } }, render: () => <OpenTooltip side="right" /> };
export const Bottom: Story = { name: '底部提示', parameters: { docs: { story: { inline: false, height: 'var(--rui-container-lg)' } } }, render: () => <OpenTooltip side="bottom" /> };
export const Left: Story = { name: '左侧提示', parameters: { docs: { story: { inline: false, height: 'var(--rui-container-lg)' } } }, render: () => <OpenTooltip side="left" /> };

export const Playground: StoryObj<{ open: boolean; side: 'top' | 'right' | 'bottom' | 'left'; align: 'start' | 'center' | 'end'; children: string; shortcut: boolean }> = {
  name: '参数调试', args: { open: false, side: 'top', align: 'center', children: '新增任务', shortcut: false },
  argTypes: { open: { control: 'boolean' }, side: { control: 'select', options: ['top', 'right', 'bottom', 'left'], table: { category: 'TooltipContent' } }, align: { control: 'select', options: ['start', 'center', 'end'], table: { category: 'TooltipContent' } }, children: { control: 'text', table: { category: 'TooltipContent' } }, shortcut: { control: 'boolean', table: { category: '组合示例' }, description: '在 TooltipContent 中添加 Kbd 提示。' } },
  parameters: { controls: { include: ['open', 'side', 'align', 'children', 'shortcut'] }, docs: { story: { inline: false, height: 'var(--rui-container-lg)' } } },
  render: function Render(args) { const [, updateArgs] = useArgs(); return <div className="flex min-h-40 items-center justify-center"><Tooltip open={args.open} onOpenChange={open => updateArgs({ open })}><TooltipTrigger render={<Button variant="outline" size="icon" aria-label="新增任务" />}><Plus /></TooltipTrigger><TooltipContent side={args.side} align={args.align}>{args.children}{args.shortcut && <Kbd>⌘ N</Kbd>}</TooltipContent></Tooltip></div>; },
};
