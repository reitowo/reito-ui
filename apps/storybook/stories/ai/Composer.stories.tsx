import { useArgs } from 'storybook/preview-api';
import { textControl, booleanControl } from '../feature-controls.js';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, useRef, useEffect } from 'react';
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test';
import { Composer, type ComposerProps, type ComposerDraft } from '../../../../packages/ui/src/ai/composer.js';
import { ComposerDemo, demoComposerCommands, demoComposerMentions } from '../../../../packages/ui/src/ai/catalog.js';
import { Button } from '../../../../packages/ui/src/primitives/button.js';
import { StoryFrame } from './story-frame.js';

const meta = { title: 'AI/Composer', component: Composer, args: { onSubmit: fn() }, decorators: [Story => <StoryFrame><Story /></StoryFrame>], parameters: { docs: { description: { component: '受控或内部草稿；Enter 提交、Shift+Enter 换行、中文 IME 组合保护。异步提交成功才清空未改动的草稿，失败保留。请求和停止行为由宿主提供。' } } } } satisfies Meta<typeof Composer>;
export default meta;
type Story = StoryObj<typeof meta>;

type PlaygroundArgs = { value: string; disabled: boolean; running: boolean; placeholder: string; label: string; hint: string; error: string; enableCommands: boolean; enableMentions: boolean; includeContext: boolean };
function ComposerPlayground({ args, updateArgs }: { args: PlaygroundArgs; updateArgs: (next: Partial<PlaygroundArgs>) => void }) {
    const [localText, setLocalText] = useState(args.value);
    const pendingEchoes = useRef<string[]>([]);
    useEffect(() => {
      const echo = pendingEchoes.current.indexOf(args.value);
      if (echo >= 0) { pendingEchoes.current.splice(0, echo + 1); return; }
      setLocalText(args.value);
    }, [args.value]);
    return <Composer
      value={localText}
      onValueChange={value => { setLocalText(value); pendingEchoes.current.push(value); updateArgs({ value }); }}
      onSubmit={fn()}
      commandItems={args.enableCommands ? demoComposerCommands : []}
      mentionItems={args.enableMentions ? demoComposerMentions : []}
      contextItems={args.includeContext ? [{ id: 'workspace', label: '当前工作区' }] : []}
      disabled={args.disabled}
      running={args.running}
      onStop={() => updateArgs({ running: false })}
      placeholder={args.placeholder}
      label={args.label}
      hint={args.hint}
      error={args.error}
    />;
}

export const Playground: StoryObj<PlaygroundArgs> = {
  name: '参数调试',
  args: { value: '', disabled: false, running: false, placeholder: '描述你的下一步…', label: '消息草稿', hint: 'Enter 发送 · Shift + Enter 换行 · / 命令 · @ 提及', error: '', enableCommands: true, enableMentions: true, includeContext: true },
  argTypes: { value: textControl, disabled: booleanControl, running: booleanControl, placeholder: textControl, label: textControl, hint: textControl, error: textControl, enableCommands: booleanControl, enableMentions: booleanControl, includeContext: booleanControl },
  parameters: { controls: { include: ['value', 'disabled', 'running', 'placeholder', 'label', 'hint', 'error', 'enableCommands', 'enableMentions', 'includeContext'] } },
  render: function PlaygroundRender(args) {
    const [, updateArgs] = useArgs();
    return <ComposerPlayground args={args} updateArgs={updateArgs} />;
  },
};

export const Guidelines: Story = { name: '交互场景：上下文、输入与发送', render: () => <ComposerDemo /> };
export const Disabled: Story = { name: '禁用', args: { disabled: true, defaultValue: '等待选择工作区' } };
export const Empty: Story = { name: '空草稿', args: { placeholder: '开始一条本地请求…' } };
export const ExternalError: Story = { name: '外部错误', args: { defaultValue: '检查共享令牌', error: '当前工作区不可用，草稿已保留。' } };
export const Submitting: Story = { name: '提交中', args: { defaultValue: '提交期间保留草稿', onSubmit: fn(() => new Promise<void>(() => undefined)) }, play: async ({ canvasElement }) => { const canvas = within(canvasElement); await userEvent.click(canvas.getByRole('button', { name: '发送消息' })); await expect(canvas.getByRole('button', { name: '正在提交' })).toBeDisabled(); await expect(canvas.getByRole('textbox')).toHaveValue('提交期间保留草稿'); } };
export const FailedSubmissionRetainsDraft: Story = { name: '交互场景：失败保留草稿与重试',
  args: { onSubmit: fn() },
  play: async ({ canvasElement, args }) => {
    args.onSubmit.mockRejectedValueOnce(new Error('本地提交失败，请重试。')).mockResolvedValue(undefined);
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: '消息草稿' });
    await expect(canvas.getByRole('button', { name: '发送消息' })).toBeDisabled();
    await userEvent.type(input, '检查共享令牌');
    await userEvent.keyboard('{Enter}');
    await expect(await canvas.findByRole('alert')).toHaveTextContent('本地提交失败，请重试。');
    await expect(input).toHaveValue('检查共享令牌');
    await userEvent.click(canvas.getByRole('button', { name: '发送消息' }));
    await waitFor(() => expect(input).toHaveValue(''));
    await expect(args.onSubmit).toHaveBeenCalledTimes(2);
    await expect(args.onSubmit).toHaveBeenLastCalledWith('检查共享令牌');
  },
};
export const CompositionAndMultiline: Story = { name: '交互场景：中文 IME 与多行',
  play: async ({ canvasElement, args }) => {
    const input = within(canvasElement).getByRole('textbox', { name: '消息草稿' });
    await userEvent.click(input);
    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: '检查设计规范' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', keyCode: 229, isComposing: true });
    await expect(args.onSubmit).not.toHaveBeenCalled();
    fireEvent.compositionEnd(input);
    await userEvent.keyboard('{End}');
    await userEvent.keyboard('{Shift>}{Enter}{/Shift}');
    await userEvent.type(input, '补充焦点状态');
    await expect(input).toHaveValue('检查设计规范\n补充焦点状态');
    await expect(args.onSubmit).not.toHaveBeenCalled();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(input).toHaveValue(''));
    await expect(args.onSubmit).toHaveBeenCalledWith('检查设计规范\n补充焦点状态');
  },
  parameters: { docs: { description: { story: '此 play 检查合成 composition 事件与换行保护；操作系统的真实中文输入法仍需人工检查。' } } },
};
export const StopAction: Story = { name: '交互场景：停止生成', args: { onStop: fn(), defaultValue: '下一条草稿' }, render: function StopDemo(args) { const [running, setRunning] = useState(true); return <Composer {...args} running={running} onStop={() => { args.onStop?.(); setRunning(false); }} />; }, play: async ({ canvasElement, args }) => { const canvas = within(canvasElement); await userEvent.click(canvas.getByRole('button', { name: '停止生成' })); await expect(args.onStop).toHaveBeenCalledTimes(1); await expect(canvas.getByRole('textbox')).toHaveValue('下一条草稿'); await expect(canvas.getByRole('button', { name: '发送消息' })).toBeEnabled(); } };
export const StopPreservesControlledDraft: Story = { name: '交互场景：停止并保留受控草稿',
  render: function ControlledStopDemo(args) {
    const [running, setRunning] = useState(true);
    const [value, setValue] = useState('停止后继续编辑这一条草稿');
    return <Composer {...args} value={value} onValueChange={setValue} running={running} onStop={() => setRunning(false)} />;
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '停止生成' }));
    await expect(canvas.getByRole('button', { name: '发送消息' })).toBeEnabled();
    await expect(canvas.getByRole('textbox', { name: '消息草稿' })).toHaveValue('停止后继续编辑这一条草稿');
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
  parameters: { docs: { description: { story: '宿主同步切换 running=false 时，停止按钮的默认点击行为不会转成表单提交；受控草稿保留。' } } },
};

export const Default: Story = { name: '默认草稿', args: { defaultValue: '检查共享组件在桌面工作区里的布局。' } };
export const Running: Story = { name: '生成中', args: { running: true, onStop: fn(), defaultValue: '可继续编辑下一条草稿' } };

export const SlashCommands: Story = {
  name: '交互场景：斜杠命令',
  args: { commandItems: demoComposerCommands },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: '消息草稿' });
    await userEvent.type(input, '/rev');
    const listbox = canvas.getByRole('listbox', { name: '斜杠命令' });
    await expect(within(listbox).getByRole('option', { name: /review/ })).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{Enter}');
    await expect(input).toHaveValue('请审查当前改动：');
    await expect(listbox).not.toBeInTheDocument();
  },
};

export const FileAndPersonMentions: Story = {
  name: '交互场景：文件与人员提及',
  args: { mentionItems: demoComposerMentions },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: '消息草稿' });
    await userEvent.type(input, '@des');
    await expect(canvas.getByRole('listbox', { name: '提及建议' })).toBeVisible();
    await userEvent.keyboard('{Enter}');
    await expect(input).toHaveValue('@design-language.md ');
    const context = canvas.getByRole('group', { name: '草稿上下文与提及' });
    await expect(within(context).getByText('@design-language.md')).toBeVisible();
    await userEvent.type(input, '@Re');
    await userEvent.keyboard('{Enter}');
    await expect(input).toHaveValue('@design-language.md @Reito ');
  },
};

function StructuredDraftExample({ onSubmit }: { onSubmit: NonNullable<ComposerProps['onSubmitDraft']> }) {
  const [draft, setDraft] = useState<ComposerDraft>({ text: '@design-language.md 请检查令牌', mentions: [{ key: 'file:design:1', itemId: 'design', label: 'design-language.md', kind: 'file', start: 0, end: 19 }], contextIds: ['workspace'] });
  const [contexts, setContexts] = useState([{ id: 'workspace', label: '当前工作区' }]);
  return <Composer draft={draft} onDraftChange={setDraft} onSubmit={() => undefined} onSubmitDraft={onSubmit} mentionItems={demoComposerMentions} contextItems={contexts} onContextRemove={id => setContexts(current => current.filter(item => item.id !== id))} />;
}
export const StructuredDraftSubmission: Story = {
  name: '结构化草稿提交',
  args: { onSubmit: fn() },
  render: args => <StructuredDraftExample onSubmit={args.onSubmit} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '发送消息' }));
    await expect(args.onSubmit).toHaveBeenCalledTimes(1);
    const [submitted] = args.onSubmit.mock.calls[0];
    await expect(submitted.mentions[0]).toMatchObject({ itemId: 'design', kind: 'file', start: 0, end: 19 });
    await expect(submitted.contextIds).toEqual(['workspace']);
    await waitFor(() => expect(canvas.getByRole('textbox')).toHaveValue(''));
  },
};

export const MentionRemoval: Story = {
  name: '交互场景：移除提及值',
  args: { mentionItems: demoComposerMentions },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: '消息草稿' });
    await userEvent.type(input, '@composer');
    await userEvent.keyboard('{Enter}');
    await userEvent.type(input, '检查输入行为');
    await userEvent.click(canvas.getByRole('button', { name: '移除@composer.tsx' }));
    await expect(input).toHaveValue('检查输入行为');
  },
};

export const DisabledAndEmptySuggestions: Story = { name: '禁用与空建议', args: { commandItems: demoComposerCommands, mentionItems: demoComposerMentions, defaultValue: '/remote' } };

export const StructuredFailure: Story = {
  name: '结构化提交失败与恢复',
  render: function StructuredFailureExample() {
    const [attempts, setAttempts] = useState(0);
    const [receipt, setReceipt] = useState('');
    return <><Composer
      defaultDraft={{ text: '@Reito 检查布局', mentions: [{ key: 'person:reito:1', itemId: 'reito', label: 'Reito', kind: 'person', start: 0, end: 6 }], contextIds: ['workspace-42'] }}
      mentionItems={demoComposerMentions}
      onSubmit={() => { throw new Error('不应调用旧回调'); }}
      onSubmitDraft={async submitted => {
        setAttempts(current => current + 1);
        if (!attempts) throw new Error('本地提交失败，保留全部草稿');
        setReceipt(JSON.stringify(submitted));
      }}
    /><output aria-label="提交结果">{receipt}</output></>;
  },
};

export const LongSuggestions: Story = {
  name: '长建议列表键盘定位',
  args: { commandItems: Array.from({ length: 30 }, (_, index) => ({ id: `command-${index}`, label: `command-${index}`, description: `本地命令 ${index + 1}`, insertText: `命令 ${index + 1}` })) },
};

export const ReplacePendingDraft: Story = {
  name: '提交期间宿主替换草稿',
  render: function ReplacePendingDraftExample() {
    const [draft, setDraft] = useState<ComposerDraft>({ text: '原始草稿', mentions: [], contextIds: ['original'] });
    const complete = useRef<() => void>(() => undefined);
    return <>
      <Composer draft={draft} onDraftChange={setDraft} onSubmit={() => undefined} onSubmitDraft={() => new Promise<void>(resolve => { complete.current = resolve; })} />
      <Button type="button" variant="outline" size="sm" onClick={() => setDraft({ text: '@Reito 新草稿', mentions: [{ key: 'new-person', itemId: 'reito', label: 'Reito', kind: 'person', start: 0, end: 6 }], contextIds: ['replacement'] })}>宿主替换草稿</Button>
      <Button type="button" variant="outline" size="sm" onClick={() => complete.current()}>完成旧请求</Button>
    </>;
  },
};
