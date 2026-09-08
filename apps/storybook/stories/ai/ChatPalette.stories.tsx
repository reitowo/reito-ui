import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { ChatPalette } from '../../../../packages/ui/src/ai/chat-palette.js';
import { Message } from '../../../../packages/ui/src/ai/conversation.js';

const meta = { title: 'AI/ChatPalette', component: ChatPalette } satisfies Meta<typeof ChatPalette>;
export default meta;
export const Playground: StoryObj<{ title: string; disabled: boolean; shortcut: boolean; fail: boolean; empty: boolean; running: boolean }> = {
  args: { title: '命令与对话', disabled: false, shortcut: false, fail: false, empty: false, running: false },
  argTypes: { title: { control: 'text' }, disabled: { control: 'boolean' }, shortcut: { control: 'boolean' }, fail: { control: 'boolean' }, empty: { control: 'boolean' }, running: { control: 'boolean' } },
  parameters: { controls: { include: ['title','disabled','shortcut','fail','empty','running'] } },
  render: function Demo(args) {
    const [selected, setSelected] = useState('尚未选择');
    const [stopped, setStopped] = useState(false);
    return <ChatPalette title={args.title} disabled={args.disabled} shortcut={args.shortcut} groups={args.empty ? [] : [{ id: 'local', label: '本地命令', commands: [{ id: 'review', label: '审查当前文件' }] }]} sessions={args.empty ? [] : [{ id: 'design', label: '设计讨论' }]} onCommand={command => { if (args.fail) throw new Error('本地命令失败'); setSelected(command.label); }} onSessionSelect={id => setSelected(id)} composer={{ running: args.running && !stopped, onStop: () => setStopped(true), onSubmit: text => setSelected(text) }}><Message from="assistant" local>{selected}</Message></ChatPalette>;
  },
};
export const Empty = { ...Playground, args: { ...Playground.args, empty: true } };
export const Failure = { ...Playground, args: { ...Playground.args, fail: true } };
export const Running = { ...Playground, args: { ...Playground.args, running: true } };
export const Disabled = { ...Playground, args: { ...Playground.args, disabled: true } };
export const Shortcut = { ...Playground, args: { ...Playground.args, shortcut: true } };

export const PendingSelection: StoryObj<typeof meta> = {
  args: { groups: [], onCommand: () => undefined, composer: { onSubmit: () => undefined } },
  render: function PendingDemo() {
    const [selected, setSelected] = useState('等待本地选择');
    return <ChatPalette defaultOpen groups={[{ id: 'local', label: '本地', commands: [{ id: 'slow', label: '延迟命令' }] }]} onCommand={async () => { await new Promise(resolve => setTimeout(resolve, 800)); setSelected('操作已完成'); }} composer={{ onSubmit: () => undefined }}><Message from="assistant" local>{selected}</Message></ChatPalette>;
  },
};
