import { useState } from 'react';
import { Heading, Inline, Stack, Text } from '../../basic/composition.js';
import { Badge } from '../../primitives/badge.js';
import { Input } from '../../primitives/input.js';
import { Textarea } from '../../primitives/textarea.js';
import { cn } from '../../lib/utils.js';
import { ChatComposer } from './chat-composer.js';
import { AppShellWorkspace, type AppShellProps } from './app-shell.js';

export type AgentChatScreenProps = Pick<
  AppShellProps,
  'onNavigate' | 'workspace' | 'user' | 'className'
>;

const agents = [
  { id: 'research', name: '检索', status: '阅读来源' },
  { id: 'writer', name: '撰写', status: '等待提纲' },
];

/** Recreated from public Agent Chat docs. Not Pro source. */
export function AgentChatScreen({
  onNavigate,
  workspace = 'Acme',
  user = { name: 'Alex Morgan' },
  className,
}: AgentChatScreenProps) {
  const [messages, setMessages] = useState([
    { id: '1', role: 'user' as const, text: '准备一份三季度董事会更新。' },
    { id: '2', role: 'agent' as const, text: '已拆成检索、提纲和备忘三步。右侧可以补目标与约束。' },
  ]);
  const [brief, setBrief] = useState({ goal: '董事会更新', audience: '董事', notes: '' });

  return (
    <AppShellWorkspace
      active="New chat"
      workspace={workspace}
      user={user}
      onNavigate={onNavigate}
      header={{ title: '代理对话', actions: <Badge variant="secondary">本地示例</Badge> }}
      panelTitle="任务简报"
      panel={
        <form className="grid gap-[var(--rui-content-gap)] p-[var(--rui-content-padding)]">
          <Heading size="item">简报</Heading>
          <label className="grid gap-1">
            <Text variant="caption">目标</Text>
            <Input
              value={brief.goal}
              onChange={(event) => setBrief({ ...brief, goal: event.target.value })}
            />
          </label>
          <label className="grid gap-1">
            <Text variant="caption">读者</Text>
            <Input
              value={brief.audience}
              onChange={(event) => setBrief({ ...brief, audience: event.target.value })}
            />
          </label>
          <label className="grid gap-1">
            <Text variant="caption">约束</Text>
            <Textarea
              value={brief.notes}
              onChange={(event) => setBrief({ ...brief, notes: event.target.value })}
              placeholder="不要写财务预测"
            />
          </label>
        </form>
      }
      className={className}
    >
      <div className="grid h-full grid-rows-[auto_1fr_auto]">
        <Inline className="border-b border-border px-[var(--rui-content-padding)] py-[var(--rui-compact-surface-padding-y)]">
          {agents.map((agent) => (
            <Badge key={agent.id} variant="secondary">
              {agent.name} · {agent.status}
            </Badge>
          ))}
        </Inline>
        <Stack className="overflow-auto p-[var(--rui-content-padding)]">
          {messages.map((message) => (
            <article
              key={message.id}
              className={cn(
                'max-w-[var(--rui-reading-width)] rounded-[var(--rui-radius)] p-2',
                message.role === 'user' ? 'justify-self-end bg-muted' : 'bg-card',
              )}
            >
              <Text variant="caption" tone="muted">
                {message.role === 'user' ? user.name : '编排代理'}
              </Text>
              <Text variant="reading">{message.text}</Text>
            </article>
          ))}
        </Stack>
        <div className="border-t border-border p-[var(--rui-content-padding)]">
          <ChatComposer
            placeholder="继续补充任务…"
            onSend={(text) =>
              setMessages((current) => [
                ...current,
                { id: `u-${current.length}`, role: 'user', text },
                {
                  id: `a-${current.length}`,
                  role: 'agent',
                  text: `已记下：${brief.goal}。这是本地回复示例。`,
                },
              ])
            }
          />
        </div>
      </div>
    </AppShellWorkspace>
  );
}
