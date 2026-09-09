import { useEffect, useState } from 'react';
import { ArrowRight, Blocks, Braces, Check, CheckCheck, Code2, ExternalLink, Moon, PanelLeft, Search, Sparkles, Sun } from 'lucide-react';
import { Badge, Button, Input, Label, Progress, Switch, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Tabs, TabsContent, TabsList, TabsTrigger, TooltipProvider } from '@reito/ui/basic';
import { CodeBlock } from '../../../packages/ui/src/ai/code-block';
import { TokenReference } from './TokenReference';
import { version } from '../package.json';
import './home.css';

const repository = 'https://github.com/reitovo/reito-ui';
const siteBase = import.meta.env.BASE_URL;
const storybook = import.meta.env.VITE_STORYBOOK_URL || (import.meta.env.PROD ? `${siteBase}storybook/` : 'http://127.0.0.1:6007');
const example = `import { Button, Input } from '@reito/ui/basic';\n\nexport function SearchBar() {\n  return (\n    <div className="flex gap-2">\n      <Input aria-label="搜索项目" />\n      <Button>搜索</Button>\n    </div>\n  );\n}`;
const start = `git clone https://github.com/reitovo/reito-ui.git\ncd reito-ui\nnpm ci\nnpm run dev\n\n# 构建供其他项目安装的本地包\nnpm run pack:library`;
const initialTasks = [
  { title: '统一表单与设置', area: '基础组件', done: true },
  { title: '组织文件与数据', area: '复杂组件', done: false },
  { title: '连接对话与上下文', area: 'AI 组件', done: false },
];

function WorkspacePreview() {
  const [query, setQuery] = useState('');
  const [tasks, setTasks] = useState(initialTasks);
  const [notifications, setNotifications] = useState(true);
  const [autosave, setAutosave] = useState(false);
  const completed = tasks.filter(task => task.done).length;
  const visible = tasks.filter(task => `${task.title}${task.area}`.includes(query));
  return <div className="home-workspace">
    <div className="home-workspace-bar"><span className="flex items-center gap-2"><PanelLeft className="size-4" />个人工作区</span><span className="text-xs text-muted-foreground">交互示例 · 本地状态</span></div>
    <div className="home-workspace-body">
      <aside className="home-workspace-nav" aria-label="示例组件入口"><span className="text-xs text-muted-foreground">工作面</span><a href={`${siteBase}?layer=complex&component=workspace`}><Blocks className="size-4" />项目概览</a><a href={`${siteBase}?layer=complex&component=data-table`}><Braces className="size-4" />数据与文件</a><a href={`${siteBase}?layer=ai&component=composer`}><Sparkles className="size-4" />AI 助手</a><span className="mt-auto text-xs text-muted-foreground">Graphite / React</span></aside>
      <div className="home-workspace-main">
        <div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-xl font-semibold">把工作放在中心</h2><p className="mt-1 text-sm text-muted-foreground">从一套共享组件开始，组织自己的工作流。</p></div><Badge variant="secondary">本地示例</Badge></div>
        <Tabs defaultValue="preview" className="mt-5">
          <TabsList aria-label="展示方式"><TabsTrigger value="preview">界面预览</TabsTrigger><TabsTrigger value="code">查看代码</TabsTrigger></TabsList>
          <TabsContent value="preview" className="mt-4">
            <div className="home-preview-columns">
              <div className="min-w-0"><div className="relative mb-3"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" aria-label="筛选示例任务" placeholder="搜索任务…" value={query} onChange={event => setQuery(event.target.value)} /></div>
                <Table><TableHeader><TableRow><TableHead>任务</TableHead><TableHead>状态</TableHead><TableHead className="text-right">操作</TableHead></TableRow></TableHeader><TableBody>{visible.map(task => <TableRow key={task.title}><TableCell><div className="font-medium">{task.title}</div><div className="text-xs text-muted-foreground">{task.area}</div></TableCell><TableCell><span className="inline-flex items-center gap-1 whitespace-nowrap text-xs text-muted-foreground">{task.done && <Check className="size-3" />}{task.done ? '已完成' : '待处理'}</span></TableCell><TableCell className="text-right"><Button size="icon-xs" variant="ghost" aria-label={`${task.done ? '重新打开' : '完成'}${task.title}`} onClick={() => setTasks(items => items.map(item => item === task ? { ...item, done: !item.done } : item))}><CheckCheck /></Button></TableCell></TableRow>)}{!visible.length && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">没有匹配的任务</TableCell></TableRow>}</TableBody></Table>
              </div>
              <div className="home-settings"><h3 className="text-sm font-medium">工作偏好</h3><div className="flex items-center justify-between gap-3"><Label htmlFor="home-notifications">任务通知</Label><Switch id="home-notifications" checked={notifications} onCheckedChange={setNotifications} /></div><div className="flex items-center justify-between gap-3"><Label htmlFor="home-autosave">自动保存</Label><Switch id="home-autosave" checked={autosave} onCheckedChange={setAutosave} /></div><div className="mt-3 flex justify-between text-xs text-muted-foreground"><span>示例进度</span><span>{completed} / {tasks.length}</span></div><Progress aria-label="示例任务进度" value={completed / tasks.length * 100} /><p className="text-xs text-muted-foreground">点击任务操作，体验共享状态与反馈。</p></div>
            </div>
          </TabsContent>
          <TabsContent value="code" className="mt-4"><CodeBlock code={example} language="tsx" filename="search-bar.tsx" /></TabsContent>
        </Tabs>
      </div>
    </div>
  </div>;
}

export function Home() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
  const [tokensOpen, setTokensOpen] = useState(false);
  useEffect(() => {
    document.title = 'Reito UI · 为你的工具构建一致的界面';
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.density = 'compact';
    document.documentElement.style.colorScheme = theme;
    try { localStorage.setItem('reito-theme', theme); } catch { /* Session theme remains available. */ }
  }, [theme]);
  const linkClass = 'home-link';
  return <TooltipProvider><div className="reito-root home-page">
    <a className="home-skip" href="#home-main">跳到主要内容</a>
    <header className="home-header"><a href={siteBase} className="home-logo" aria-label="Reito UI 首页"><PanelLeft className="size-5" /><span>Reito UI</span></a><nav aria-label="主导航" className="order-last w-full justify-center sm:order-none sm:w-auto"><a href="#components">组件</a><a href="#design">设计语言</a><a href="#start">快速开始</a></nav><div className="flex items-center gap-2"><Button variant="ghost" size="icon-sm" aria-label="切换明暗主题" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? <Sun /> : <Moon />}</Button><a className="home-github" href={repository} target="_blank" rel="noreferrer" aria-label="GitHub 源码"><Code2 className="size-4" /></a></div></header>
    <main id="home-main">
      <section className="home-hero"><a href={`${repository}/commits/main`} className="home-version" target="_blank" rel="noreferrer"><span className="size-2 rounded-full bg-foreground" />Reito UI {version}<ArrowRight className="size-3" /></a><h1 className="text-3xl sm:text-[length:calc(var(--rui-font-display)*2)]">为你的工具，<br /><span className="text-muted-foreground">构建一致的界面。</span></h1><p>从基础控件到 AI 工作流，一套可复用的 React 组件。<br className="hidden sm:block" />紧凑、清晰，让每个界面说同一种设计语言。</p><div className="home-hero-actions"><a href={`${siteBase}?layer=basic&component=button`} className="home-primary-link">浏览组件<ArrowRight className="size-4" /></a><a href="#start" className="home-secondary-link">开始使用<Code2 className="size-4" /></a></div><div className="home-stack"><span>React</span><span>TypeScript</span><span>Tailwind CSS</span><span>Base UI</span><span>Storybook</span></div></section>
      <section className="home-container" aria-label="交互工作区展示"><WorkspacePreview /></section>
      <section id="components" className="home-section home-container"><div className="home-section-heading"><span className="text-sm text-muted-foreground">组件体系</span><h2>从一个按钮，到完整工作面。</h2><p>按应用需求逐层组合，共享同一套主题、交互和设计约束。</p></div><div className="home-layer-grid">{[
        { title: '基础组件', english: 'Foundation', icon: Blocks, description: '表单输入、选择、导航与反馈。为日常交互建立一致的起点。', items: 'Button · Input · Select · Dialog', href: `${siteBase}?layer=basic&component=button` },
        { title: '复杂组件', english: 'Workspace', icon: Braces, description: '数据表格、文件、编辑器与工作区。把多个操作组织成清晰流程。', items: 'DataTable · Form · Workspace', href: `${siteBase}?layer=complex&component=data-table` },
        { title: 'AI 组件', english: 'Intelligence', icon: Sparkles, description: '消息、上下文、工具调用与产物。让应用接入自己的模型和执行服务。', items: 'Composer · ToolCall · ArtifactPanel', href: `${siteBase}?layer=ai&component=composer` },
      ].map(layer => <a href={layer.href} className="home-layer" key={layer.title}><layer.icon className="size-6" /><div className="text-xs text-muted-foreground">{layer.english}</div><h3>{layer.title}<ArrowRight className="size-4" /></h3><p>{layer.description}</p><span className="mt-auto text-xs text-muted-foreground">{layer.items}</span></a>)}</div></section>
      <section id="design" className="home-section home-container home-design"><div className="home-section-heading"><span className="text-sm text-muted-foreground">Graphite 设计语言</span><h2>风格属于你，<br />一致性由系统维护。</h2><p>中性灰阶、克制的边界、明确的焦点。颜色、间距与尺寸来自共享 tokens，深浅主题从控件延伸到浮层。</p><Button className="mt-5" variant="outline" onClick={() => setTokensOpen(true)}>查看设计 Tokens<ArrowRight /></Button></div><div className="home-token-panel"><div className="flex justify-between text-sm"><span>一个主题，所有组件</span><span className="text-muted-foreground">{theme === 'dark' ? '深色' : '浅色'}</span></div><div className="home-swatches"><div className="bg-background">画布</div><div className="bg-card">表面</div><div className="bg-muted">辅助</div><div className="bg-primary text-primary-foreground">操作</div></div><div className="flex flex-wrap gap-3"><Button>主要操作</Button><Button variant="outline">次要操作</Button><Badge variant="secondary">共享样式</Badge></div><div className="border-t border-border pt-4 text-xs text-muted-foreground">语义颜色 / 统一尺寸 / 键盘焦点 / 中文内容</div></div></section>
      <section id="start" className="home-section home-container home-start"><div className="home-section-heading"><span className="text-sm text-muted-foreground">快速开始</span><h2>把组件，带进你的项目。</h2><p>克隆工程，打开组件目录，再构建本地安装包。当前通过仓库与本地打包使用，尚未发布 npm。</p><div className="mt-5 flex flex-wrap gap-4"><a className={linkClass} href={`${repository}/blob/main/docs/reuse-guide.md`} target="_blank" rel="noreferrer">安装与复用指南<ExternalLink className="size-3" /></a><a className={linkClass} href={storybook}>打开 Storybook<ArrowRight className="size-3" /></a></div></div><div className="min-w-0"><CodeBlock code={start} language="bash" filename="快速开始" /></div></section>
      <section className="home-container home-closing"><h2>先试用，再组合。</h2><p>在 Storybook 同页调整参数，找到适合自己应用的样式与行为。</p><a className="home-primary-link" href={storybook}>进入 Storybook<ArrowRight className="size-4" /></a></section>
    </main>
    <footer className="home-footer home-container"><a href={siteBase} className="home-logo"><PanelLeft className="size-4" />Reito UI</a><span>Graphite · 为个人工具而构建</span><a href={repository} target="_blank" rel="noreferrer">GitHub<ExternalLink className="size-3" /></a></footer>
    <TokenReference open={tokensOpen} onOpenChange={setTokensOpen} />
  </div></TooltipProvider>;
}
