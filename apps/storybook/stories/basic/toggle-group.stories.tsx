import { useEffect } from 'react';
import { useArgs } from "storybook/preview-api";
import { Bold, Italic, Underline } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '../../../../packages/ui/src/basic.js';
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ToggleGroupDemo } from "../../../../packages/ui/src/basic/catalog.js";

const meta = { id: "基础-toggle-group",
  title: "基础/ToggleGroup 切换按钮组",
  component: ToggleGroupDemo,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "可多选的工具栏按钮组。 使用官方 shadcn Base UI / base-nova 组合 API；交互只更新本地示例状态。",
      },
    },
  },
} satisfies Meta<typeof ToggleGroupDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: "交互演示",
};

function FormattingGroup({ variant = 'default', multiple = false, disabled = false, size = 'default', orientation = 'horizontal' }: { variant?: 'default' | 'outline'; multiple?: boolean; disabled?: boolean; size?: 'default' | 'sm' | 'lg'; orientation?: 'horizontal' | 'vertical' }) {
 return <ToggleGroup aria-label="文字格式" variant={variant} multiple={multiple} disabled={disabled} size={size} orientation={orientation} defaultValue={['bold']}><ToggleGroupItem value="bold" aria-label="粗体"><Bold /></ToggleGroupItem><ToggleGroupItem value="italic" aria-label="斜体"><Italic /></ToggleGroupItem><ToggleGroupItem value="underline" aria-label="下划线"><Underline /></ToggleGroupItem></ToggleGroup>;
}
export const Default: Story = { name: "默认单选", render: () => <FormattingGroup /> };
export const Outline: Story = { name: "描边", render: () => <FormattingGroup variant="outline" /> };
export const Multiple: Story = { name: "多选", render: () => <FormattingGroup multiple /> };
export const Disabled: Story = { name: "状态 · 禁用", render: () => <FormattingGroup disabled /> };
export const Small: Story = { name: "小尺寸", render: () => <FormattingGroup size="sm" /> };
export const Large: Story = { name: "大尺寸", render: () => <FormattingGroup size="lg" /> };
export const Vertical: Story = { name: "纵向", render: () => <FormattingGroup orientation="vertical" /> };

type ToggleGroupPlaygroundArgs = { variant: 'default' | 'outline'; size: 'default' | 'sm' | 'lg'; multiple: boolean; disabled: boolean; orientation: 'horizontal' | 'vertical'; value: string[]; spacing: number };
export const Playground: StoryObj<ToggleGroupPlaygroundArgs> = {
  name: "参数调试", args: { variant: 'default', size: 'default', multiple: true, disabled: false, orientation: 'horizontal', value: ['bold'], spacing: 2 },
  argTypes: { variant: { control: 'select', options: ['default', 'outline'] }, size: { control: 'select', options: ['default', 'sm', 'lg'] }, multiple: { control: 'boolean' }, disabled: { control: 'boolean' }, orientation: { control: 'select', options: ['horizontal', 'vertical'] }, value: { control: 'check', options: ['bold', 'italic', 'underline'], description: '单选模式仅保留最后一个选项。' }, spacing: { control: { type: 'number', min: 0, max: 6, step: 1 } } },
  parameters: { controls: { include: ['variant', 'size', 'multiple', 'disabled', 'orientation', 'value', 'spacing'] } },
  render: function Render(args) { const [, updateArgs] = useArgs(); useEffect(() => { if (!args.multiple && args.value.length > 1) updateArgs({ value: args.value.slice(-1) }); }, [args.multiple, args.value, updateArgs]); return <ToggleGroup {...args} aria-label="文字格式" onValueChange={value => updateArgs({ value })}><ToggleGroupItem value="bold" aria-label="粗体"><Bold /></ToggleGroupItem><ToggleGroupItem value="italic" aria-label="斜体"><Italic /></ToggleGroupItem><ToggleGroupItem value="underline" aria-label="下划线"><Underline /></ToggleGroupItem></ToggleGroup>; },
};
