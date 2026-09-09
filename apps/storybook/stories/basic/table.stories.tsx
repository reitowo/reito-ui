import { Table, TableCaption, TableHeader, TableRow, TableHead, TableBody, TableCell, TableFooter } from '../../../../packages/ui/src/basic.js';
import type { Meta, StoryObj } from "@storybook/react-vite";
import { TableDemo } from "../../../../packages/ui/src/basic/catalog.js";

const meta = { id: "基础-table",
  title: "基础/Table 基础表格",
  component: TableDemo,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "表格标题、列头、行与状态。 使用官方 shadcn Base UI / base-nova 组合 API；交互只更新本地示例状态。",
      },
    },
  },
} satisfies Meta<typeof TableDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: "组合示例",
};

export const Empty: Story = { name: "空数据", render: () => <Table><TableCaption>本地任务清单</TableCaption><TableHeader><TableRow><TableHead>任务</TableHead><TableHead>状态</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell colSpan={2} className="text-center text-muted-foreground">还没有任务</TableCell></TableRow></TableBody></Table> };
export const WithFooter: Story = { name: "汇总页脚", render: () => <Table><TableCaption>本地组件数量示例</TableCaption><TableHeader><TableRow><TableHead>分类</TableHead><TableHead className="text-right">数量</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell>基础</TableCell><TableCell className="text-right">54</TableCell></TableRow><TableRow><TableCell>复杂</TableCell><TableCell className="text-right">15</TableCell></TableRow></TableBody><TableFooter><TableRow><TableCell>合计</TableCell><TableCell className="text-right">69</TableCell></TableRow></TableFooter></Table> };

export const Playground: StoryObj<{ caption: string; rowCount: number; showFooter: boolean; selected: boolean }> = {
  name: "参数调试", args: { caption: '本地任务清单', rowCount: 3, showFooter: false, selected: false },
  argTypes: { caption: { control: 'text', table: { category: '组合示例' }, description: 'TableCaption 的 children。' }, rowCount: { control: { type: 'number', min: 0, max: 10 }, table: { category: '组合示例' } }, showFooter: { control: 'boolean', table: { category: '组合示例' }, description: '是否组合 TableFooter。' }, selected: { control: 'boolean', table: { category: '组合示例' }, description: '首行的 data-state=selected；与表格业务选中状态由消费方关联。' } },
  parameters: { controls: { include: ['caption', 'rowCount', 'showFooter', 'selected'] } },
  render: args => { const rowCount = Math.max(0, Math.min(10, Math.floor(args.rowCount))); return <Table><TableCaption>{args.caption}</TableCaption><TableHeader><TableRow><TableHead>任务</TableHead><TableHead>状态</TableHead></TableRow></TableHeader><TableBody>{rowCount ? Array.from({ length: rowCount }, (_, index) => <TableRow key={index} data-state={args.selected && index === 0 ? 'selected' : undefined}><TableCell>组件检查 {index + 1}</TableCell><TableCell>{index === 0 ? '运行中' : '排队中'}</TableCell></TableRow>) : <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground">还没有任务</TableCell></TableRow>}</TableBody>{args.showFooter && <TableFooter><TableRow><TableCell>合计</TableCell><TableCell>{rowCount} 项任务</TableCell></TableRow></TableFooter>}</Table>; },
};
