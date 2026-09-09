import { useState } from 'react';
import { useArgs } from 'storybook/preview-api';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, fn, userEvent, within } from 'storybook/test';
import { Button } from '../../../../packages/ui/src/primitives/button.js';
import { TerminalPrompt, type TerminalPromptEntry } from '../../../../packages/ui/src/complex/terminal-prompt.js';
import { TerminalPromptDemo } from '../../../../packages/ui/src/complex/catalog.js';
import { booleanControl, textControl } from '../feature-controls.js';

const sampleEntries: TerminalPromptEntry[] = [
  { id: 'check', command: 'npm run check', output: '本地示例输出：类型与 token 检查通过。', status: 'success', time: '09:40' },
  { id: 'build', command: 'npm run build', output: '本地示例输出：构建结果由宿主传入。', status: 'success', time: '09:41' },
];

const meta = { id: "复杂-terminalprompt-命令交互",
  title: "复杂/TerminalPrompt 命令交互",
  component: TerminalPrompt,
  args: { entries: sampleEntries, onSubmit: fn() },
  parameters: { docs: { description: { component: '宿主驱动的命令草稿、历史与响应面板；支持异步提交/取消、失败保留、滚动跟随和中文 IME，不执行命令或连接 PTY。' } } },
} satisfies Meta<typeof TerminalPrompt>;
export default meta;
type Story = StoryObj<typeof meta>;

type PlaygroundArgs = {
  entries: TerminalPromptEntry[];
  value: string;
  running: boolean;
  follow: boolean;
  disabled: boolean;
  readOnly: boolean;
  prompt: string;
  label: string;
  outputLabel: string;
  placeholder: string;
  welcome: string;
  emptyMessage: string;
};

export const Playground: StoryObj<PlaygroundArgs> = {
  name: "参数调试",
  args: { entries: sampleEntries, value: '', running: false, follow: true, disabled: false, readOnly: false, prompt: '$', label: '本地命令', outputLabel: '本地命令记录', placeholder: '输入命令…', welcome: '本地参数示例；没有连接 shell 或 PTY。', emptyMessage: '还没有命令记录' },
  argTypes: {
    entries: { control: false },
    value: textControl,
    running: booleanControl,
    follow: booleanControl,
    disabled: booleanControl,
    readOnly: booleanControl,
    prompt: textControl,
    label: textControl,
    outputLabel: textControl,
    placeholder: textControl,
    welcome: textControl,
    emptyMessage: textControl,
  },
  parameters: { controls: { include: ['value', 'running', 'follow', 'disabled', 'readOnly', 'prompt', 'label', 'outputLabel', 'placeholder', 'welcome', 'emptyMessage'] } },
  render: function PlaygroundRender(args) {
    const [, updateArgs] = useArgs<PlaygroundArgs>();
    return <TerminalPrompt
      {...args}
      history={['npm run check', 'npm run build', 'git status --short']}
      onValueChange={value => updateArgs({ value })}
      onFollowChange={follow => updateArgs({ follow })}
      onSubmit={command => updateArgs({ entries: [...args.entries, { id: `local-${args.entries.length}`, command, output: '参数示例只记录输入，没有执行命令。', status: 'success' }] })}
      onCancel={() => updateArgs({ running: false })}
      onClear={() => updateArgs({ entries: [] })}
    />;
  },
};

export const Default: Story = { name: "默认本地示例", render: () => <TerminalPromptDemo /> };

function InteractiveExample() {
  const [entries, setEntries] = useState(sampleEntries);
  return <TerminalPrompt entries={entries} history={entries.map(entry => entry.command)} onSubmit={command => setEntries(current => [...current, { id: `entry-${current.length}`, command, output: `本地示例记录：${command}`, status: 'success' }])} onClear={() => setEntries([])} label="交互命令" outputLabel="交互记录" />;
}

export const Interactive: Story = {
  name: "交互 · 提交、历史与 IME",
  render: () => <InteractiveExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: '交互命令' });
    await userEvent.type(input, '状态');
    fireEvent.compositionStart(input);
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', keyCode: 229, isComposing: true });
    await expect(within(canvas.getByRole('log')).queryByText('状态', { exact: true })).not.toBeInTheDocument();
    fireEvent.compositionEnd(input);
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    await expect(within(canvas.getByRole('log')).getByText('状态', { exact: true })).toBeInTheDocument();
  },
};

function AsyncSubmitExample({ reject = false }: { reject?: boolean }) {
  const [entries, setEntries] = useState(sampleEntries.slice(0, 1));
  return <TerminalPrompt entries={entries} defaultValue="npm run build" label={reject ? '失败命令' : '异步命令'} outputLabel="异步记录" onSubmit={command => new Promise<void>((resolve, rejectPromise) => window.setTimeout(() => {
    if (reject) rejectPromise(new Error('宿主拒绝了本地示例请求')); else { setEntries(current => [...current, { id: 'async', command, output: '异步宿主示例已返回。', status: 'success' }]); resolve(); }
  }, 300))} />;
}

export const AsyncSubmission: Story = { name: "异步提交", render: () => <AsyncSubmitExample /> };
export const SubmissionFailure: Story = { name: "提交失败并保留输入", render: () => <AsyncSubmitExample reject /> };

function RunningExample({ cancelFails = false }: { cancelFails?: boolean }) {
  const [running, setRunning] = useState(true);
  const [entries, setEntries] = useState<TerminalPromptEntry[]>([{ id: 'running', command: 'npm run test:ui', status: 'running' }]);
  return <TerminalPrompt entries={entries} value="npm run test:ui" running={running} label={cancelFails ? '取消失败命令' : '运行中命令'} outputLabel="运行状态" onValueChange={() => undefined} onSubmit={() => undefined} onCancel={() => new Promise<void>((resolve, reject) => window.setTimeout(() => {
    if (cancelFails) reject(new Error('宿主未能取消本地示例请求')); else { setRunning(false); setEntries(current => current.map(entry => ({ ...entry, status: 'cancelled', output: '宿主已确认取消本地示例。' }))); resolve(); }
  }, 240))} />;
}

export const Running: Story = { name: "运行中与取消", render: () => <RunningExample /> };
export const CancelFailure: Story = { name: "取消失败", render: () => <RunningExample cancelFails /> };
export const HistoryNavigation: Story = { name: "命令历史浏览", args: { entries: sampleEntries, history: ['npm run check', 'npm run build', 'git status --short'], defaultValue: '尚未提交的草稿', onSubmit: fn(), label: '历史命令' } };
export const MixedResponses: Story = { name: "混合响应状态", args: { entries: [...sampleEntries, { id: 'error', command: 'open missing.file', output: '本地示例错误：文件不存在。', status: 'error' }, { id: 'cancelled', command: 'npm run long-task', output: '由宿主取消。', status: 'cancelled' }, { id: 'running', command: 'npm run test:ui', status: 'running' }], onSubmit: fn(), label: '混合状态命令' } };
export const LongOutput: Story = { name: "长输出与局部滚动", args: { entries: [{ id: 'long', command: 'print --verbose', output: Array.from({ length: 32 }, (_, index) => `第 ${index + 1} 行本地输出：${'workspace/'.repeat(8)}`).join('\n'), status: 'success' }], onSubmit: fn(), label: '长输出命令' } };
export const FollowPaused: Story = { name: "暂停输出跟随", args: { entries: Array.from({ length: 24 }, (_, index) => ({ id: `row-${index}`, command: `local-task-${index + 1}`, output: `第 ${index + 1} 条本地响应`, status: 'success' as const })), defaultFollow: false, onSubmit: fn(), label: '暂停跟随命令' } };
export const HostError: Story = { name: "宿主错误", args: { entries: sampleEntries, onSubmit: fn(), error: '宿主连接不可用，请检查本地适配器。', label: '宿主错误命令' } };
export const Empty: Story = { name: "空记录", args: { entries: [], onSubmit: fn(), welcome: null, emptyMessage: '当前工作区没有命令记录', label: '空命令' } };
export const ReadOnly: Story = { name: "只读输入", args: { entries: sampleEntries, value: 'npm run check', readOnly: true, onSubmit: fn(), label: '只读命令' } };
export const Disabled: Story = { name: "整体禁用", args: { entries: sampleEntries, value: 'npm run check', disabled: true, onSubmit: fn(), onClear: fn(), label: '禁用命令' } };
export const CustomPrompt: Story = { name: "自定义提示符", args: { entries: [{ id: 'custom', command: 'status', prompt: 'reito ›', output: '本地状态示例', status: 'success' }], prompt: 'reito ›', onSubmit: fn(), label: '自定义提示符命令' } };
export const Narrow: Story = { name: "窄工作面", args: { entries: sampleEntries, onSubmit: fn(), label: '窄命令' }, render: args => <div className="max-w-[var(--rui-container-3xs)]"><TerminalPrompt {...args} /></div> };

export const ExternalDraftUpdate: Story = {
  name: "提交期间宿主更新草稿",
  render: function Render() {
    const [value, setValue] = useState('first command');
    return <div className="grid gap-[var(--rui-content-gap)]"><Button size="xs" variant="outline" onClick={() => setValue('host replacement')}>宿主更新草稿</Button><TerminalPrompt entries={[]} value={value} onValueChange={setValue} onSubmit={() => new Promise(resolve => window.setTimeout(resolve, 350))} label="宿主更新命令" /></div>;
  },
};
