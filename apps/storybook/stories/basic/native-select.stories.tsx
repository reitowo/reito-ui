import { useArgs } from "storybook/preview-api";
import { NativeSelect, NativeSelectOption } from '../../../../packages/ui/src/basic.js';
import type { Meta, StoryObj } from "@storybook/react-vite";
import { NativeSelectDemo } from "../../../../packages/ui/src/basic/catalog.js";

const meta = { id: "基础-native-select",
  title: "基础/NativeSelect 原生选择",
  component: NativeSelectDemo,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "仅在明确需要浏览器或操作系统原生选择行为时使用；展开菜单不保证继承 Graphite 主题。常规产品界面请使用 Select。",
      },
    },
  },
} satisfies Meta<typeof NativeSelectDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: "总览对比",
};

function ThemeSelect({ size = 'default', disabled = false, invalid = false }: { size?: 'sm' | 'default'; disabled?: boolean; invalid?: boolean }) {
 return <NativeSelect aria-label="主题偏好" size={size} disabled={disabled} aria-invalid={invalid} defaultValue="system"><NativeSelectOption value="system">跟随系统</NativeSelectOption><NativeSelectOption value="light">浅色</NativeSelectOption><NativeSelectOption value="dark">深色</NativeSelectOption></NativeSelect>;
}
export const Default: Story = { name: "默认示例", render: () => <ThemeSelect /> };
export const Small: Story = { name: "小尺寸", render: () => <ThemeSelect size="sm" /> };
export const Disabled: Story = { name: "状态 · 禁用", render: () => <ThemeSelect disabled /> };
export const Invalid: Story = { name: "状态 · 错误", render: () => <div className="grid gap-2"><ThemeSelect invalid /><p className="text-xs text-destructive" role="alert">请选择组织允许的主题。</p></div> };

export const Playground: StoryObj<{ size: 'default' | 'sm'; value: string; disabled: boolean; invalid: boolean }> = {
  name: "参数调试", args: { size: 'default', value: 'system', disabled: false, invalid: false },
  argTypes: { size: { control: 'select', options: ['default', 'sm'] }, value: { control: 'select', options: ['system', 'light', 'dark'] }, disabled: { control: 'boolean' }, invalid: { control: 'boolean', table: { category: '组合示例' }, description: '映射到 NativeSelect 的 aria-invalid。' } },
  parameters: { controls: { include: ['size', 'value', 'disabled', 'invalid'] } },
  render: function Render({ invalid, ...args }) { const [, updateArgs] = useArgs(); return <NativeSelect {...args} aria-label="主题偏好" aria-invalid={invalid} onChange={event => updateArgs({ value: event.target.value })}><NativeSelectOption value="system">跟随系统</NativeSelectOption><NativeSelectOption value="light">浅色</NativeSelectOption><NativeSelectOption value="dark">深色</NativeSelectOption></NativeSelect>; },
};
