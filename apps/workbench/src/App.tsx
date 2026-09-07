import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { FileCode2, Files, ListTodo, MessageSquare, Moon, Play, Plus, Settings2, Sun, X } from 'lucide-react';
import {
  AppShell, ArtifactPanel, Button, Checkpoint, Composer, ContextPill, Conversation,
  Dialog, DialogContent, DialogDescription, DialogTitle, DiffViewer, Input, KeyValueEditor,
  LogViewer, MessageActions, ModelSelector, NumberField, PromptSuggestions, RichMessage,
  ResourceList, SettingsRow, SettingsSection, Switch, TaskQueue, ToolCall, WorkspacePane,
  type KeyValueEntry, type LogEntry, type MessageFeedback, type QueueTask, type QueueTaskStatus,
} from '@reito/ui';
import { fileDiff, initialLogs, initialQueue, resources, sampleReply } from './data.js';

type View = 'agent' | 'files' | 'settings';
type LocalMessage = { id: string; from: 'user' | 'assistant'; text: string; feedback?: MessageFeedback; artifact?: boolean };
const firstMessages: LocalMessage[] = [
  { id: 'request', from: 'user', text: '把工作区的设置与审查流程整理得更紧凑。' },
  { id: 'answer', from: 'assistant', text: '先收紧共享间距，保留单列阅读。设置与文件审查各有独立入口，产物预览在需要时打开。\n\n下面是可以继续编辑的本地产物示例。', artifact: true },
];
const viewLabels: Record<View, string> = { agent: 'Agent', files: '文件与差异', settings: '设置' };

function initialView(): View { const value = new URLSearchParams(location.search).get('view'); return value === 'files' || value === 'settings' ? value : 'agent'; }

export function App() {
  const [view, setView] = useState<View>(initialView);
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
  const [density, setDensity] = useState(() => document.documentElement.dataset.density === 'comfortable' ? 'comfortable' : 'compact');
  const [wide, setWide] = useState(() => window.matchMedia('(min-width: 1100px)').matches);
  const [messages, setMessages] = useState<LocalMessage[]>(firstMessages);
  const [draft, setDraft] = useState('');
  const [stream, setStream] = useState<string | null>(null);
  const [support, setSupport] = useState<'artifact' | 'queue' | null>(null);
  const supportTrigger = useRef<HTMLButtonElement | null>(null);
  const serial = useRef(0);
  const [includeContext, setIncludeContext] = useState(true);
  const [model, setModel] = useState('local');
  const [tasks, setTasks] = useState<QueueTask[]>(initialQueue);
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);
  const [notice, setNotice] = useState('所有内容都是本地示例，未连接模型或文件系统。');
  const [selectedFile, setSelectedFile] = useState('settings');
  const [workspaceName, setWorkspaceName] = useState('设计组件工作台');
  const [previewName, setPreviewName] = useState('设计组件工作台');
  const [settingsName, setSettingsName] = useState('设计组件工作台');
  const [parallelLimit, setParallelLimit] = useState<number | null>(2);
  const [saveHistory, setSaveHistory] = useState(true);
  const [settingsError, setSettingsError] = useState('');
  const [config, setConfig] = useState<KeyValueEntry[]>([{ id: 'locale', key: 'locale', value: 'zh-CN' }, { id: 'appearance', key: 'appearance', value: 'graphite' }]);

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.density = density;
    document.documentElement.style.colorScheme = theme;
    try { localStorage.setItem('reito-workbench-theme', theme); localStorage.setItem('reito-workbench-density', density); } catch { /* In-memory appearance remains available. */ }
  }, [theme, density]);
  useEffect(() => {
    const media = window.matchMedia('(min-width: 1100px)');
    const update = () => setWide(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (!stream) return;
    let position = 0;
    const timer = setInterval(() => {
      position = Math.min(sampleReply.length, position + 3);
      setMessages(current => current.map(message => message.id === stream ? { ...message, text: sampleReply.slice(0, position) } : message));
      if (position >= sampleReply.length) setStream(null);
    }, 70);
    return () => clearInterval(timer);
  }, [stream]);

  function record(message: string, level: LogEntry['level'] = 'info') {
    setNotice(message);
    if (saveHistory) setLogs(current => [...current, { id: `log-${serial.current++}`, level, source: 'local-ui', time: new Date().toLocaleTimeString('zh-CN', { hour12: false }), message }]);
  }
  function navigate(next: View) {
    setView(next); setSupport(null);
    const url = new URL(location.href); url.searchParams.set('view', next); history.replaceState(null, '', url);
  }
  function openSupport(next: 'artifact' | 'queue', trigger: HTMLButtonElement) { supportTrigger.current = trigger; setSupport(next); }
  function closeSupport() { setSupport(null); if (wide) requestAnimationFrame(() => supportTrigger.current?.focus()); }
  function queue(text: string) {
    const id = `task-${serial.current++}`;
    setTasks(current => [...current, { id, title: text, status: 'queued', description: '本地请求，尚未执行' }]);
  }
  function submitMessage(text: string) {
    setMessages(current => [...current, { id: `message-${serial.current++}`, from: 'user', text }]);
    queue(text); record(`本地已记录请求：${text}`);
  }
  function editMessage(text: string) {
    setDraft(text);
    document.getElementById('workbench-composer')?.querySelector('textarea')?.focus();
  }
  function changeTask(id: string, status: QueueTaskStatus) {
    setTasks(current => current.map(task => task.id === id ? { ...task, status } : task));
    record(`本地队列状态已更新：${status}`);
  }
  function playSample() {
    const id = `sample-${serial.current++}`;
    setMessages(current => [...current, { id, from: 'assistant', text: '' }]); setStream(id);
    record('正在播放固定的本地示例文本。');
  }
  function applyName(name: string) {
    setWorkspaceName(name); setPreviewName(name); setSettingsName(name);
    record(`本地工作区名称已更新：${name}`);
  }

  const supportContent = support === 'artifact' ? <ArtifactPanel title="WorkspaceSettings.tsx" className="h-full" onClose={closeSupport} versions={[
    { id: 'before', label: '初始版本', status: 'ready', preview: <p className="text-sm">初始名称：个人工作区</p>, code: 'export const workspace = { name: "个人工作区" };', language: 'typescript' },
    { id: 'current', label: '当前草稿', status: 'draft', preview: <form className="grid gap-[var(--rui-content-gap)]" onSubmit={event => { event.preventDefault(); if (previewName.trim()) applyName(previewName.trim()); }}><div className="grid gap-2"><label htmlFor="preview-name" className="text-sm">预览名称</label><Input id="preview-name" value={previewName} onChange={event => setPreviewName(event.target.value)} required pattern=".*\S.*" /></div><Button type="submit" size="sm" className="justify-self-start">应用预览名称</Button><p className="text-xs text-muted-foreground">此表单只更新当前示例，与文件审查和设置视图共享状态。</p></form>, code: `export const workspace = { name: ${JSON.stringify(workspaceName)}, density: "compact" };`, language: 'typescript' },
  ]} /> : <div className="grid gap-[var(--rui-content-gap)]"><div className="flex items-center justify-between gap-2"><p className="text-xs text-muted-foreground">本地队列 · 不启动后台任务</p><Button size="icon-sm" variant="ghost" aria-label="关闭任务队列" onClick={closeSupport}><X aria-hidden="true" /></Button></div><TaskQueue tasks={tasks} onPause={id => changeTask(id, 'paused')} onResume={id => changeTask(id, 'running')} onCancel={id => changeTask(id, 'cancelled')} onRetry={id => changeTask(id, 'queued')} /></div>;

  return <AppShell className="workbench-shell reito-root" header={<div className="flex flex-wrap items-center gap-2"><h1 className="text-sm font-medium">Reito Workbench</h1><span className="text-xs text-muted-foreground">本地示例</span><div className="ml-auto flex items-center gap-1"><Button variant="ghost" size="sm" aria-label="切换工作台密度" onClick={() => setDensity(current => current === 'compact' ? 'comfortable' : 'compact')}>{density === 'compact' ? '紧凑' : '舒适'}</Button><Button variant="ghost" size="icon-sm" aria-label="切换工作台主题" title={theme === 'dark' ? '浅色主题' : '深色主题'} onClick={() => setTheme(current => current === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}</Button></div></div>} sidebar={<div className="grid gap-[var(--rui-content-gap)]"><p className="hidden truncate text-xs text-muted-foreground @2xl:block" title={workspaceName}>{workspaceName}</p><nav aria-label="工作台导航" className="workbench-nav">{([{ id: 'agent', icon: MessageSquare }, { id: 'files', icon: Files }, { id: 'settings', icon: Settings2 }] as const).map(item => <Button key={item.id} variant={view === item.id ? 'secondary' : 'ghost'} size="sm" aria-current={view === item.id ? 'page' : undefined} onClick={() => navigate(item.id)}><item.icon aria-hidden="true" />{viewLabels[item.id]}</Button>)}</nav><p className="hidden text-xs leading-5 text-muted-foreground @2xl:block">共享组件组成的工作面。消息、文件差异和设置均保存在当前示例。</p></div>}>
    {view === 'agent' && <WorkspacePane title={messages.length ? '工作区布局探索' : '新会话'} scroll={false} className="h-full" actions={<><Button variant="ghost" size="sm" aria-label="查看任务队列" onClick={event => openSupport('queue', event.currentTarget)}><ListTodo aria-hidden="true" /><span>队列</span></Button><Button variant="ghost" size="icon-sm" aria-label="新建本地会话" onClick={() => { setMessages([]); setDraft(''); setStream(null); setSupport(null); record('已新建本地会话，队列和设置仍保留。'); }}><Plus aria-hidden="true" /></Button></>}><div className="workbench-agent"><div className="workbench-thread"><Conversation className="flex-1" label="工作台对话" empty={<div className="grid gap-[var(--rui-content-gap)] py-4"><p className="text-base">从一条本地请求开始。</p><PromptSuggestions items={[{ id: 'layout', label: '检查布局', prompt: '检查工作区布局与共享间距' }, { id: 'focus', label: '检查焦点', prompt: '检查键盘焦点和窄屏显示' }]} onSelect={setDraft} /></div>}>
      {messages.map(message => <RichMessage key={message.id} from={message.from} content={message.text || ' '} local streaming={stream === message.id} actions={<MessageActions text={message.text} feedback={message.feedback ?? null} onEdit={message.from === 'user' ? () => editMessage(message.text) : undefined} onRetry={message.from === 'assistant' ? () => { queue(`重试示例：${message.text.slice(0, 40)}`); record('本地重试请求已加入队列。'); } : undefined} onFeedbackChange={message.from === 'assistant' ? feedback => setMessages(current => current.map(item => item.id === message.id ? { ...item, feedback } : item)) : undefined} />}>{message.artifact && <div className="mt-3 grid gap-[var(--rui-content-gap-sm)]"><ToolCall title="查看共享设计规范" status="success"><p className="text-xs text-muted-foreground">固定示例记录：组件使用共享令牌，未读取本机文件。</p></ToolCall><Button variant="ghost" size="sm" className="justify-self-start" aria-label="打开 WorkspaceSettings.tsx 预览" onClick={event => openSupport('artifact', event.currentTarget)}><FileCode2 aria-hidden="true" />WorkspaceSettings.tsx</Button></div>}</RichMessage>)}
    </Conversation><div id="workbench-composer" className="workbench-composer"><Composer value={draft} onValueChange={setDraft} onSubmit={submitMessage} running={stream !== null} onStop={() => { setStream(null); record('本地文本播放已停止。'); }} context={includeContext ? <ContextPill label="workspace-settings.ts" onRemove={() => setIncludeContext(false)}>workspace-settings.ts</ContextPill> : undefined} toolbar={<><Button type="button" size="icon-sm" variant="ghost" aria-label="添加当前文件为上下文" disabled={includeContext} onClick={() => setIncludeContext(true)}><Plus aria-hidden="true" /></Button><ModelSelector label="本地示例模式" compact options={[{ id: 'local', name: '本地示例' }, { id: 'draft', name: '仅记录请求' }]} value={model} onValueChange={setModel} /><Button type="button" variant="ghost" size="sm" disabled={stream !== null || model === 'draft'} onClick={playSample}><Play aria-hidden="true" />播放示例</Button></>} hint="Enter 记录本地请求 · Shift + Enter 换行 · 未连接模型" /></div></div>{support && wide && <aside aria-label={support === 'artifact' ? '产物预览面板' : '任务队列面板'} className="workbench-support">{supportContent}</aside>}</div></WorkspacePane>}
    {view === 'files' && <WorkspacePane title="文件与差异" className="h-full"><div className="workbench-page"><p className="text-xs text-muted-foreground">由本地数据提供的文件列表与明确行配对；这里不会读取、修改或执行文件。</p><div className="workbench-files"><ResourceList label="示例文件" items={resources} selectedIds={selectedFile ? [selectedFile] : []} onSelectionChange={ids => setSelectedFile(ids[0] ?? '')} actions={[{ id: 'review', label: '查看差异', onAction: item => setSelectedFile(item.id) }]} /><div className="grid min-w-0 gap-[var(--rui-content-gap)]">{selectedFile ? <><DiffViewer filename={resources.find(file => file.id === selectedFile)?.name} hunks={fileDiff(selectedFile, workspaceName)} defaultWrap /><Button variant="outline" size="sm" className="justify-self-start" onClick={() => record(`本地审查记录：已查看 ${resources.find(file => file.id === selectedFile)?.name}`)}>记录已查看</Button></> : <p className="text-sm text-muted-foreground">选择一个示例文件查看差异。</p>}</div></div><Checkpoint title="名称修改前" description="此恢复点只还原当前示例的工作区名称。" files={[{ path: 'workspace-settings.ts', status: 'modified' }]} confirmDescription="只将本地工作区名称还原为“个人工作区”，不会修改磁盘文件。" onRestore={() => applyName('个人工作区')} /><LogViewer label="本地操作日志" entries={logs} virtualized={false} onClear={() => { setLogs([]); setNotice('本地操作日志已清除。'); }} /></div></WorkspacePane>}
    {view === 'settings' && <WorkspacePane title="工作台设置" className="h-full"><div className="workbench-page workbench-settings"><p className="text-xs text-muted-foreground">设置只对当前页面示例生效。主题和密度保存在此浏览器。</p><form className="grid gap-[var(--rui-content-gap)]" onSubmit={event => { event.preventDefault(); if (!settingsName.trim() || parallelLimit === null) { setSettingsError('请输入工作区名称和并行数量。'); return; } setSettingsError(''); applyName(settingsName.trim()); }} noValidate><SettingsSection title="工作区" description="同一份本地状态被会话、预览和文件审查复用。"><SettingsRow label="工作区名称" description="用于侧栏与产物示例"><Input aria-label="工作区名称" className="w-52 max-w-full" value={settingsName} onChange={event => setSettingsName(event.target.value)} aria-invalid={!!settingsError && !settingsName.trim()} /></SettingsRow><SettingsRow label="操作历史" description="控制后续本地操作是否出现在日志中"><Switch aria-label="保留本地操作历史" checked={saveHistory} onCheckedChange={setSaveHistory} /></SettingsRow></SettingsSection><NumberField label="示例并行数量" description="用于检查数字输入，不会启动后台任务。" value={parallelLimit} onValueChange={setParallelLimit} min={1} max={4} step={1} className="max-w-64" />{settingsError && <p role="alert" className="text-sm text-destructive">{settingsError}</p>}<Button type="submit" size="sm" className="justify-self-start">保存本地设置</Button></form><KeyValueEditor label="本地参数" value={config} onValueChange={setConfig} maxRows={4} requireValues submitLabel="保存本地参数" onSubmit={entries => record(`已保存 ${entries.length} 项本地参数。`)} /></div></WorkspacePane>}
    <div role="status" aria-label="工作台状态" className="shrink-0 border-t px-[var(--rui-content-padding)] py-1 text-xs text-muted-foreground"><span className="line-clamp-1" title={notice}>{notice}</span></div>
    {!wide && <Dialog open={support !== null} onOpenChange={next => { if (!next) setSupport(null); }}><DialogContent showCloseButton={false} finalFocus={supportTrigger} className="flex max-h-[90dvh] min-w-0 flex-col gap-0 overflow-auto p-[var(--rui-content-padding)] sm:max-w-xl"><DialogTitle className="sr-only">{support === 'artifact' ? '产物预览' : '任务队列'}</DialogTitle><DialogDescription className="sr-only">本地示例的辅助工作面</DialogDescription>{supportContent}</DialogContent></Dialog>}
  </AppShell>;
}

