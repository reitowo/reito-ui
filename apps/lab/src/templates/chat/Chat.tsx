import { useState } from 'react';
import { Moon, Send, Sun } from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  ReitoThemeProvider,
  Textarea,
  TooltipProvider,
} from '@reito/ui';
import type { DensityMode } from '@reito/ui';
import { sitePath } from '../../routes';
import { exampleDensityTokens, useExamplePrefs } from '../prefs';

type Density = DensityMode;
const densities: Density[] = ['dense', 'compact', 'comfortable'];
const densityLabel: Record<Density, string> = { dense: '高密', compact: '紧凑', comfortable: '舒适' };

type Message = { id: string; from: 'me' | 'them'; text: string };
type Thread = { id: string; name: string; initial: string; messages: Message[] };

const initialThreads: Thread[] = [
  {
    id: 't1',
    name: '陈可',
    initial: '可',
    messages: [
      { id: 'a1', from: 'them', text: '合同我看过了。周五前如果能盖章，这季名额就留得住。' },
      { id: 'a2', from: 'me', text: '我让法务今天回。有一处席位数量要对一下。' },
    ],
  },
  {
    id: 't2',
    name: '周宁',
    initial: '宁',
    messages: [
      { id: 'b1', from: 'them', text: '三月的发票少了一行实施费，订单号在签名下面。' },
    ],
  },
  {
    id: 't3',
    name: '产品讨论',
    initial: '产',
    messages: [
      { id: 'c1', from: 'them', text: '收件箱的筛选要不要记住上次的条件？' },
      { id: 'c2', from: 'me', text: '先记在这台浏览器里，不连账号。' },
    ],
  },
];

export function Chat() {
  const { theme, setTheme, density, setDensity } = useExamplePrefs('对话 · 示例');
  const [threads, setThreads] = useState(initialThreads);
  const [currentId, setCurrentId] = useState('t1');
  const [draft, setDraft] = useState('');
  const current = threads.find((item) => item.id === currentId) ?? threads[0];

  const send = () => {
    const text = draft.trim();
    if (!text || !current) return;
    setThreads((list) => list.map((item) => item.id === current.id
      ? { ...item, messages: [...item.messages, { id: `m${item.messages.length + 1}-${text.length}`, from: 'me', text }] }
      : item));
    setDraft('');
  };

  return (
    <ReitoThemeProvider root mode={theme} density={density} tokens={exampleDensityTokens(density)}>
      <TooltipProvider>
        <div className="reito-root flex h-dvh min-w-0 flex-col bg-background text-foreground">
          <header className="flex h-[var(--rui-control-height-lg)] shrink-0 items-center gap-2 border-b px-[var(--rui-content-padding)]">
            <Button nativeButton={false} variant="ghost" size="sm" render={<a href={sitePath('templates')} />}>示例</Button>
            <span className="text-sm font-medium">对话</span>
            <div className="ml-auto">
              <AppearanceMenu theme={theme} setTheme={setTheme} density={density} setDensity={setDensity} />
            </div>
          </header>
            <div className="grid min-h-0 flex-1 lg:grid-cols-[auto_minmax(0,1fr)]">
            <aside className="min-h-0 overflow-auto border-b lg:w-72 lg:border-r lg:border-b-0" aria-label="会话">
              <ul className="grid gap-1 p-[var(--rui-content-padding)]">
                {threads.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      aria-current={item.id === current?.id ? 'true' : undefined}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left aria-[current=true]:bg-muted"
                      onClick={() => setCurrentId(item.id)}
                    >
                      <Avatar className="size-[var(--rui-control-height)]">
                        <AvatarFallback>{item.initial}</AvatarFallback>
                      </Avatar>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{item.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">{item.messages.at(-1)?.text}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </aside>
            <section className="flex min-h-0 min-w-0 flex-col" aria-label="消息">
              <h1 className="border-b px-[var(--rui-content-padding)] py-3 text-sm font-medium">{current?.name}</h1>
              <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto p-[var(--rui-content-padding)]">
                {current?.messages.map((message) => (
                  <p key={message.id} className={message.from === 'me' ? 'ml-auto max-w-[70%] rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground' : 'max-w-[70%] rounded-md bg-muted px-3 py-2 text-sm'}>
                    {message.text}
                  </p>
                ))}
              </div>
              <form
                className="grid gap-2 border-t p-[var(--rui-content-padding)]"
                onSubmit={(event) => { event.preventDefault(); send(); }}
              >
                <label className="sr-only" htmlFor="chat-draft">消息</label>
                <Textarea id="chat-draft" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="写一条消息。发出去只留在这台机器上。" onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                    event.preventDefault();
                    send();
                  }
                }} />
                <Button className="w-fit" type="submit" disabled={!draft.trim()}><Send />发送</Button>
              </form>
            </section>
          </div>
        </div>
      </TooltipProvider>
    </ReitoThemeProvider>
  );
}

function AppearanceMenu({ theme, setTheme, density, setDensity }: {
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  density: Density;
  setDensity: (density: Density) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label="林夏的菜单" className="rounded-full" />}>
        <Avatar className="size-[var(--rui-control-height-xs)]">
          <AvatarFallback>夏</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>林夏</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={density} onValueChange={(value) => setDensity(value as Density)}>
          {densities.map((item) => <DropdownMenuRadioItem key={item} value={item}>{densityLabel[item]}</DropdownMenuRadioItem>)}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? <Sun /> : <Moon />}
          {theme === 'dark' ? '切换到浅色' : '切换到深色'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
