import { FileText, Image as ImageIcon } from 'lucide-react';
import { Heading, Inline, Text } from '../../basic/composition.js';
import { Button } from '../../primitives/button.js';
import { AppShell, type AppShellProps } from './app-shell.js';

export type FolderScreenProps = Pick<
  AppShellProps,
  'onNavigate' | 'workspace' | 'user' | 'className'
> & {
  folder?: string;
};

const files: Record<
  string,
  { id: string; name: string; kind: 'doc' | 'image'; preview: string }[]
> = {
  'Q3 Campaign': [
    { id: 'brief', name: '活动简报.md', kind: 'doc', preview: '目标、渠道与预算。' },
    { id: 'cover', name: '封面.png', kind: 'image', preview: '封面预览' },
  ],
};

/** Recreated from public Folder docs. Not Pro source. */
export function FolderScreen({
  folder = 'Q3 Campaign',
  onNavigate,
  workspace = 'Acme',
  user = { name: 'Alex Morgan' },
  className,
}: FolderScreenProps) {
  const items = files[folder] ?? [];
  return (
    <AppShell
      active={folder}
      workspace={workspace}
      user={user}
      onNavigate={onNavigate}
      projects={[folder, 'Onboarding']}
      header={{ title: folder }}
      className={className}
    >
      <div className="grid gap-[var(--rui-content-gap)] p-[var(--rui-content-padding)]">
        <nav aria-label="面包屑">
          <Inline>
            <Button type="button" size="xs" variant="ghost" onClick={() => onNavigate?.('Folders')}>
              文件夹
            </Button>
            <Text variant="caption" tone="muted">
              /
            </Text>
            <Text variant="caption">{folder}</Text>
          </Inline>
        </nav>
        <Heading size="item">{folder}</Heading>
        {items.length ? (
          <ul className="grid gap-[var(--rui-content-gap)] @md:grid-cols-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="grid gap-1 rounded-[var(--rui-radius)] border border-border p-[var(--rui-content-padding)]"
              >
                <Inline>
                  {item.kind === 'image' ? (
                    <ImageIcon className="size-3.5" aria-hidden="true" />
                  ) : (
                    <FileText className="size-3.5" aria-hidden="true" />
                  )}
                  <Text variant="interface">{item.name}</Text>
                </Inline>
                <Text variant="caption" tone="muted">
                  {item.preview}
                </Text>
              </li>
            ))}
          </ul>
        ) : (
          <Text variant="caption" tone="muted">
            这个文件夹还是空的。
          </Text>
        )}
      </div>
    </AppShell>
  );
}
