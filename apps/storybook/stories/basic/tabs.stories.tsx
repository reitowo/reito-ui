import { useArgs } from "storybook/preview-api";
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../../packages/ui/src/basic.js';
import type { Meta, StoryObj } from "@storybook/react-vite";
import { TabsDemo } from "../../../../packages/ui/src/basic/catalog.js";

const meta = {
  title: "基础/Tabs",
  component: TabsDemo,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "预览/代码切换与禁用标签。 使用官方 shadcn Base UI / base-nova 组合 API；交互只更新本地示例状态。",
      },
    },
  },
} satisfies Meta<typeof TabsDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: "交互示例",
};

function ViewTabs({ variant = 'default', disabled = false }: { variant?: 'default' | 'line'; disabled?: boolean }) {
 return <Tabs defaultValue="preview" className="w-full max-w-lg"><TabsList variant={variant} aria-label="查看方式"><TabsTrigger value="preview">预览</TabsTrigger><TabsTrigger value="code">代码</TabsTrigger>{disabled && <TabsTrigger value="history" disabled>历史</TabsTrigger>}</TabsList><TabsContent value="preview" className="p-[var(--rui-content-padding)]">组件预览内容</TabsContent><TabsContent value="code" className="p-[var(--rui-content-padding)] font-mono text-xs">{'<Button variant="outline">保存</Button>'}</TabsContent></Tabs>;
}
export const Default: Story = { name: '默认填充', render: () => <ViewTabs /> };
export const Line: Story = { name: '下划线', render: () => <ViewTabs variant="line" /> };
export const DisabledTab: Story = { name: '含禁用标签', render: () => <ViewTabs disabled /> };

export const Playground: StoryObj<{ value: string; variant: 'default' | 'line'; orientation: 'horizontal' | 'vertical'; disabledTab: boolean }> = {
  name: '参数调试', args: { value: 'preview', variant: 'default', orientation: 'horizontal', disabledTab: false },
  argTypes: { value: { control: 'select', options: ['preview', 'code', 'history'] }, variant: { control: 'select', options: ['default', 'line'], table: { category: 'TabsList' } }, orientation: { control: 'select', options: ['horizontal', 'vertical'] }, disabledTab: { control: 'boolean', table: { category: '组合示例' }, description: '禁用历史 TabsTrigger。' } },
  parameters: { controls: { include: ['value', 'variant', 'orientation', 'disabledTab'] } },
  render: function Render(args) { const [, updateArgs] = useArgs(); return <Tabs value={args.value} onValueChange={value => updateArgs({ value })} orientation={args.orientation} className="w-full max-w-lg"><TabsList variant={args.variant} aria-label="查看方式"><TabsTrigger value="preview">预览</TabsTrigger><TabsTrigger value="code">代码</TabsTrigger><TabsTrigger value="history" disabled={args.disabledTab}>历史</TabsTrigger></TabsList><TabsContent value="preview" className="p-[var(--rui-content-padding)]">组件预览内容</TabsContent><TabsContent value="code" className="p-[var(--rui-content-padding)] font-mono text-xs">{'<Button variant="outline">保存</Button>'}</TabsContent><TabsContent value="history" className="p-[var(--rui-content-padding)]">尚无历史记录。</TabsContent></Tabs>; },
};
