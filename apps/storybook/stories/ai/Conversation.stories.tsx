import type { ComponentProps } from 'react';
import { textControl, booleanControl, choiceControl, recipeControl } from '../feature-controls.js';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../../../../packages/ui/src/primitives/button.js';
import { Conversation, Message } from '../../../../packages/ui/src/ai/conversation.js';
import { ConversationDemo } from '../../../../packages/ui/src/ai/catalog.js';
import { StoryFrame } from './story-frame.js';

const meta = { id: "ai-conversation", title: "AI/Conversation 会话消息", component: Conversation, args: { children: null }, decorators: [Story => <StoryFrame><Story /></StoryFrame>], parameters: { docs: { description: { component: '共享阅读宽度、消息角色与滚动跟随。Message 正文默认 14px / 24px 行高，两种密度字号一致，角色标签为 12px。用户向上阅读后暂停自动跟随，可用“回到最新”恢复。流式内容由宿主提供。' } } } } satisfies Meta<typeof Conversation>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Guidelines: Story = { name: "交互 · 本地流式会话", render: () => <ConversationDemo /> };
export const Roles: Story = { name: "角色对比", render: () => <Conversation className="h-96 rounded-lg border"><Message from="user" local>请检查这套界面的复用方式。</Message><Message from="assistant" local>先确认基础控件，再组合工具调用、引用和产物预览。正文直接放在工作面上。</Message><Message from="system" local>示例由本地静态内容组成。</Message></Conversation> };
export const Empty: Story = { name: "空会话", args: { className: 'h-64 rounded-lg border', empty: <p className="text-sm text-muted-foreground">还没有消息，写下你的第一条请求。</p> } };
export const LongConversation: Story = { name: "交互 · 长会话滚动跟随",
  render: function FollowDemo() {
    const [count, setCount] = useState(12);
    return <><Conversation className="h-80 rounded-lg border">{Array.from({ length: count }, (_, index) => <Message key={index} from={index % 2 ? 'assistant' : 'user'} local>第 {index + 1} 条示例消息。滚动阅读时保留当前位置，新内容不会把正在阅读的历史消息带走。</Message>)}</Conversation><Button type="button" size="sm" variant="outline" onClick={() => setCount(value => value + 1)}>追加本地消息</Button></>;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const viewport = canvas.getByRole('region', { name: '对话内容' });
    const atBottom = () => viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop < 2;
    await waitFor(() => expect(atBottom()).toBe(true));
    viewport.scrollTop = 0;
    fireEvent.scroll(viewport);
    await expect(await canvas.findByRole('button', { name: '回到最新' })).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: '追加本地消息' }));
    await expect(canvas.getByText(/第 13 条示例消息/)).toBeInTheDocument();
    await expect(viewport.scrollTop).toBe(0);
    await userEvent.click(canvas.getByRole('button', { name: '回到最新' }));
    await waitFor(() => expect(atBottom()).toBe(true));
    await userEvent.click(canvas.getByRole('button', { name: '追加本地消息' }));
    await expect(canvas.getByText(/第 14 条示例消息/)).toBeInTheDocument();
    await waitFor(() => expect(atBottom()).toBe(true));
  },
};

export const Default: Story = { name: "助手消息", render: () => <Conversation><Message from="assistant" local>先确认基础控件，再组合工具调用、引用和产物预览。正文直接放在工作面上。</Message></Conversation> };
export const UserMessage: Story = { name: "用户消息", render: () => <Conversation><Message from="user" local>请检查这套界面的复用方式。</Message></Conversation> };
export const SystemMessage: Story = { name: "系统消息", render: () => <Conversation><Message from="system" local>示例由本地静态内容组成。</Message></Conversation> };
export const Streaming: Story = { name: "助手正在输出", render: () => <Conversation><Message from="assistant" local streaming>本地流式状态示例：正在整理共享组件…</Message></Conversation> };
export const NamedAuthor: Story = { name: "自定义作者", render: () => <Conversation><Message from="assistant" name="布局检查助手" local>此消息使用调用方提供的作者名称。</Message></Conversation> };

type PlaygroundArgs = Pick<ComponentProps<typeof Message>, 'from' | 'streaming' | 'name'> & { body: string; follow: boolean };
export const Playground: StoryObj<PlaygroundArgs> = {
 name: "参数调试", args: { from: 'assistant', streaming: false, name: '', body: '先确认基础控件，再组合工具调用、引用和产物预览。', follow: true },
 argTypes: { from: { ...choiceControl(['user', 'assistant', 'system']), table: { category: 'Message props' } }, streaming: { ...booleanControl, table: { category: 'Message props' } }, name: { ...textControl, table: { category: 'Message props' } }, body: recipeControl(textControl, '传给 Message.children 的消息正文。'), follow: { ...booleanControl, table: { category: 'Conversation props' } } },
 parameters: { controls: { include: ['from', 'streaming', 'name', 'body', 'follow'] } },
 render: args => <Conversation follow={args.follow} className="h-64 rounded-lg border"><Message from={args.from} name={args.name || undefined} streaming={args.streaming} local>{args.body}</Message></Conversation>,
};
