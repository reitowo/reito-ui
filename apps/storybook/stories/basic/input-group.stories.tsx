import * as P from "@reito/ui/basic";
import { Folder, Search, ArrowUp } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { InputGroupDemo } from "../../../../packages/ui/src/basic/catalog.js";

const meta = { id: "基础-input-group",
  title: "基础/InputGroup 输入组合",
  component: InputGroupDemo,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "前后缀、快捷键与输入操作。 使用官方 shadcn Base UI / base-nova 组合 API；交互只更新本地示例状态。",
      },
    },
  },
} satisfies Meta<typeof InputGroupDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: "总览对比",
  render: () => <InputGroupDemo />,
};

export const Default: Story = {
  name: "布局 · 单行前后缀",
  render: () => (
    <div className="w-full max-w-md">
      <P.InputGroup>
        <P.InputGroupAddon>
          <Search />
        </P.InputGroupAddon>
        <P.InputGroupInput aria-label="搜索组件" placeholder="搜索组件…" />
        <P.InputGroupAddon align="inline-end">
          <P.Kbd>⌘ K</P.Kbd>
        </P.InputGroupAddon>
      </P.InputGroup>
    </div>
  ),
};
export const Multiline: Story = {
  name: "布局 · 多行底部操作",
  render: () => (
    <div className="w-full max-w-md">
      <P.InputGroup>
        <P.InputGroupTextarea aria-label="附加说明" placeholder="添加说明…" />
        <P.InputGroupAddon align="block-end">
          <P.InputGroupText>本地示例</P.InputGroupText>
          <P.InputGroupButton
            className="ml-auto"
            variant="default"
            size="icon-sm"
            aria-label="添加说明"
          >
            <ArrowUp />
          </P.InputGroupButton>
        </P.InputGroupAddon>
      </P.InputGroup>
    </div>
  ),
};
export const TextPrefix: Story = {
  name: "内容 · 文字前缀",
  render: () => (
    <div className="w-full max-w-md">
      <P.InputGroup>
        <P.InputGroupAddon>
          <P.InputGroupText>https://</P.InputGroupText>
        </P.InputGroupAddon>
        <P.InputGroupInput
          aria-label="项目域名"
          placeholder="workspace.example"
        />
      </P.InputGroup>
    </div>
  ),
};
export const Invalid: Story = {
  name: "状态 · 校验错误",
  render: () => (
    <div className="w-full max-w-md">
      <P.InputGroup>
        <P.InputGroupAddon>
          <Folder />
        </P.InputGroupAddon>
        <P.InputGroupInput
          aria-label="无效目录"
          aria-invalid="true"
          defaultValue="未选择目录"
        />
      </P.InputGroup>
    </div>
  ),
};
export const Disabled: Story = {
  name: "状态 · 禁用",
  render: () => (
    <div className="w-full max-w-md">
      <P.InputGroup>
        <P.InputGroupAddon>
          <Search />
        </P.InputGroupAddon>
        <P.InputGroupInput
          aria-label="禁用搜索"
          disabled
          placeholder="当前不可搜索"
        />
      </P.InputGroup>
    </div>
  ),
};

type PlaygroundArgs = { align: "inline-start" | "inline-end" | "block-start" | "block-end"; disabled: boolean; invalid: boolean; placeholder: string; addon: string; multiline: boolean };
export const Playground: StoryObj<PlaygroundArgs> = {
  name: "参数调试",
  args: { align: "inline-start", disabled: false, invalid: false, placeholder: "输入项目地址…", addon: "https://", multiline: false },
  argTypes: {
    align: { control: "select", options: ["inline-start", "inline-end", "block-start", "block-end"], description: "InputGroupAddon.align" },
    disabled: { control: "boolean", description: "内部输入控件 disabled" }, invalid: { control: "boolean", description: "内部输入控件 aria-invalid", table: { category: "组合示例" } },
    placeholder: { control: "text", description: "内部输入控件 placeholder" },
    addon: { control: "text", description: "InputGroupText.children", table: { category: "组合示例" } },
    multiline: { control: "boolean", description: "使用 InputGroupTextarea", table: { category: "组合示例" } },
  },
  parameters: { controls: { include: ["align", "disabled", "invalid", "placeholder", "addon", "multiline"] } },
  render: (args) => <div className="w-full max-w-md"><P.InputGroup><P.InputGroupAddon align={args.align}><P.InputGroupText>{args.addon}</P.InputGroupText></P.InputGroupAddon>{args.multiline ? <P.InputGroupTextarea aria-label="项目地址" disabled={args.disabled} aria-invalid={args.invalid} placeholder={args.placeholder} /> : <P.InputGroupInput aria-label="项目地址" disabled={args.disabled} aria-invalid={args.invalid} placeholder={args.placeholder} />}</P.InputGroup></div>,
};
