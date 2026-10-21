import { SectionLabel } from '../../../../packages/ui/src/basic.js';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SectionLabelDemo } from '../../../../packages/ui/src/basic/catalog.js';
import { booleanControl, choiceControl, textControl } from '../feature-controls.js';

const meta = {
  id: 'basic-section-label',
  title: '基础/SectionLabel 分区标签',
  component: SectionLabel,
  tags: ['autodocs'],
  args: { children: 'Turn 1' },
  parameters: {
    docs: {
      description: {
        component:
          '高密列表的轻量分组标签，如轮次或日期边界。默认渲染为 h3，可用 as 调整层级；文字大写由 CSS 完成，可访问名称保留原文。',
      },
    },
  },
} satisfies Meta<typeof SectionLabel>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  name: '参数调试',
  args: { children: 'Turn 1', trailing: '', divider: false, as: 'h3' },
  argTypes: { children: textControl, trailing: textControl, divider: booleanControl, as: choiceControl(['h2', 'h3', 'h4', 'div']) },
  parameters: { controls: { include: ['children', 'trailing', 'divider', 'as'] } },
  render: ({ trailing, ...args }) => <SectionLabel {...args} trailing={trailing || undefined} />,
};
export const Overview: Story = { name: '总览对比', render: () => <SectionLabelDemo /> };
export const WithCount: Story = { name: '带计数', args: { children: 'Turn 2', trailing: '12 条' } };
export const Divider: Story = { name: '分隔线', args: { children: '今天', divider: true } };
