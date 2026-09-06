import { useArgs } from "storybook/preview-api";
import { Switch } from '../../../../packages/ui/src/basic.js';
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SwitchDemo } from "../../../../packages/ui/src/basic/catalog.js";

const meta = {
  title: "基础/Switch",
  component: Switch,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "即时布尔设置与紧凑变体。 使用官方 shadcn Base UI / base-nova 组合 API；交互只更新本地示例状态。",
      },
    },
  },
} satisfies Meta<typeof Switch>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => <SwitchDemo />,
  name: "总览对比",
};

export const Default: Story = { name: '关闭', args: { 'aria-label': '自动保存', defaultChecked: false } };
export const Checked: Story = { name: '开启', args: { 'aria-label': '自动保存', defaultChecked: true } };
export const Small: Story = { name: '小尺寸', args: { 'aria-label': '紧凑开关', size: 'sm', defaultChecked: true } };
export const Disabled: Story = { name: '禁用', args: { 'aria-label': '禁用开关', disabled: true } };
export const DisabledChecked: Story = { name: '禁用且开启', args: { 'aria-label': '锁定的自动保存', disabled: true, defaultChecked: true } };

export const Playground: Story = {
  name: '参数调试', args: { 'aria-label': '自动保存', checked: false, size: 'default', disabled: false },
  argTypes: { checked: { control: 'boolean' }, size: { control: 'select', options: ['default', 'sm'] }, disabled: { control: 'boolean' }, 'aria-label': { control: 'text' } },
  parameters: { controls: { include: ['checked', 'size', 'disabled', 'aria-label'] } },
  render: function Render(args) { const [, updateArgs] = useArgs(); return <Switch {...args} onCheckedChange={checked => updateArgs({ checked })} />; },
};
