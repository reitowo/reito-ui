import { useArgs } from 'storybook/preview-api';
import { textControl, booleanControl, recipeControl } from '../feature-controls.js';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { PromptSuggestions } from '../../../../packages/ui/src/ai/context.js';
import { PromptSuggestionsDemo } from '../../../../packages/ui/src/ai/catalog.js';
import { StoryFrame } from './story-frame.js';

const meta = { id: "ai-promptsuggestions", title: "AI/PromptSuggestions 提示建议", component: PromptSuggestions, args: { items: [{ id: 'review', label: '检查共享样式', prompt: '检查侧栏布局与焦点样式' }], onSelect: fn() }, decorators: [Story => <StoryFrame><Story /></StoryFrame>] } satisfies Meta<typeof PromptSuggestions>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Guidelines: Story = { name: "默认示例",};
export const SeedsEditableDraft: Story = { name: "交互 · 填入草稿后编辑发送", render: () => <PromptSuggestionsDemo />, play: async ({ canvasElement }) => { const canvas = within(canvasElement); await userEvent.click(canvas.getByRole('button', { name: '检查共享样式' })); const input = canvas.getByRole('textbox', { name: '消息草稿' }); await expect(input).toHaveValue('检查侧栏布局与焦点样式'); await expect(canvas.getByRole('status')).toHaveTextContent('建议只填入草稿'); await userEvent.type(input, '，并检查浅色主题'); await userEvent.click(canvas.getByRole('button', { name: '发送消息' })); await expect(canvas.getByRole('status')).toHaveTextContent('本地已记录：检查侧栏布局与焦点样式，并检查浅色主题'); } };
export const Empty: Story = { name: "没有建议", args: { items: [] } };

export const Disabled: Story = { name: "禁用建议", args: { items: [{ id: 'disabled', label: '远程分析未配置', prompt: '', disabled: true }] } };

type PlaygroundArgs = { label: string; suggestionLabel: string; prompt: string; suggestionDisabled: boolean; empty: boolean; selectedPrompt: string };
export const Playground: StoryObj<PlaygroundArgs> = {
 name: "参数调试", args: { label: '建议请求', suggestionLabel: '检查共享样式', prompt: '检查侧栏布局与焦点样式', suggestionDisabled: false, empty: false, selectedPrompt: '' },
 argTypes: { label: textControl, suggestionLabel: recipeControl(textControl, 'items[0].label'), prompt: recipeControl(textControl, 'items[0].prompt'), suggestionDisabled: recipeControl(booleanControl, 'items[0].disabled'), empty: recipeControl(booleanControl, '传入空 items。'), selectedPrompt: recipeControl(textControl, '宿主接收 onSelect 的本地结果。') },
 parameters: { controls: { include: ['suggestionLabel', 'prompt', 'suggestionDisabled', 'empty', 'label', 'selectedPrompt'] } },
 render: function PlaygroundRender(args) { const [, updateArgs] = useArgs(); return <div className="grid gap-3"><PromptSuggestions label={args.label} items={args.empty ? [] : [{ id: 'example', label: args.suggestionLabel, prompt: args.prompt, disabled: args.suggestionDisabled }]} onSelect={selectedPrompt => updateArgs({ selectedPrompt })} /><p role="status" className="text-sm text-muted-foreground">{args.selectedPrompt ? '本地已选择：' + args.selectedPrompt : '选择建议后展示传入内容。'}</p></div>; },
};
