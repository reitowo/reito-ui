import { useRef, useState } from 'react';
import { useArgs } from 'storybook/preview-api';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../../../../packages/ui/src/primitives/button.js';
import {
  OverlayProvider,
  useOverlay,
  type OverlayKind,
  type OverlayOptions,
  type OverlayOutcome,
  type OverlaySide,
} from '../../../../packages/ui/src/complex/overlay-provider.js';
import { OverlayProviderDemo } from '../../../../packages/ui/src/complex/catalog.js';
import { booleanControl, choiceControl, textControl } from '../feature-controls.js';

const meta = { id: "复杂-overlayprovider-命令式浮层",
  title: "复杂/OverlayProvider 命令式浮层",
  component: OverlayProvider,
  args: { children: null },
  tags: ['autodocs'],
  parameters: {
    docs: {
      story: { inline: false, height: 'var(--rui-container-lg)' },
      description: {
        component: '在声明式 Dialog、Sheet、AlertDialog 之上提供可选的命令式事务层。open 返回带稳定 ID、result Promise、close、dismiss 和 patch 的句柄；Provider 管理栈、焦点归还、父层关闭和卸载收口。',
      },
    },
  },
} satisfies Meta<typeof OverlayProvider>;
export default meta;
type Story = StoryObj<typeof meta>;

function outcomeText(outcome: OverlayOutcome<unknown>) {
  return outcome.status === 'closed' ? `已返回：${String(outcome.value)}` : `已关闭：${outcome.reason}`;
}

function ResultLauncher({ label, options }: { label: string; options: OverlayOptions<unknown> }) {
  const overlay = useOverlay();
  const [status, setStatus] = useState('等待打开');
  async function open() {
    const handle = overlay.open(options);
    setStatus(`已打开：${handle.id}`);
    setStatus(outcomeText(await handle.result));
  }
  return <div className="grid justify-items-start gap-[var(--rui-content-gap-sm)]">
    <Button type="button" size="sm" variant="outline" onClick={open}>{label}</Button>
    <p role="status" className="text-xs text-muted-foreground">{status}</p>
  </div>;
}

function ResultStory(props: { label: string; options: OverlayOptions<unknown> }) {
  return <OverlayProvider><ResultLauncher {...props} /></OverlayProvider>;
}

type PlaygroundArgs = {
  kind: OverlayKind;
  title: string;
  description: string;
  content: string;
  confirmLabel: string;
  cancelLabel: string;
  closeLabel: string;
  sheetSide: OverlaySide;
  destructive: boolean;
  dismissible: boolean;
  showCancel: boolean;
  status: string;
};

function PlaygroundLauncher({ update, ...args }: PlaygroundArgs & { update: (next: Partial<PlaygroundArgs>) => void }) {
  const overlay = useOverlay();
  async function open() {
    const handle = overlay.open<boolean>({
      kind: args.kind,
      title: args.title,
      description: args.description,
      content: args.content,
      confirmLabel: args.confirmLabel,
      confirmValue: true,
      cancelLabel: args.cancelLabel,
      closeLabel: args.closeLabel,
      sheetSide: args.sheetSide,
      destructive: args.destructive,
      dismissible: args.dismissible,
      showCancel: args.showCancel,
    });
    update({ status: outcomeText(await handle.result) });
  }
  return <div className="grid justify-items-start gap-[var(--rui-content-gap-sm)]">
    <Button type="button" size="sm" variant="outline" onClick={open}>打开参数浮层</Button>
    <p role="status" className="text-xs text-muted-foreground">{args.status}</p>
  </div>;
}

export const Playground: StoryObj<PlaygroundArgs> = {
  name: "参数调试",
  args: {
    kind: 'dialog',
    title: '应用工作区设置？',
    description: '确认后只更新本地 Story 状态。',
    content: '浮层内容可传 ReactNode，也可以使用带 close、dismiss、patch、open 的渲染函数。',
    confirmLabel: '应用',
    cancelLabel: '取消',
    closeLabel: '关闭',
    sheetSide: 'right',
    destructive: false,
    dismissible: true,
    showCancel: true,
    status: '等待打开',
  },
  argTypes: {
    kind: choiceControl(['dialog', 'sheet', 'alert-dialog']),
    title: textControl,
    description: textControl,
    content: textControl,
    confirmLabel: textControl,
    cancelLabel: textControl,
    closeLabel: textControl,
    sheetSide: choiceControl(['top', 'right', 'bottom', 'left']),
    destructive: booleanControl,
    dismissible: booleanControl,
    showCancel: booleanControl,
    status: { control: false },
  },
  parameters: { controls: { include: ['kind', 'title', 'description', 'content', 'confirmLabel', 'cancelLabel', 'closeLabel', 'sheetSide', 'destructive', 'dismissible', 'showCancel'] } },
  render: function PlaygroundRender(args) {
    const [, updateArgs] = useArgs<PlaygroundArgs>();
    return <OverlayProvider><PlaygroundLauncher {...args} update={updateArgs} /></OverlayProvider>;
  },
};

export const Default: Story = { name: "默认本地示例", render: () => <OverlayProviderDemo /> };

export const DialogResult: Story = {
  name: "Dialog 返回结果",
  render: () => <ResultStory label="选择布局" options={{ title: '选择工作区布局', description: '结果通过句柄的 Promise 返回。', content: '当前选择：紧凑布局', confirmLabel: '使用紧凑布局', confirmValue: 'compact' }} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: '选择布局' }));
    await waitFor(() => expect(body.getByRole('dialog')).toBeVisible());
  },
};

export const SheetResult: Story = {
  name: "Sheet 侧边详情",
  render: () => <ResultStory label="打开任务详情" options={{ kind: 'sheet', sheetSide: 'right', title: '任务详情', description: '辅助详情从右侧进入。', content: '检查 tokens、Storybook 与四种主题密度组合。', confirmLabel: '完成', confirmValue: 'done', showCancel: false }} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: '打开任务详情' }));
    await waitFor(() => expect(body.getByRole('dialog')).toBeVisible());
  },
};

export const AlertDialogResult: Story = {
  name: "AlertDialog 危险确认",
  render: () => <ResultStory label="移除本地草稿" options={{ kind: 'alert-dialog', title: '移除这份草稿？', description: '移除后无法从当前工作区恢复。', destructive: true, confirmLabel: '移除', confirmValue: true }} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: '移除本地草稿' }));
    await waitFor(() => expect(body.getByRole('alertdialog')).toBeVisible());
  },
};

export const NonDismissible: Story = {
  name: "阻止 Escape 与外部关闭",
  render: () => <ResultStory label="打开关键步骤" options={{ title: '关键步骤仍在进行', description: 'Escape 与点击外部不会结束事务。', content: '使用明确按钮完成或取消。', dismissible: false, confirmLabel: '完成', confirmValue: true }} />,
};

function NestedLauncher() {
  const overlay = useOverlay();
  const [status, setStatus] = useState('等待打开');
  async function openParent() {
    const parent = overlay.open<string>({
      title: '编辑工作区',
      description: '子确认层关闭后焦点回到父层入口。',
      content: context => <Button type="button" size="sm" variant="outline" onClick={async event => {
        const child = context.open<boolean>({ kind: 'alert-dialog', title: '放弃当前修改？', description: '父层仍保留在后方。', destructive: true, confirmLabel: '放弃', confirmValue: true });
        setStatus(`子层入口：${event.currentTarget.textContent}`);
        setStatus(`子层${outcomeText(await child.result)}`);
      }}>打开嵌套确认</Button>,
      confirmLabel: '保存',
      confirmValue: 'saved',
    });
    setStatus(outcomeText(await parent.result));
  }
  return <div className="grid justify-items-start gap-[var(--rui-content-gap-sm)]">
    <Button type="button" size="sm" variant="outline" onClick={openParent}>编辑工作区</Button>
    <p role="status" className="text-xs text-muted-foreground">{status}</p>
  </div>;
}

export const Nested: Story = { name: "嵌套确认与焦点", render: () => <OverlayProvider><NestedLauncher /></OverlayProvider> };

function ConcurrentLauncher() {
  const overlay = useOverlay();
  const [status, setStatus] = useState('等待打开');
  async function openBoth() {
    const first = overlay.open({ title: '第一层任务', description: '较早打开的浮层位于栈底。', confirmLabel: '完成第一层' });
    const second = overlay.open({ kind: 'sheet', title: '第二层详情', description: '较晚打开的浮层位于栈顶。', confirmLabel: '完成第二层' });
    const results = await Promise.all([first.result, second.result]);
    setStatus(results.map(outcomeText).join('；'));
  }
  return <div className="grid justify-items-start gap-[var(--rui-content-gap-sm)]">
    <Button type="button" size="sm" variant="outline" onClick={openBoth}>同时打开两层</Button>
    <p role="status" className="text-xs text-muted-foreground">{status}</p>
  </div>;
}

export const ConcurrentStack: Story = { name: "并发栈", render: () => <OverlayProvider><ConcurrentLauncher /></OverlayProvider> };

function PatchLauncher() {
  const overlay = useOverlay();
  const [status, setStatus] = useState('等待打开');
  async function open() {
    const handle = overlay.open({ title: '正在读取任务', description: '句柄可以更新仍在栈中的配置。', content: '本地数据准备中…', closeLabel: '关闭' });
    window.setTimeout(() => handle.patch({ title: '任务详情已更新', content: '已读取 3 条本地记录。' }), 120);
    setStatus(outcomeText(await handle.result));
  }
  return <div className="grid justify-items-start gap-[var(--rui-content-gap-sm)]">
    <Button type="button" size="sm" variant="outline" onClick={open}>打开并更新</Button>
    <p role="status" className="text-xs text-muted-foreground">{status}</p>
  </div>;
}

export const PatchOpenOverlay: Story = { name: "更新已打开浮层", render: () => <OverlayProvider><PatchLauncher /></OverlayProvider> };

function CloseAllLauncher() {
  const overlay = useOverlay();
  const [status, setStatus] = useState('等待打开');
  async function openBoth() {
    const first = overlay.open({ title: '批处理摘要', description: '第一层仍有未决结果。', confirmLabel: '完成' });
    const second = overlay.open({ title: '运行详情', description: '关闭全部会结束栈中的每个 Promise。', footer: <Button type="button" size="sm" onClick={() => overlay.closeAll()}>关闭全部浮层</Button> });
    const results = await Promise.all([first.result, second.result]);
    setStatus(results.map(outcomeText).join('；'));
  }
  return <div className="grid justify-items-start gap-[var(--rui-content-gap-sm)]">
    <Button type="button" size="sm" variant="outline" onClick={openBoth}>打开批处理浮层</Button>
    <p role="status" className="text-xs text-muted-foreground">{status}</p>
  </div>;
}

export const CloseAll: Story = { name: "关闭全部", render: () => <OverlayProvider><CloseAllLauncher /></OverlayProvider> };

function AncestorCloseLauncher() {
  const overlay = useOverlay();
  const [status, setStatus] = useState('等待打开');
  async function openBoth() {
    const parent = overlay.open({ title: '父层编辑事务', description: '关闭父层时，它上面的子层也必须结束。', confirmLabel: '保存父层' });
    const child = overlay.open({ title: '子层辅助事务', description: '从这里模拟宿主关闭父层。', footer: <Button type="button" size="sm" onClick={() => parent.close()}>关闭父层事务</Button> });
    const results = await Promise.all([parent.result, child.result]);
    setStatus(results.map(outcomeText).join('；'));
  }
  return <div className="grid justify-items-start gap-[var(--rui-content-gap-sm)]">
    <Button type="button" size="sm" variant="outline" onClick={openBoth}>打开父子事务</Button>
    <p role="status" className="text-xs text-muted-foreground">{status}</p>
  </div>;
}

export const AncestorClose: Story = { name: "父层关闭子层收口", render: () => <OverlayProvider><AncestorCloseLauncher /></OverlayProvider> };

function UnmountLauncher({ onUnmount, onResult }: { onUnmount: () => void; onResult: (value: string) => void }) {
  const overlay = useOverlay();
  async function open() {
    const handle = overlay.open({ title: '等待宿主切换', description: '卸载 Provider 会明确结束未决 Promise。', footer: <Button type="button" size="sm" onClick={onUnmount}>卸载 Provider</Button> });
    onResult(outcomeText(await handle.result));
  }
  return <Button type="button" size="sm" variant="outline" onClick={open}>打开卸载示例</Button>;
}

function ProviderUnmountExample() {
  const [mounted, setMounted] = useState(true);
  const [status, setStatus] = useState('Provider 已挂载');
  return <div className="grid justify-items-start gap-[var(--rui-content-gap-sm)]">
    {mounted ? <OverlayProvider><UnmountLauncher onUnmount={() => setMounted(false)} onResult={setStatus} /></OverlayProvider> : <Button type="button" size="sm" variant="outline" onClick={() => { setMounted(true); setStatus('Provider 已重新挂载'); }}>重新挂载 Provider</Button>}
    <p role="status" className="text-xs text-muted-foreground">{status}</p>
  </div>;
}

export const ProviderUnmount: Story = { name: "卸载收口", render: () => <ProviderUnmountExample /> };

function HandleDismissLauncher() {
  const overlay = useOverlay();
  const handle = useRef<ReturnType<typeof overlay.open> | null>(null);
  const [status, setStatus] = useState('等待打开');
  async function open() {
    handle.current = overlay.open({ title: '可由句柄关闭', description: '调用点保留当前浮层句柄。', content: '本地示例会在短暂延迟后调用 handle.dismiss。', closeLabel: '立即关闭' });
    setStatus(`句柄已打开：${handle.current.isOpen}`);
    window.setTimeout(() => handle.current?.dismiss('programmatic'), 320);
    setStatus(outcomeText(await handle.current.result));
  }
  return <div className="flex flex-wrap items-center gap-[var(--rui-content-gap-sm)]">
    <Button type="button" size="sm" variant="outline" onClick={open}>打开并由句柄关闭</Button>
    <p role="status" className="basis-full text-xs text-muted-foreground">{status}</p>
  </div>;
}

export const HandleDismiss: Story = { name: "句柄关闭", render: () => <OverlayProvider><HandleDismissLauncher /></OverlayProvider> };
