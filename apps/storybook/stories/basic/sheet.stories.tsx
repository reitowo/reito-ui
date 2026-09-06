import { useArgs } from "storybook/preview-api";
import { Button, Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '../../../../packages/ui/src/basic.js';
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SheetDemo } from "../../../../packages/ui/src/basic/catalog.js";

const meta = {
  title: "基础/Sheet",
  component: SheetDemo,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "按需打开的任务详情抽屉。 使用官方 shadcn Base UI / base-nova 组合 API；交互只更新本地示例状态。",
      },
    },
  },
} satisfies Meta<typeof SheetDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: "交互示例",
};

function TaskSheet({ side }: { side: 'top' | 'right' | 'bottom' | 'left' }) {
 return <Sheet defaultOpen><SheetTrigger render={<Button variant="outline" />}>打开任务详情</SheetTrigger><SheetContent side={side}><SheetHeader><SheetTitle>任务详情</SheetTitle><SheetDescription>本地任务的辅助信息。</SheetDescription></SheetHeader><p className="p-[var(--rui-content-padding)] text-sm">检查组件的主题、密度与交互状态。</p><SheetFooter><SheetClose render={<Button variant="outline" />}>完成</SheetClose></SheetFooter></SheetContent></Sheet>;
}
export const Right: Story = { name: '右侧抽屉', parameters: { docs: { story: { inline: false, height: 'var(--rui-container-lg)' } } }, render: () => <TaskSheet side="right" /> };
export const Left: Story = { name: '左侧抽屉', parameters: { docs: { story: { inline: false, height: 'var(--rui-container-lg)' } } }, render: () => <TaskSheet side="left" /> };
export const Top: Story = { name: '顶部抽屉', parameters: { docs: { story: { inline: false, height: 'var(--rui-container-lg)' } } }, render: () => <TaskSheet side="top" /> };
export const Bottom: Story = { name: '底部抽屉', parameters: { docs: { story: { inline: false, height: 'var(--rui-container-lg)' } } }, render: () => <TaskSheet side="bottom" /> };

export const Playground: StoryObj<{ open: boolean; side: 'top' | 'right' | 'bottom' | 'left'; showCloseButton: boolean; title: string; description: string }> = {
  name: '参数调试', args: { open: false, side: 'right', showCloseButton: true, title: '任务详情', description: '本地任务的辅助信息。' },
  argTypes: { open: { control: 'boolean' }, side: { control: 'select', options: ['top', 'right', 'bottom', 'left'], table: { category: 'SheetContent' } }, showCloseButton: { control: 'boolean', table: { category: 'SheetContent' } }, title: { control: 'text', table: { category: '组合示例' }, description: 'SheetTitle 的 children。' }, description: { control: 'text', table: { category: '组合示例' }, description: 'SheetDescription 的 children。' } },
  parameters: { controls: { include: ['open', 'side', 'showCloseButton', 'title', 'description'] }, docs: { story: { inline: false, height: 'var(--rui-container-lg)' } } },
  render: function Render(args) { const [, updateArgs] = useArgs(); return <Sheet open={args.open} onOpenChange={open => updateArgs({ open })}><SheetTrigger render={<Button variant="outline" />}>打开任务详情</SheetTrigger><SheetContent side={args.side} showCloseButton={args.showCloseButton}><SheetHeader><SheetTitle>{args.title}</SheetTitle><SheetDescription>{args.description}</SheetDescription></SheetHeader><p className="p-[var(--rui-content-padding)] text-sm">检查组件的主题、密度与交互状态。</p><SheetFooter><SheetClose render={<Button variant="outline" />}>完成</SheetClose></SheetFooter></SheetContent></Sheet>; },
};
