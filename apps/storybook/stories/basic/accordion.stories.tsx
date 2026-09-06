import { useArgs } from "storybook/preview-api";
import * as React from "react";
import * as P from "@reito/ui/basic";

import type { Meta, StoryObj } from "@storybook/react-vite";
import { AccordionDemo } from "../../../../packages/ui/src/basic/catalog.js";

const meta = {
  title: "基础/Accordion",
  component: AccordionDemo,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "分组折叠内容与禁用章节。 使用官方 shadcn Base UI / base-nova 组合 API；交互只更新本地示例状态。",
      },
    },
  },
} satisfies Meta<typeof AccordionDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: "总览对比",
  render: () => <AccordionDemo />,
};

function Sections(props: React.ComponentProps<typeof P.Accordion>) {
  return (
    <P.Accordion className="w-full max-w-xl" {...props}>
      <P.AccordionItem value="theme">
        <P.AccordionTrigger>如何统一主题？</P.AccordionTrigger>
        <P.AccordionContent>
          组件读取共享语义 token，应用只切换主题。
        </P.AccordionContent>
      </P.AccordionItem>
      <P.AccordionItem value="reuse">
        <P.AccordionTrigger>如何复用组件？</P.AccordionTrigger>
        <P.AccordionContent>用公共组件组合具体工作流程。</P.AccordionContent>
      </P.AccordionItem>
    </P.Accordion>
  );
}
export const Default: Story = {
  name: "状态 / 全部收起",
  render: () => <Sections />,
};
export const Expanded: Story = {
  name: "状态 / 默认展开",
  render: () => <Sections defaultValue={["theme"]} />,
};
export const Multiple: Story = {
  name: "行为 / 多项展开",
  render: () => <Sections multiple defaultValue={["theme", "reuse"]} />,
};
export const Disabled: Story = {
  name: "状态 / 禁用",
  render: () => <Sections disabled />,
};

type PlaygroundArgs = { value: string[]; multiple: boolean; disabled: boolean };
export const Playground: StoryObj<PlaygroundArgs> = {
  name: "参数调试",
  args: { value: ["theme"], multiple: false, disabled: false },
  argTypes: {
    value: { control: "check", options: ["theme", "reuse"], description: "Accordion.value：展开的章节 ID；单选模式仅保留最后勾选的章节。" },
    multiple: { control: "boolean" }, disabled: { control: "boolean" },
  },
  parameters: { controls: { include: ["value", "multiple", "disabled"] } },
  render: function PlaygroundRender(args) {
    const [, updateArgs] = useArgs<PlaygroundArgs>();
    React.useEffect(() => {
      if (!args.multiple && args.value.length > 1) updateArgs({ value: args.value.slice(-1) });
    }, [args.multiple, args.value, updateArgs]);
    const value = args.multiple ? args.value : args.value.slice(-1);
    return <Sections disabled={args.disabled} multiple={args.multiple} value={value} onValueChange={(value) => updateArgs({ value })} />;
  },
};
