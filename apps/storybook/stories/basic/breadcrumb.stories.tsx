import * as P from "@reito/ui/basic";

import type { Meta, StoryObj } from "@storybook/react-vite";
import { BreadcrumbDemo } from "../../../../packages/ui/src/basic/catalog.js";

const meta = { id: "基础-breadcrumb",
  title: "基础/Breadcrumb 面包屑",
  component: BreadcrumbDemo,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "层级导航与当前页标识。 使用官方 shadcn Base UI / base-nova 组合 API；交互只更新本地示例状态。",
      },
    },
  },
} satisfies Meta<typeof BreadcrumbDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: "交互演示",
  render: () => <BreadcrumbDemo />,
};

export const Default: Story = {
  name: "布局 · 层级路径",
  render: () => (
    <P.Breadcrumb>
      <P.BreadcrumbList>
        <P.BreadcrumbItem>
          <P.BreadcrumbLink
            href="#workspace"
            onClick={(event) => event.preventDefault()}
          >
            工作区
          </P.BreadcrumbLink>
        </P.BreadcrumbItem>
        <P.BreadcrumbSeparator />
        <P.BreadcrumbItem>
          <P.BreadcrumbPage>组件文档</P.BreadcrumbPage>
        </P.BreadcrumbItem>
      </P.BreadcrumbList>
    </P.Breadcrumb>
  ),
};
export const CurrentPage: Story = {
  name: "内容 · 仅当前页",
  render: () => (
    <P.Breadcrumb>
      <P.BreadcrumbList>
        <P.BreadcrumbItem>
          <P.BreadcrumbPage>研究工作台</P.BreadcrumbPage>
        </P.BreadcrumbItem>
      </P.BreadcrumbList>
    </P.Breadcrumb>
  ),
};
export const CustomSeparator: Story = {
  name: "样式 · 斜线分隔",
  render: () => (
    <P.Breadcrumb>
      <P.BreadcrumbList>
        <P.BreadcrumbItem>
          <P.BreadcrumbLink
            href="#components"
            onClick={(event) => event.preventDefault()}
          >
            基础组件
          </P.BreadcrumbLink>
        </P.BreadcrumbItem>
        <P.BreadcrumbSeparator>/</P.BreadcrumbSeparator>
        <P.BreadcrumbItem>
          <P.BreadcrumbPage>Button</P.BreadcrumbPage>
        </P.BreadcrumbItem>
      </P.BreadcrumbList>
    </P.Breadcrumb>
  ),
};

type PlaygroundArgs = { parent: string; current: string; separator: "chevron" | "slash"; showParent: boolean };
export const Playground: StoryObj<PlaygroundArgs> = {
  name: "参数调试",
  args: { parent: "工作区", current: "组件文档", separator: "chevron", showParent: true },
  argTypes: {
    parent: { control: "text", description: "BreadcrumbLink.children", table: { category: "组合示例" } },
    current: { control: "text", description: "BreadcrumbPage.children", table: { category: "组合示例" } },
    separator: { control: "select", options: ["chevron", "slash"], description: "BreadcrumbSeparator.children", table: { category: "组合示例" } },
    showParent: { control: "boolean", table: { category: "组合示例" } },
  },
  parameters: { controls: { include: ["parent", "current", "separator", "showParent"] } },
  render: (args) => <P.Breadcrumb><P.BreadcrumbList>{args.showParent && <><P.BreadcrumbItem><P.BreadcrumbLink href="#workspace" onClick={(event) => event.preventDefault()}>{args.parent}</P.BreadcrumbLink></P.BreadcrumbItem><P.BreadcrumbSeparator>{args.separator === "slash" ? "/" : undefined}</P.BreadcrumbSeparator></>}<P.BreadcrumbItem><P.BreadcrumbPage>{args.current}</P.BreadcrumbPage></P.BreadcrumbItem></P.BreadcrumbList></P.Breadcrumb>,
};
