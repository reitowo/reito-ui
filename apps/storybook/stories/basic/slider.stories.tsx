import { useArgs } from "storybook/preview-api";
import { Slider } from '../../../../packages/ui/src/basic.js';
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SliderDemo } from "../../../../packages/ui/src/basic/catalog.js";

const meta = { id: "基础-slider",
  title: "基础/Slider 滑块",
  component: Slider,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "连续数值、范围与禁用状态。 使用官方 shadcn Base UI / base-nova 组合 API；交互只更新本地示例状态。",
      },
    },
  },
} satisfies Meta<typeof Slider>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => <SliderDemo />,
  name: "总览对比",
};

export const Default: Story = { name: "单值", args: { 'aria-label': '上下文预算', defaultValue: [60], className: 'max-w-sm' } };
export const Range: Story = { name: "范围", args: { 'aria-label': '允许的预算范围', defaultValue: [20, 80], className: 'max-w-sm' } };
export const Disabled: Story = { name: "状态 · 禁用", args: { 'aria-label': '禁用范围', defaultValue: [20, 80], disabled: true, className: 'max-w-sm' } };
export const Vertical: Story = { name: "纵向", args: { 'aria-label': '缩放比例', orientation: 'vertical', defaultValue: [60] }, render: args => <div className="h-48 w-12"><Slider {...args} /></div> };

export const Playground: StoryObj<{ value: number; disabled: boolean; orientation: 'horizontal' | 'vertical'; min: number; max: number; step: number }> = {
  name: "参数调试", args: { value: 60, disabled: false, orientation: 'horizontal', min: 0, max: 100, step: 1 },
  argTypes: { value: { control: { type: 'number', min: 0, max: 100 }, description: '单值调试，作为 Slider.value 的单元素数组传入。' }, disabled: { control: 'boolean' }, orientation: { control: 'select', options: ['horizontal', 'vertical'] }, min: { control: 'number' }, max: { control: 'number' }, step: { control: { type: 'number', min: 1 } } },
  parameters: { controls: { include: ['value', 'disabled', 'orientation', 'min', 'max', 'step'] } },
  render: function Render({ value, ...args }) { const [, updateArgs] = useArgs(); return <div className={args.orientation === 'vertical' ? 'h-48 w-12' : 'w-full max-w-sm'}><Slider {...args} aria-label="上下文预算" value={[value]} onValueChange={next => updateArgs({ value: Array.isArray(next) ? next[0] : next })} /></div>; },
};
