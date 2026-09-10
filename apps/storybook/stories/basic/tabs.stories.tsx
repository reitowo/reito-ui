import { useArgs } from "storybook/preview-api";
import { Button, Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow, Tabs, TabsList, TabsTrigger, TabsContent } from '../../../../packages/ui/src/basic.js';
import type { Meta, StoryObj } from "@storybook/react-vite";
import { TabsDemo } from "../../../../packages/ui/src/basic/catalog.js";

const meta = { id: "基础-tabs",
  title: "基础/Tabs 选项卡",
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
  name: "交互演示",
};

function ViewTabs({ variant = 'default', disabled = false }: { variant?: 'default' | 'line'; disabled?: boolean }) {
 return <Tabs defaultValue="preview" className="w-full max-w-lg"><TabsList variant={variant} aria-label="查看方式"><TabsTrigger value="preview">预览</TabsTrigger><TabsTrigger value="code">代码</TabsTrigger>{disabled && <TabsTrigger value="history" disabled>历史</TabsTrigger>}</TabsList><TabsContent value="preview" className="p-[var(--rui-content-padding)]">组件预览内容</TabsContent><TabsContent value="code" className="p-[var(--rui-content-padding)] font-mono text-xs">{'<Button variant="outline">保存</Button>'}</TabsContent></Tabs>;
}
export const Default: Story = { name: "默认填充", render: () => <ViewTabs /> };
export const Line: Story = { name: "下划线", render: () => <ViewTabs variant="line" /> };
export const DisabledTab: Story = { name: "含禁用标签", render: () => <ViewTabs disabled /> };

export const ReadingSurfaces: Story = {
  name: "阅读面板与宽表焦点",
  parameters: { docs: { description: { story: '静态示例。鼠标阅读保持安静；Tab 聚焦面板或溢出表格时显示内侧标记，进入子按钮后由按钮显示焦点。' } } },
  render: () => <div className="grid w-full max-w-lg grid-cols-1 gap-[var(--rui-content-gap)]">
    <Button variant="outline">示例之前</Button>
    <Tabs defaultValue="notes" className="min-w-0">
      <TabsList aria-label="阅读示例">
        <TabsTrigger value="notes">说明</TabsTrigger>
        <TabsTrigger value="table">记录</TabsTrigger>
        <TabsTrigger value="actions">操作</TabsTrigger>
        <TabsTrigger value="history" disabled>历史</TabsTrigger>
      </TabsList>
      <TabsContent value="notes" className="p-[var(--rui-content-padding)]">
        <p>这是一段可通过键盘到达的纯文本内容。</p>
        <p>使用方向键选择标签，再按 Enter 激活。Tab 进入当前面板。</p>
      </TabsContent>
      <TabsContent value="table" className="[&>[data-slot=table-container]]:max-h-24 [&>[data-slot=table-container]]:overflow-auto">
        <Table className="min-w-2xl bg-background">
          <TableCaption>静态记录示例</TableCaption>
          <TableHeader><TableRow><TableHead>记录</TableHead><TableHead>说明</TableHead><TableHead>状态</TableHead></TableRow></TableHeader>
          <TableBody>{['第一项', '第二项', '第三项'].map(name => <TableRow key={name}><TableCell>{name}</TableCell><TableCell>用于检查宽表的横向键盘滚动与焦点标记</TableCell><TableCell>待处理</TableCell></TableRow>)}</TableBody>
        </Table>
      </TabsContent>
      <TabsContent value="actions" className="grid gap-[var(--rui-content-gap)] p-[var(--rui-content-padding)]">
        <p>焦点进入以下按钮时，面板不显示额外焦点边界。</p>
        <Button variant="outline">示例按钮</Button>
      </TabsContent>
    </Tabs>
    <Button variant="outline">示例之后</Button>
  </div>,
};

export const Playground: StoryObj<{ value: string; variant: 'default' | 'line'; orientation: 'horizontal' | 'vertical'; disabledTab: boolean }> = {
  name: "参数调试", args: { value: 'preview', variant: 'default', orientation: 'horizontal', disabledTab: false },
  argTypes: { value: { control: 'select', options: ['preview', 'code', 'history'] }, variant: { control: 'select', options: ['default', 'line'], table: { category: 'TabsList' } }, orientation: { control: 'select', options: ['horizontal', 'vertical'] }, disabledTab: { control: 'boolean', table: { category: '组合示例' }, description: '禁用历史 TabsTrigger。' } },
  parameters: { controls: { include: ['value', 'variant', 'orientation', 'disabledTab'] } },
  render: function Render(args) { const [, updateArgs] = useArgs(); return <Tabs value={args.value} onValueChange={value => updateArgs({ value })} orientation={args.orientation} className="w-full max-w-lg"><TabsList variant={args.variant} aria-label="查看方式"><TabsTrigger value="preview">预览</TabsTrigger><TabsTrigger value="code">代码</TabsTrigger><TabsTrigger value="history" disabled={args.disabledTab}>历史</TabsTrigger></TabsList><TabsContent value="preview" className="p-[var(--rui-content-padding)]">组件预览内容</TabsContent><TabsContent value="code" className="p-[var(--rui-content-padding)] font-mono text-xs">{'<Button variant="outline">保存</Button>'}</TabsContent><TabsContent value="history" className="p-[var(--rui-content-padding)]">尚无历史记录。</TabsContent></Tabs>; },
};
