import { useArgs } from "storybook/preview-api";
import { Bold } from 'lucide-react';
import { Toggle } from '../../../../packages/ui/src/basic.js';
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ToggleDemo } from "../../../../packages/ui/src/basic/catalog.js";

const meta = {
  title: "基础/Toggle",
  component: Toggle,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "独立可切换操作。 使用官方 shadcn Base UI / base-nova 组合 API；交互只更新本地示例状态。",
      },
    },
  },
} satisfies Meta<typeof Toggle>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => <ToggleDemo />,
  name: "总览对比",
};

export const Default: Story = { name: '默认', args: { 'aria-label': '粗体', children: <Bold /> } };
export const Outline: Story = { name: '描边', args: { 'aria-label': '粗体', variant: 'outline', children: <Bold /> } };
export const Pressed: Story = { name: '已按下', args: { 'aria-label': '粗体', defaultPressed: true, children: <Bold /> } };
export const Disabled: Story = { name: '禁用', args: { 'aria-label': '粗体', disabled: true, children: <Bold /> } };
export const Small: Story = { name: '小尺寸', args: { 'aria-label': '粗体', size: 'sm', children: <Bold /> } };
export const Large: Story = { name: '大尺寸', args: { 'aria-label': '粗体', size: 'lg', children: <Bold /> } };

export const Playground: Story = {
  name: '参数调试', args: { 'aria-label': '粗体', variant: 'default', size: 'default', pressed: false, disabled: false },
  argTypes: { variant: { control: 'select', options: ['default', 'outline'] }, size: { control: 'select', options: ['default', 'sm', 'lg'] }, pressed: { control: 'boolean' }, disabled: { control: 'boolean' } },
  parameters: { controls: { include: ['variant', 'size', 'pressed', 'disabled'] } },
  render: function Render(args) { const [, updateArgs] = useArgs(); return <Toggle {...args} onPressedChange={pressed => updateArgs({ pressed })}><Bold /></Toggle>; },
};
