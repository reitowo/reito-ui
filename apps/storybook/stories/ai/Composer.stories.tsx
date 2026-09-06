import { useArgs } from 'storybook/preview-api';
import { textControl, booleanControl } from '../feature-controls.js';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test';
import { Composer } from '../../../../packages/ui/src/ai/composer.js';
import { ComposerDemo } from '../../../../packages/ui/src/ai/catalog.js';
import { StoryFrame } from './story-frame.js';

const meta = { title: 'AI/Composer', component: Composer, args: { onSubmit: fn() }, decorators: [Story => <StoryFrame><Story /></StoryFrame>], parameters: { docs: { description: { component: '受控或内部草稿；Enter 提交、Shift+Enter 换行、中文 IME 组合保护。异步提交成功才清空未改动的草稿，失败保留。请求和停止行为由宿主提供。' } } } } satisfies Meta<typeof Composer>;
export default meta;
type Story = StoryObj<typeof meta>;
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

export const Playground: Story = {
  name: '参数调试', args: { value: '', disabled: false, running: false, placeholder: '描述你的下一步…', label: '消息草稿', hint: '本地示例 · Enter 提交草稿', error: '' },
  argTypes: { value: textControl, disabled: booleanControl, running: booleanControl, placeholder: textControl, label: textControl, hint: textControl, error: textControl },
  parameters: { controls: { include: ['value', 'disabled', 'running', 'placeholder', 'label', 'hint', 'error'] } },
  render: function PlaygroundRender(args) { const [, updateArgs] = useArgs(); return <Composer {...args} onValueChange={value => updateArgs({ value })} onStop={() => updateArgs({ running: false })} />; },
};
