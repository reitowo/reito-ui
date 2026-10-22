import { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  ChevronDown,
  Home,
  Inbox,
  Moon,
  Search,
  Settings,
  Sun,
  Users,
} from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Label,
  ReitoThemeProvider,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  TooltipProvider,
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@reito/ui';
import { Chart, DataTable } from '@reito/ui';
import type { LucideIcon } from 'lucide-react';
import type { DensityMode } from '@reito/ui';
import type { ColumnDef } from '@tanstack/react-table';
import { sitePath } from '../../routes';
import { exampleDensityTokens } from '../prefs';

type PageId = 'home' | 'inbox' | 'customers' | 'settings';
type Density = DensityMode;
const densities: Density[] = ['dense', 'compact', 'comfortable'];
const densityLabel: Record<Density, string> = { dense: '高密', compact: '紧凑', comfortable: '舒适' };

type NavItem = { id: PageId; label: string; icon: LucideIcon };
const nav: { group: '工作台' | '管理'; items: NavItem[] }[] = [
  { group: '工作台', items: [
    { id: 'home' as const, label: '首页', icon: Home },
    { id: 'inbox' as const, label: '收件箱', icon: Inbox },
    { id: 'customers' as const, label: '客户', icon: Users },
  ] },
  { group: '管理', items: [{ id: 'settings' as const, label: '设置', icon: Settings }] },
];

const stats = [
  { label: '本周收入', value: '¥128,400', hint: '较上周 +12%' },
  { label: '新客户', value: '36', hint: '4 家待跟进' },
  { label: '未读邮件', value: '8', hint: '2 封标了紧急' },
  { label: '续约率', value: '94%', hint: '本季目标 95%' },
];

const revenue = [
  { id: 'mon', label: '周一', values: { revenue: 18 } },
  { id: 'tue', label: '周二', values: { revenue: 22 } },
  { id: 'wed', label: '周三', values: { revenue: 16 } },
  { id: 'thu', label: '周四', values: { revenue: 28 } },
  { id: 'fri', label: '周五', values: { revenue: 24 } },
  { id: 'sat', label: '周六', values: { revenue: 12 } },
  { id: 'sun', label: '周日', values: { revenue: 9 } },
];

type Mail = { id: string; from: string; subject: string; body: string; unread: boolean };
const initialMail: Mail[] = [
  { id: 'm1', from: '陈可', subject: '席位还差两份合同', body: '法务看过附件了。周五前如果能盖章，这季名额就留得住。', unread: true },
  { id: 'm2', from: '周宁', subject: '账单对不上', body: '三月的发票少了一行实施费。我把订单号放在签名下面。', unread: true },
  { id: 'm3', from: '江岸', subject: '试用将在周四结束', body: '团队还想再看报表导出。能把试用延到下周一吗？', unread: false },
  { id: 'm4', from: '苏晚', subject: '权限申请', body: '市场组需要客户表的只读权限，不需要导出。', unread: false },
];

type Customer = { id: string; name: string; owner: string; plan: string; status: string; seats: number };
const customers: Customer[] = [
  { id: 'c1', name: '江岸印务', owner: '林夏', plan: '团队', status: '活跃', seats: 24 },
  { id: 'c2', name: '旧雨书店', owner: '周宁', plan: '专业', status: '试用', seats: 6 },
  { id: 'c3', name: '城南短讯', owner: '苏晚', plan: '团队', status: '活跃', seats: 18 },
  { id: 'c4', name: '梧桐工作室', owner: '陈麦', plan: '免费', status: '流失', seats: 2 },
  { id: 'c5', name: '北岸学校', owner: '阿禾', plan: '专业', status: '活跃', seats: 40 },
  { id: 'c6', name: '晚潮设计', owner: '林夏', plan: '团队', status: '试用', seats: 11 },
  { id: 'c7', name: '纸间', owner: '老裴', plan: '免费', status: '活跃', seats: 3 },
  { id: 'c8', name: '岸边酒店', owner: '周宁', plan: '专业', status: '流失', seats: 9 },
];

const notices = [
  { id: 'n1', title: '陈可回复了合同', time: '10 分钟前' },
  { id: 'n2', title: '江岸印务新增了 4 个席位', time: '1 小时前' },
  { id: 'n3', title: '导出任务已完成', time: '昨天' },
];

function readTheme(): 'dark' | 'light' {
  const query = new URLSearchParams(location.search).get('theme');
  if (query === 'light' || query === 'dark') return query;
  try { return localStorage.getItem('reito-theme') === 'light' ? 'light' : 'dark'; } catch { return 'dark'; }
}
function readDensity(): Density {
  const query = new URLSearchParams(location.search).get('density');
  if (query === 'dense' || query === 'compact' || query === 'comfortable') return query;
  try {
    const stored = localStorage.getItem('reito-density');
    if (stored === 'dense' || stored === 'compact' || stored === 'comfortable') return stored;
  } catch { /* keep compact */ }
  return 'compact';
}

export function Dashboard({ page }: { page: PageId }) {
  const [theme, setTheme] = useState(readTheme);
  const [density, setDensity] = useState<Density>(readDensity);
  const [palette, setPalette] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [mail, setMail] = useState(initialMail);
  const [selectedMail, setSelectedMail] = useState('m1');
  const [reply, setReply] = useState('');
  const [mailQuery, setMailQuery] = useState('');
  const [profileName, setProfileName] = useState('林夏');
  const [mailAlerts, setMailAlerts] = useState(true);
  const [weekly, setWeekly] = useState(false);
  const [groups, setGroups] = useState({ 工作台: true, 管理: true });
  useEffect(() => {
    const url = new URL(location.href);
    url.searchParams.set('theme', theme);
    url.searchParams.set('density', density);
    history.replaceState(null, '', url);
    try {
      localStorage.setItem('reito-theme', theme);
      localStorage.setItem('reito-density', density);
    } catch { /* session values remain */ }
    document.title = `${nav.flatMap((group) => group.items).find((item) => item.id === page)?.label ?? '工作台'} · 工作台`;
  }, [theme, density, page]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPalette(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const go = (id: PageId) => { location.assign(sitePath(`templates/dashboard/${id}`)); };
  const visibleMail = mail.filter((item) => `${item.from}${item.subject}${item.body}`.includes(mailQuery));
  const current = visibleMail.find((item) => item.id === selectedMail) ?? visibleMail[0] ?? null;

  return (
    <ReitoThemeProvider root mode={theme} density={density} tokens={exampleDensityTokens(density)}>
      <TooltipProvider>
        <SidebarProvider className="h-dvh overflow-hidden">
          <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton size="lg" render={<a href={sitePath('templates')} />}>
                    <span className="flex size-[var(--rui-control-height)] items-center justify-center rounded-md bg-muted text-sm font-medium">工</span>
                    <span className="grid text-left leading-tight">
                      <span className="truncate font-medium">工作台</span>
                      <span className="truncate text-xs text-muted-foreground">示例</span>
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
              {nav.map((group) => (
                <SidebarGroup key={group.group}>
                  <SidebarGroupLabel render={<button type="button" onClick={() => setGroups((value) => ({ ...value, [group.group]: !value[group.group as '工作台' | '管理'] }))} />}>
                    <ChevronDown className={groups[group.group as '工作台' | '管理'] ? '' : '-rotate-90'} />
                    {group.group}
                  </SidebarGroupLabel>
                  {groups[group.group as '工作台' | '管理'] && (
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {group.items.map((item) => (
                          <SidebarMenuItem key={item.id}>
                            <SidebarMenuButton isActive={item.id === page} render={<a href={sitePath(`templates/dashboard/${item.id}`)} />}>
                              <item.icon />
                              <span>{item.label}</span>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  )}
                </SidebarGroup>
              ))}
            </SidebarContent>
            <SidebarFooter>
              <p className="px-2 text-xs text-muted-foreground">本地示例 · 无外部账号</p>
            </SidebarFooter>
          </Sidebar>
          <SidebarInset>
            <header className="flex h-[var(--rui-control-height-lg)] shrink-0 items-center gap-2 border-b px-[var(--rui-content-padding)]">
              <SidebarTrigger />
              <Separator orientation="vertical" className="h-4" />
              <Button variant="outline" size="sm" className="text-muted-foreground" onClick={() => setPalette(true)}>
                <Search />
                搜索或跳转
              </Button>
              <div className="ml-auto flex items-center gap-1">
                <Button variant="ghost" size="icon" aria-label="通知" onClick={() => setNotesOpen(true)}>
                  <Bell />
                </Button>
                <UserMenu theme={theme} setTheme={setTheme} density={density} setDensity={setDensity} onSettings={() => go('settings')} />
              </div>
            </header>
            <div className="min-h-0 flex-1 overflow-auto p-[var(--rui-content-padding)]">
              {page === 'home' && <HomePage onOpenInbox={() => go('inbox')} />}
              {page === 'inbox' && (
                <InboxPage
                  mail={visibleMail}
                  query={mailQuery}
                  onQuery={setMailQuery}
                  current={current}
                  onSelect={(id) => { setSelectedMail(id); setMail((list) => list.map((item) => item.id === id ? { ...item, unread: false } : item)); }}
                  reply={reply}
                  onReply={setReply}
                  onSend={() => {
                    if (!current || !reply.trim()) return;
                    setMail((list) => list.map((item) => item.id === current.id ? { ...item, body: `${item.body}\n\n林夏：${reply.trim()}` } : item));
                    setReply('');
                  }}
                />
              )}
              {page === 'customers' && <CustomersPage />}
              {page === 'settings' && (
                <SettingsPage
                  name={profileName}
                  onName={setProfileName}
                  mailAlerts={mailAlerts}
                  onMailAlerts={setMailAlerts}
                  weekly={weekly}
                  onWeekly={setWeekly}
                  density={density}
                  onDensity={setDensity}
                  theme={theme}
                  onTheme={setTheme}
                />
              )}
            </div>
          </SidebarInset>
        </SidebarProvider>
        <CommandDialog open={palette} onOpenChange={setPalette} title="命令" description="跳到工作台页面">
          <Command>
            <CommandInput placeholder="搜索页面" />
            <CommandList>
              <CommandEmpty>没有匹配的页面</CommandEmpty>
              <CommandGroup heading="跳转">
                {nav.flatMap((group) => group.items).map((item) => (
                  <CommandItem key={item.id} onSelect={() => { setPalette(false); go(item.id); }}>
                    <item.icon />
                    {item.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </CommandDialog>
        <Sheet open={notesOpen} onOpenChange={setNotesOpen}>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>通知</SheetTitle>
              <SheetDescription>最近发生的事，都留在这台机器上。</SheetDescription>
            </SheetHeader>
            <ul className="grid gap-2 px-[var(--rui-content-padding)]">
              {notices.map((item) => (
                <li key={item.id} className="rounded-md border px-3 py-2">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </li>
              ))}
            </ul>
          </SheetContent>
        </Sheet>
      </TooltipProvider>
    </ReitoThemeProvider>
  );
}

function UserMenu({ theme, setTheme, density, setDensity, onSettings }: {
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  density: Density;
  setDensity: (density: Density) => void;
  onSettings: () => void;
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
          <DropdownMenuLabel>林夏 · 管理员</DropdownMenuLabel>
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
        <DropdownMenuItem onClick={onSettings}><Settings />设置</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function HomePage({ onOpenInbox }: { onOpenInbox: () => void }) {
  return (
    <div className="grid gap-[var(--rui-content-gap)]">
      <div>
        <h1 className="text-lg font-medium">本周</h1>
        <p className="text-sm text-muted-foreground">数字是写在页面里的示例，不会连到账单。</p>
      </div>
      <div className="grid gap-[var(--rui-content-gap)] sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <Card key={item.label}>
            <CardHeader>
              <CardDescription>{item.label}</CardDescription>
              <CardTitle>{item.value}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">{item.hint}</CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-[var(--rui-content-gap)] lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>收入</CardTitle>
            <CardDescription>单位：千元</CardDescription>
          </CardHeader>
          <CardContent>
            <Chart label="本周收入" kind="area" data={revenue} series={[{ key: 'revenue', label: '收入' }]} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>待处理</CardTitle>
            <CardDescription>收件箱里还开着的信</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {initialMail.filter((item) => item.unread).map((item) => (
              <button key={item.id} type="button" className="rounded-md border px-3 py-2 text-left" onClick={onOpenInbox}>
                <span className="block text-sm font-medium">{item.subject}</span>
                <span className="text-xs text-muted-foreground">{item.from}</span>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InboxPage({ mail, query, onQuery, current, onSelect, reply, onReply, onSend }: {
  mail: Mail[];
  query: string;
  onQuery: (value: string) => void;
  current: Mail | null;
  onSelect: (id: string) => void;
  reply: string;
  onReply: (value: string) => void;
  onSend: () => void;
}) {
  return (
    <div className="grid min-h-[70dvh] gap-[var(--rui-content-gap)] lg:grid-cols-[auto_minmax(0,1fr)]">
      <section className="grid content-start gap-2 lg:w-72" aria-label="邮件列表">
        <h1 className="text-lg font-medium">收件箱</h1>
        <Input aria-label="筛选邮件" placeholder="找发件人或主题" value={query} onChange={(event) => onQuery(event.target.value)} />
        {mail.length === 0 && <p className="text-sm text-muted-foreground">没有对上的邮件。</p>}
        <ul className="grid gap-1">
          {mail.map((item) => (
            <li key={item.id}>
              <button type="button" aria-current={current?.id === item.id ? 'true' : undefined} className="w-full rounded-md border px-3 py-2 text-left aria-[current=true]:bg-muted" onClick={() => onSelect(item.id)}>
                <span className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-medium">{item.from}</span>
                  {item.unread && <Badge>未读</Badge>}
                </span>
                <span className="text-sm text-muted-foreground">{item.subject}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
      <section className="grid content-start gap-3" aria-label="邮件">
        {current ? (
          <>
            <h2 className="text-lg font-medium">{current.subject}</h2>
            <p className="text-sm text-muted-foreground">{current.from}</p>
            <p className="whitespace-pre-wrap text-sm">{current.body}</p>
            <Label htmlFor="reply">回复</Label>
            <Textarea id="reply" value={reply} onChange={(event) => onReply(event.target.value)} placeholder="写一句回复" />
            <Button className="w-fit" disabled={!reply.trim()} onClick={onSend}>发送</Button>
          </>
        ) : <p className="text-sm text-muted-foreground">选一封邮件。</p>}
      </section>
    </div>
  );
}

function CustomersPage() {
  const columns = useMemo<ColumnDef<Customer>[]>(() => [
    { accessorKey: 'name', header: '客户' },
    { accessorKey: 'owner', header: '负责人' },
    { accessorKey: 'plan', header: '方案' },
    { accessorKey: 'status', header: '状态' },
    { accessorKey: 'seats', header: '席位' },
  ], []);
  return (
    <div className="grid gap-[var(--rui-content-gap)]">
      <div>
        <h1 className="text-lg font-medium">客户</h1>
        <p className="text-sm text-muted-foreground">可以搜索、按状态筛选，并翻页。</p>
      </div>
      <DataTable
        data={customers}
        columns={columns}
        getRowId={(row) => row.id}
        caption="客户"
        searchPlaceholder="搜索客户、负责人或方案"
        pageSize={5}
        selectable
        filterDefinitions={[
          { id: 'status', label: '状态', kind: 'select', options: ['活跃', '试用', '流失'].map((value) => ({ value, label: value })) },
          { id: 'plan', label: '方案', kind: 'select', options: ['免费', '专业', '团队'].map((value) => ({ value, label: value })) },
        ]}
      />
    </div>
  );
}

function SettingsPage({ name, onName, mailAlerts, onMailAlerts, weekly, onWeekly, density, onDensity, theme, onTheme }: {
  name: string;
  onName: (value: string) => void;
  mailAlerts: boolean;
  onMailAlerts: (value: boolean) => void;
  weekly: boolean;
  onWeekly: (value: boolean) => void;
  density: Density;
  onDensity: (value: Density) => void;
  theme: 'dark' | 'light';
  onTheme: (value: 'dark' | 'light') => void;
}) {
  return (
    <div className="grid max-w-3xl gap-[var(--rui-content-gap)]">
      <h1 className="text-lg font-medium">设置</h1>
      <Tabs defaultValue="profile">
        <TabsList aria-label="设置分组">
          <TabsTrigger value="profile">资料</TabsTrigger>
          <TabsTrigger value="alerts">通知</TabsTrigger>
          <TabsTrigger value="appearance">外观</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="grid gap-3 pt-3">
          <Label htmlFor="profile-name">显示名称</Label>
          <Input id="profile-name" value={name} onChange={(event) => onName(event.target.value)} />
          <p className="text-sm text-muted-foreground">只改这一页上的名字，不会创建账号。</p>
        </TabsContent>
        <TabsContent value="alerts" className="grid gap-4 pt-3">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="mail-alerts">新邮件提醒</Label>
            <Switch id="mail-alerts" checked={mailAlerts} onCheckedChange={onMailAlerts} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="weekly">每周摘要</Label>
            <Switch id="weekly" checked={weekly} onCheckedChange={onWeekly} />
          </div>
        </TabsContent>
        <TabsContent value="appearance" className="grid max-w-sm gap-3 pt-3">
          <Label htmlFor="density">密度</Label>
          <Select value={density} onValueChange={(value) => { if (value) onDensity(value as Density); }}>
            <SelectTrigger id="density" aria-label="密度"><SelectValue /></SelectTrigger>
            <SelectContent>
              {densities.map((item) => <SelectItem key={item} value={item}>{densityLabel[item]}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="theme-dark">深色</Label>
            <Switch id="theme-dark" checked={theme === 'dark'} onCheckedChange={(checked) => onTheme(checked ? 'dark' : 'light')} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
