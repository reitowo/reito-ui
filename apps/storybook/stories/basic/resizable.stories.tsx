import { useState } from 'react';
import { Button, ResizablePanelGroup, ResizablePanel, ResizableHandle } from '../../../../packages/ui/src/basic.js';
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ResizableDemo } from "../../../../packages/ui/src/basic/catalog.js";

const meta = { id: "基础-resizable",
  title: "基础/Resizable 可调整分栏",
  component: ResizableDemo,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "鼠标与键盘可调整的双面板。 使用官方 shadcn Base UI / base-nova 组合 API；交互只更新本地示例状态。",
      },
    },
  },
} satisfies Meta<typeof ResizableDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: "交互演示",
};

function WorkspacePanels({ vertical = false, handle = true }: { vertical?: boolean; handle?: boolean }) {
  const [details, setDetails] = useState(false);
  return (
    <div className="h-64 w-full max-w-xl rounded-lg border">
    <ResizablePanelGroup orientation={vertical ? 'vertical' : 'horizontal'}>
      <ResizablePanel defaultSize="35%" minSize="20%">
        <nav aria-label="文件导航" className="p-[var(--rui-content-padding)]">
          <Button variant="ghost" size="sm" onClick={() => setDetails(false)}>design-language.md</Button>
        </nav>
      </ResizablePanel>
      <ResizableHandle withHandle={handle} aria-label={vertical ? '调整面板高度' : '调整面板宽度'} />
      <ResizablePanel defaultSize="65%" minSize="30%">
        <section aria-label="文件预览" className="grid gap-[var(--rui-content-gap-sm)] p-[var(--rui-content-padding)] text-sm">
          <p>共享主题、密度与组件规则。</p>
          <Button variant="outline" size="sm" className="w-fit" aria-expanded={details} onClick={() => setDetails(!details)}>{details ? '收起说明' : '查看说明'}</Button>
          {details && <p className="text-muted-foreground">修改源 tokens 后重新生成样式，在深浅主题与两种密度下检查组件。缩小面板时，内容在各自面板内滚动。</p>}
        </section>
      </ResizablePanel>
    </ResizablePanelGroup>
    </div>
  );
}
export const Default: Story = { name: "横向分栏", render: () => <WorkspacePanels /> };
export const Vertical: Story = { name: "纵向分栏", render: () => <WorkspacePanels vertical /> };
export const PlainDivider: Story = { name: "无把手分隔线", render: () => <WorkspacePanels handle={false} /> };

export const Playground: StoryObj<{ orientation: 'horizontal' | 'vertical'; withHandle: boolean }> = {
  name: "参数调试", args: { orientation: 'horizontal', withHandle: true },
  argTypes: { orientation: { control: 'select', options: ['horizontal', 'vertical'], table: { category: 'ResizablePanelGroup' } }, withHandle: { control: 'boolean', table: { category: 'ResizableHandle' } } },
  parameters: { controls: { include: ['orientation', 'withHandle'] } },
  render: args => <WorkspacePanels vertical={args.orientation === 'vertical'} handle={args.withHandle} />,
};
