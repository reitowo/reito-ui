import { useArgs } from "storybook/preview-api";
import { useEffect, useState } from 'react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationEllipsis } from '../../../../packages/ui/src/basic.js';
import type { Meta, StoryObj } from "@storybook/react-vite";
import { PaginationDemo } from "../../../../packages/ui/src/basic/catalog.js";

const meta = { id: "基础-pagination",
  title: "基础/Pagination 分页",
  component: PaginationDemo,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "页码选择与相邻页导航。 使用官方 shadcn Base UI / base-nova 组合 API；交互只更新本地示例状态。",
      },
    },
  },
} satisfies Meta<typeof PaginationDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: "交互演示",
};

function PageLinks({ many = false }: { many?: boolean }) { const [page, setPage] = useState(1); return <Pagination aria-label="组件列表分页"><PaginationContent>{[1, 2, 3].map(value => <PaginationItem key={value}><PaginationLink href={'#page-' + value} isActive={page === value} onClick={event => { event.preventDefault(); setPage(value); }}>{value}</PaginationLink></PaginationItem>)}{many && <><PaginationItem><PaginationEllipsis /></PaginationItem><PaginationItem><PaginationLink href="#page-20" isActive={page === 20} onClick={event => { event.preventDefault(); setPage(20); }}>20</PaginationLink></PaginationItem></>}</PaginationContent></Pagination>; }
export const Default: Story = { name: "页码选择", render: () => <PageLinks /> };
export const WithEllipsis: Story = { name: "省略中间页码", render: () => <PageLinks many /> };

export const Playground: StoryObj<{ page: number; pageCount: number; size: 'default' | 'sm' | 'lg' | 'icon' }> = {
  name: "参数调试", args: { page: 1, pageCount: 5, size: 'icon' },
  argTypes: { page: { control: { type: 'number', min: 1, max: 10 }, table: { category: '组合示例' }, description: '当前页，映射每个 PaginationLink 的 isActive。输入超范围时画布使用合法页码；完成编辑、失焦后参数框同步。' }, pageCount: { control: { type: 'number', min: 1, max: 10 }, table: { category: '组合示例' } }, size: { control: 'select', options: ['default', 'sm', 'lg', 'icon'], table: { category: 'PaginationLink' } } },
  parameters: { controls: { include: ['page', 'pageCount', 'size'] } },
  render: function Render(args) { const [, updateArgs] = useArgs(); const pageCount = Math.max(1, Math.min(10, Math.floor(args.pageCount))); const currentPage = Math.max(1, Math.min(pageCount, Math.floor(args.page))); useEffect(() => { if (args.page !== currentPage) updateArgs({ page: currentPage }); }, [args.page, currentPage, updateArgs]); return <Pagination aria-label="组件列表分页"><PaginationContent>{Array.from({ length: pageCount }, (_, index) => index + 1).map(page => <PaginationItem key={page}><PaginationLink href={'#page-' + page} size={args.size} isActive={currentPage === page} onClick={event => { event.preventDefault(); updateArgs({ page }); }}>{page}</PaginationLink></PaginationItem>)}</PaginationContent></Pagination>; },
};
