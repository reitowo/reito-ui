import type { Meta, StoryObj } from '@storybook/react-vite';
import { VirtualGridDemo } from '../../../../packages/ui/src/complex/virtual-grid-demo.js';
import { choiceControl } from '../feature-controls.js';

const meta = { id: "复杂-virtualgrid-虚拟网格", title: "复杂/VirtualGrid 虚拟网格", component: VirtualGridDemo } satisfies Meta<typeof VirtualGridDemo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {
  name: "参数调试",
  args: { rows: 10000, columns: 1000, overscanRows: 2, overscanColumns: 1, rowSize: 0, columnSize: 0, scenario: 'ready', viewportSize: 'default' },
  argTypes: {
    rows: { control: { type: 'number', min: 0, max: 100000 } }, columns: { control: { type: 'number', min: 0, max: 10000 } },
    overscanRows: { control: { type: 'number', min: 0, max: 20 } }, overscanColumns: { control: { type: 'number', min: 0, max: 20 } },
    rowSize: { control: { type: 'number', min: 0, max: 120 }, description: '0 使用密度 token' },
    columnSize: { control: { type: 'number', min: 0, max: 480 }, description: '0 使用密度 token' },
    scenario: choiceControl(['ready', 'loading', 'empty', 'error']), viewportSize: choiceControl(['small', 'default', 'large']),
  },
};
export const Empty: Story = { name: "状态 · 空内容", args: { scenario: 'empty' } };
export const Loading: Story = { name: "状态 · 加载中", args: { scenario: 'loading' } };
export const Error: Story = { name: "状态 · 错误", args: { scenario: 'error' } };
export const CompactData: Story = { name: "紧凑大数据", args: { rows: 20000, columns: 2000, rowSize: 28, columnSize: 112 } };
