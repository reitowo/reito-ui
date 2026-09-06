import type { Meta, StoryObj } from '@storybook/react-vite';
import { VirtualListDemo } from '../../../../packages/ui/src/complex/virtual-list-demo.js';
import { booleanControl, choiceControl } from '../feature-controls.js';
const meta = { title: '复杂/VirtualList 虚拟列表', component: VirtualListDemo } satisfies Meta<typeof VirtualListDemo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {
  name: '参数调试', args: { count: 10000, overscan: 4, scenario: 'ready', sparse: false, viewportSize: 'default' },
  argTypes: { count: { control: { type: 'number', min: 0, max: 100000 } }, overscan: { control: { type: 'number', min: 0, max: 20 } }, scenario: choiceControl(['ready', 'loading', 'empty', 'error']), sparse: booleanControl, viewportSize: choiceControl(['small', 'default', 'large']) },
  parameters: { controls: { include: ['count', 'overscan', 'scenario', 'sparse', 'viewportSize'] } },
};
export const Empty: Story = { args: { scenario: 'empty' } };
export const Loading: Story = { args: { scenario: 'loading' } };
export const Error: Story = { args: { scenario: 'error' } };
export const Sparse: Story = { args: { sparse: true } };
