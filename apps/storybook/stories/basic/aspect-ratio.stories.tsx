import * as React from "react";
import * as P from "@reito/ui/basic";

import type { Meta, StoryObj } from "@storybook/react-vite";
import { AspectRatioDemo } from "../../../../packages/ui/src/basic/catalog.js";

const meta = {
  title: "基础/Aspect Ratio",
  component: AspectRatioDemo,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "保持固定比例的内容容器。 使用官方 shadcn Base UI / base-nova 组合 API；交互只更新本地示例状态。",
      },
    },
  },
} satisfies Meta<typeof AspectRatioDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: "交互示例",
  render: () => <AspectRatioDemo />,
};

function RatioPreview(props: React.ComponentProps<typeof P.AspectRatio>) {
  return (
    <div className="w-full max-w-sm">
      <P.AspectRatio
        {...props}
        className="flex items-center justify-center rounded-lg border bg-muted text-sm text-muted-foreground"
      >
        预览区域
      </P.AspectRatio>
    </div>
  );
}
export const Default: Story = {
  name: "比例 / 16 比 9",
  render: () => <RatioPreview ratio={16 / 9} />,
};
export const Standard: Story = {
  name: "比例 / 4 比 3",
  render: () => <RatioPreview ratio={4 / 3} />,
};
export const Square: Story = {
  name: "比例 / 正方形",
  render: () => <RatioPreview ratio={1} />,
};

type PlaygroundArgs = { ratio: number };
export const Playground: StoryObj<PlaygroundArgs> = {
  name: "参数调试",
  args: { ratio: 16 / 9 },
  argTypes: { ratio: { control: { type: "range", min: 0.5, max: 3, step: 0.05 } } },
  parameters: { controls: { include: ["ratio"] } },
  render: (args) => <RatioPreview ratio={args.ratio} />,
};
