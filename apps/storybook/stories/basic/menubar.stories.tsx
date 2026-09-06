import { useArgs } from "storybook/preview-api";
import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarCheckboxItem, MenubarRadioGroup, MenubarRadioItem } from '../../../../packages/ui/src/basic.js';
import type { Meta, StoryObj } from "@storybook/react-vite";
import { MenubarDemo } from "../../../../packages/ui/src/basic/catalog.js";

const meta = {
  title: "基础/Menubar",
  component: MenubarDemo,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "桌面菜单栏与分组命令。 使用官方 shadcn Base UI / base-nova 组合 API；交互只更新本地示例状态。",
      },
    },
  },
} satisfies Meta<typeof MenubarDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: "交互示例",
};

export const CheckboxItems: Story = { name: '复选菜单项', render: () => <Menubar><MenubarMenu><MenubarTrigger>显示选项</MenubarTrigger><MenubarContent><MenubarCheckboxItem defaultChecked>显示行号</MenubarCheckboxItem><MenubarCheckboxItem>自动换行</MenubarCheckboxItem></MenubarContent></MenubarMenu></Menubar> };
export const RadioItems: Story = { name: '单选菜单项', render: () => <Menubar><MenubarMenu><MenubarTrigger>缩进方式</MenubarTrigger><MenubarContent><MenubarRadioGroup defaultValue="spaces"><MenubarRadioItem value="spaces">空格</MenubarRadioItem><MenubarRadioItem value="tabs">制表符</MenubarRadioItem></MenubarRadioGroup></MenubarContent></MenubarMenu></Menubar> };

export const Playground: StoryObj<{ open: boolean; checked: boolean; disabled: boolean; label: string }> = {
  name: '参数调试', args: { open: false, checked: true, disabled: false, label: '显示选项' },
  argTypes: { open: { control: 'boolean', table: { category: 'MenubarMenu' } }, checked: { control: 'boolean', table: { category: 'MenubarCheckboxItem' } }, disabled: { control: 'boolean', table: { category: 'MenubarTrigger' } }, label: { control: 'text', table: { category: '组合示例' }, description: '菜单触发器的 children。' } },
  parameters: { controls: { include: ['open', 'checked', 'disabled', 'label'] }, docs: { story: { inline: false, height: 'var(--rui-container-lg)' } } },
  render: function Render(args) { const [, updateArgs] = useArgs(); return <Menubar><MenubarMenu open={args.open} onOpenChange={open => updateArgs({ open })}><MenubarTrigger disabled={args.disabled}>{args.label}</MenubarTrigger><MenubarContent><MenubarCheckboxItem checked={args.checked} onCheckedChange={checked => updateArgs({ checked })}>显示行号</MenubarCheckboxItem></MenubarContent></MenubarMenu></Menubar>; },
};
