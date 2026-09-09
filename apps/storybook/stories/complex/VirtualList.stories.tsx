import type { Meta, StoryObj } from '@storybook/react-vite';
import { VirtualListDemo } from '../../../../packages/ui/src/complex/virtual-list-demo.js';
import { DynamicVirtualListDemo } from '../../../../packages/ui/src/complex/virtual-list-dynamic-demo.js';
import { booleanControl, choiceControl } from '../feature-controls.js';
const meta = { id: "复杂-virtuallist-虚拟列表", title: "复杂/VirtualList 虚拟列表", component: VirtualListDemo } satisfies Meta<typeof VirtualListDemo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {
  name: "参数调试", args: { count: 10000, overscan: 4, scenario: 'ready', sparse: false, viewportSize: 'default' },
  argTypes: { count: { control: { type: 'number', min: 0, max: 100000 } }, overscan: { control: { type: 'number', min: 0, max: 20 } }, scenario: choiceControl(['ready', 'loading', 'empty', 'error']), sparse: booleanControl, viewportSize: choiceControl(['small', 'default', 'large']) },
  parameters: { controls: { include: ['count', 'overscan', 'scenario', 'sparse', 'viewportSize'] } },
};
export const Empty: Story = { name: "状态 · 空内容", args: { scenario: 'empty' } };
export const Loading: Story = { name: "状态 · 加载中", args: { scenario: 'loading' } };
export const Error: Story = { name: "状态 · 错误", args: { scenario: 'error' } };
export const Sparse: Story = { name: "数据 · 稀疏", args: { sparse: true } };
export const DynamicRows: StoryObj = { name: "动态高度、锚点与焦点", render: () => <DynamicVirtualListDemo /> };
