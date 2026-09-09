import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import { useState } from 'react';
import { ChatOverlay } from '../../../../packages/ui/src/ai/chat-overlay.js';
import { Message } from '../../../../packages/ui/src/ai/conversation.js';
import { booleanControl, textControl } from '../feature-controls.js';

const meta = { id: "ai-chatoverlay", title: "AI/ChatOverlay 对话浮层", component: ChatOverlay } satisfies Meta<typeof ChatOverlay>;
export default meta;
type Args = { title: string; description: string; open: boolean; disabled: boolean; running: boolean; error: string; empty: boolean };
function Demo({ args, updateArgs }: { args: Args; updateArgs: (next: Partial<Args>) => void }) {
  const [messages, setMessages] = useState<string[]>([]);

  return <ChatOverlay title={args.title} description={args.description} open={args.open} onOpenChange={open => updateArgs({ open })} disabled={args.disabled} composer={{ onSubmit: text => { setMessages(current => [...current, text]); }, running: args.running, onStop: () => updateArgs({ running: false }), error: args.error }}>
    {!args.empty && <Message from="assistant" local>这是本地工作区示例，尚未连接模型。</Message>}
    {messages.map((text, index) => <Message key={index} from="user" local>{text}</Message>)}
  </ChatOverlay>;
}
export const Playground: StoryObj<Args> = { name: "参数调试",
  args: { title: '工作区助手', description: '本地示例，未连接模型', open: false, disabled: false, running: false, error: '', empty: false },
  argTypes: { title: textControl, description: textControl, open: booleanControl, disabled: booleanControl, running: booleanControl, error: textControl, empty: booleanControl },
  parameters: { controls: { include: ['title', 'description', 'open', 'disabled', 'running', 'error', 'empty'] } },
  render: function Render(args) { const [, updateArgs] = useArgs(); return <Demo args={args} updateArgs={updateArgs} />; },
};
export const Open = { name: "状态 · 已打开", ...Playground, args: { ...Playground.args, open: true } };
export const Empty = { name: "状态 · 空内容", ...Playground, args: { ...Playground.args, open: true, empty: true } };
export const Running = { name: "状态 · 运行中", ...Playground, args: { ...Playground.args, open: true, running: true } };
export const Error = { name: "状态 · 错误", ...Playground, args: { ...Playground.args, open: true, error: '本地请求失败，草稿已保留' } };
export const Disabled = { name: "状态 · 禁用", ...Playground, args: { ...Playground.args, disabled: true } };

export const FailureRecovery: StoryObj<typeof meta> = { name: "交互 · 失败恢复",
  args: { composer: { onSubmit: () => undefined } },
  render: function FailureRecoveryExample() {
    const [attempts, setAttempts] = useState(0);
    const [sent, setSent] = useState('');
    return <ChatOverlay defaultOpen description="本地失败与重试" composer={{ onSubmit: text => {
      setAttempts(current => current + 1);
      if (!attempts) throw new globalThis.Error('本地提交失败，请重试');
      setSent(text);
    } }}>{sent && <Message from="user" local>{sent}</Message>}</ChatOverlay>;
  },
};
