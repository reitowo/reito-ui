import { Kbd, KbdGroup } from '../../../../packages/ui/src/basic.js';
import type { Meta, StoryObj } from "@storybook/react-vite";
import { KbdDemo } from "../../../../packages/ui/src/basic/catalog.js";

const meta = { id: "基础-kbd",
  title: "基础/Kbd 快捷键",
  component: KbdDemo,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "单键与组合快捷键提示。 使用官方 shadcn Base UI / base-nova 组合 API；交互只更新本地示例状态。",
      },
    },
  },
} satisfies Meta<typeof KbdDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: "总览对比",
};

export const Default: Story = { name: "单键", render: () => <Kbd>Esc</Kbd> };
export const KeyCombination: Story = { name: "组合快捷键", render: () => <KbdGroup><Kbd>⌘</Kbd><Kbd>K</Kbd></KbdGroup> };
export const TextKey: Story = { name: "带文字的按键", render: () => <Kbd>Shift ↵</Kbd> };

export const Playground: StoryObj<{ children: string; modifier: string }> = {
  name: "参数调试", args: { children: 'K', modifier: '⌘' },
  argTypes: { children: { control: 'text', description: 'Kbd.children：按键文字' }, modifier: { control: 'select', options: ['', '⌘', 'Ctrl', 'Alt', 'Shift'], table: { category: '组合示例' }, description: '在 KbdGroup 中添加修饰键。' } },
  parameters: { controls: { include: ['children', 'modifier'] } },
  render: ({ children, modifier }) => <KbdGroup>{modifier && <Kbd>{modifier}</Kbd>}<Kbd>{children}</Kbd></KbdGroup>,
};
