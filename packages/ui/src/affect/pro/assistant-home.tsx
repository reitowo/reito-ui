import { Heading, Inline, Stack, Text } from '../../basic/composition.js';
import { Button } from '../../primitives/button.js';
import { Badge } from '../../primitives/badge.js';
import { ChatComposer } from './chat-composer.js';
import { AppShell, type AppShellProps } from './app-shell.js';

export type AssistantHomeScreenProps = Pick<
  AppShellProps,
  'onNavigate' | 'workspace' | 'user' | 'className'
>;

const suggestions = ['总结本周变化', '起草客户回复', '列出待审查项'];
const apps = ['日历', '文档', '议题'];

/** Recreated from public Assistant Home docs. Not Pro source. */
export function AssistantHomeScreen({
  onNavigate,
  workspace = 'Acme',
  user = { name: 'Alex Morgan' },
  className,
}: AssistantHomeScreenProps) {
  const first = user.name.split(/\s+/)[0] ?? user.name;
  return (
    <AppShell
      active="New chat"
      workspace={workspace}
      user={user}
      onNavigate={onNavigate}
      header={{ title: '助手' }}
      className={className}
    >
      <div className="mx-auto grid max-w-[var(--rui-reading-width)] gap-[var(--rui-content-gap)] p-[var(--rui-content-padding)]">
        <Stack gap="small">
          <Heading size="section">你好，{first}</Heading>
          <Text variant="caption" tone="muted">
            从一条提示开始，或打开已连接的应用。
          </Text>
        </Stack>
        <ChatComposer placeholder="今天要处理什么？" />
        <Inline>
          {apps.map((app) => (
            <Badge key={app} variant="secondary">
              {app} 已连接
            </Badge>
          ))}
        </Inline>
        <div className="grid gap-1">
          {suggestions.map((item) => (
            <Button
              key={item}
              type="button"
              size="xs"
              variant="ghost"
              className="justify-start"
              onClick={() => onNavigate?.(item)}
            >
              {item}
            </Button>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
