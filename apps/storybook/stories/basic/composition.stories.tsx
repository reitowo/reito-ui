import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  CompositionDemo,
  PageTabsDemo,
  KnowledgePageDemo,
} from '../../../../packages/ui/src/basic/composition-demo.js';

const meta = {
  id: '基础-composition',
  title: '基础/Composition 页面积木',
  component: CompositionDemo,
  tags: ['autodocs'],
  args: { customized: false },
  argTypes: {
    customized: { control: 'boolean', description: '只通过 Provider 覆盖公共内容内距和表面圆角。' },
  },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof CompositionDemo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = { name: '参数调试' };
export const ThemeOverride: Story = { name: '局部主题', args: { customized: true } };
export const TabbedPage: Story = { name: '带页签的页面', render: () => <PageTabsDemo /> };
export const ContentPage: Story = { name: '带说明的内容页面', render: () => <KnowledgePageDemo /> };
export const VerticalTabs: Story = {
  name: '纵向页签页面',
  render: () => <PageTabsDemo orientation="vertical" />,
};
