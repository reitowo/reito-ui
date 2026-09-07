import { useEffect, useState, type ComponentProps } from 'react';
import { useArgs } from 'storybook/preview-api';
import { FileText, ListTodo, Play, Settings } from 'lucide-react';
import { textControl, booleanControl, choiceControl, recipeControl } from '../feature-controls.js';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, userEvent, within } from 'storybook/test';
import { Button } from '../../../../packages/ui/src/basic.js';
import { ApplicationSearch, CommandSearch, type CommandGroupDefinition } from '../../../../packages/ui/src/complex/index.js';
import { CommandSearchDemo, demoCommands } from '../../../../packages/ui/src/complex/catalog.js';
const meta = { title: '复杂/CommandSearch 命令搜索', component: CommandSearchDemo, parameters: { docs: { description: { component: 'CommandSearch 提供分组、关键词匹配、异步/错误状态与当前上下文。ApplicationSearch 将它放入受控 Dialog，提供全局快捷键、异步动作、失败恢复和焦点归还；结果与副作用均由宿主注入。' } } } } satisfies Meta<typeof CommandSearchDemo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Interactive: Story = {
  name: '交互场景：搜索、空态、IME 与执行',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement); const input = canvas.getByRole('combobox', { name: '搜索命令' });
    await userEvent.type(input, 'zzzz-no-result');
    expect(canvas.getByText('没有找到匹配的命令')).toBeInTheDocument();
    await userEvent.clear(input); await userEvent.type(input, 'project');
    expect(canvas.getByRole('option', { name: /打开项目/ })).toBeInTheDocument();
    await fireEvent.compositionStart(input);
    await fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', isComposing: true });
    expect(canvas.getByRole('status')).toHaveTextContent('选择命令以预览结果');
    await fireEvent.compositionEnd(input);
    await userEvent.keyboard('{Enter}');
    expect(canvas.getByRole('status')).toHaveTextContent('已选择：打开项目（本地演示）');
  },
};
export const Empty: Story = { name: '无可用命令', render: () => <CommandSearch groups={[]} onSelect={() => {}} /> };
export const Loading: Story = { name: '加载中', render: () => <CommandSearch groups={[]} onSelect={() => {}} loading /> };
export const ErrorRetry: Story = { name: '搜索失败与重试', render: () => <CommandSearch groups={[]} onSelect={() => {}} error="本地索引暂时不可用" onRetry={() => {}} context="设计系统 / components" /> };
export const CurrentContext: Story = { name: '当前工作上下文', render: () => <CommandSearch groups={demoCommands} onSelect={() => {}} context="reito-ui / Workspace.stories.tsx" contextLabel="搜索范围" /> };

export const Default: Story = { name: '默认命令列表', render: () => <CommandSearch groups={demoCommands} onSelect={() => {}} /> };
export const NoMatches: Story = { name: '搜索没有结果', render: () => <CommandSearch groups={demoCommands} query="不存在的命令" onSelect={() => {}} /> };
export const DisabledCommand: Story = { name: '禁用命令', render: () => <CommandSearch groups={[{ id: 'local', label: '本地工具', commands: [{ id: 'terminal', label: '打开终端', description: '此示例中不可用', disabled: true }] }]} onSelect={() => {}} /> };

const applicationGroups: CommandGroupDefinition[] = [
  { id: 'files', label: '文件', commands: [
    { id: 'file-workspace', label: 'Workspace.stories.tsx', description: 'apps/storybook/stories/complex', keywords: ['workspace', 'story'], icon: <FileText />, actionLabel: '打开' },
    { id: 'file-guide', label: 'design-language.md', description: 'docs', keywords: ['design', 'tokens'], icon: <FileText />, actionLabel: '打开' },
  ] },
  { id: 'tasks', label: '任务', commands: [
    { id: 'task-shell', label: '统一应用搜索', description: 'SHELL-SEARCH-01 · 当前任务', keywords: ['search', 'shell'], icon: <ListTodo />, actionLabel: '查看' },
  ] },
  { id: 'actions', label: '操作', commands: [
    { id: 'action-check', label: '运行组件检查', description: '调用宿主提供的本地动作', keywords: ['check', 'test'], icon: <Play />, actionLabel: '运行' },
    { id: 'action-settings', label: '打开偏好设置', icon: <Settings />, actionLabel: '打开' },
  ] },
];

function ApplicationSearchExample({ initialOpen = true, failAction = false }: { initialOpen?: boolean; failAction?: boolean }) {
  const [open, setOpen] = useState(initialOpen);
  const [receipt, setReceipt] = useState('尚未选择');
  return <div className="grid gap-[var(--rui-content-gap)]">
    <Button type="button" variant="outline" className="w-fit" onClick={() => setOpen(true)}>搜索文件、任务与操作 <span className="ml-2 text-xs text-muted-foreground">Ctrl K</span></Button>
    <ApplicationSearch open={open} onOpenChange={setOpen} groups={applicationGroups} context="reito-ui / Workspace.stories.tsx" contextLabel="当前工作" label="搜索应用" placeholder="搜索文件、任务或操作…" onSelect={async command => { await new Promise(resolve => setTimeout(resolve, 120)); if (failAction) throw new Error('local demo'); setReceipt(`已选择：${command.label}`); }} />
    <p role="status" className="text-xs text-muted-foreground">{receipt}（本地演示）</p>
  </div>;
}

export const ApplicationDialog: Story = { name: '应用级搜索 Dialog', render: () => <ApplicationSearchExample /> };
export const ShortcutAndFocus: Story = { name: '快捷键打开与焦点归还', render: () => <ApplicationSearchExample initialOpen={false} /> };
export const ActionFailure: Story = { name: '异步动作失败恢复', render: () => <ApplicationSearchExample failAction /> };

function AsyncSourcesExample() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [groups, setGroups] = useState<CommandGroupDefinition[]>([]);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    setError('');
    if (!query.trim()) { setLoading(false); setGroups([]); return; }
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
      if (query === '失败' && attempt === 0) { setError('本地索引暂时不可用'); setGroups([]); return; }
      setGroups(query === '失败' ? [{ id: 'recovered', label: '恢复结果', commands: [{ id: 'recovered-result', label: '失败恢复结果', description: '同一查询重试成功', actionLabel: '打开' }] }] : applicationGroups);
    }, 180);
    return () => clearTimeout(timer);
  }, [attempt, query]);
  return <CommandSearch groups={groups} query={query} onQueryChange={setQuery} onSelect={() => {}} loading={loading} error={error} onRetry={() => setAttempt(value => value + 1)} context="当前工作区" label="异步搜索应用资源" placeholder="输入 Workspace；输入“失败”查看恢复" />;
}

export const AsyncSources: Story = { name: '宿主异步搜索源', render: () => <AsyncSourcesExample /> };

type PlaygroundArgs = Pick<ComponentProps<typeof CommandSearch>, 'query' | 'loading' | 'label' | 'placeholder' | 'emptyMessage' | 'error' | 'disabled'> & { modal: boolean; open: boolean; shortcut: string; context: string; actionBehavior: 'success' | 'error'; empty: boolean; selectedCommand: string };
export const Playground: StoryObj<PlaygroundArgs> = {
 name: '参数调试', args: { modal: true, open: true, shortcut: 'mod+k', context: 'reito-ui / 当前工作区', query: '', loading: false, error: '', disabled: false, label: '搜索应用', placeholder: '搜索文件、任务或操作…', emptyMessage: '没有找到匹配的结果', actionBehavior: 'success', empty: false, selectedCommand: '' },
 argTypes: { modal: booleanControl, open: booleanControl, shortcut: textControl, context: textControl, query: textControl, loading: booleanControl, error: textControl, disabled: booleanControl, label: textControl, placeholder: textControl, emptyMessage: textControl, actionBehavior: choiceControl(['success', 'error']), empty: recipeControl(booleanControl, '传入空 groups。'), selectedCommand: recipeControl(textControl, '宿主收到 onSelect 后显示所选结果。') },
 parameters: { controls: { include: ['modal', 'open', 'shortcut', 'context', 'query', 'loading', 'error', 'disabled', 'label', 'placeholder', 'emptyMessage', 'actionBehavior', 'empty', 'selectedCommand'] } },
 render: function PlaygroundRender(args) { const [, updateArgs] = useArgs<PlaygroundArgs>(); const searchProps = { groups: args.empty ? [] : applicationGroups, query: args.query, onQueryChange: (query: string) => updateArgs({ query }), loading: args.loading, error: args.error, disabled: args.disabled, context: args.context, label: args.label, placeholder: args.placeholder, emptyMessage: args.emptyMessage, onRetry: () => updateArgs({ error: '' }), onSelect: async (command: CommandGroupDefinition['commands'][number]) => { await new Promise(resolve => setTimeout(resolve, 100)); if (args.actionBehavior === 'error') throw new Error('local demo'); updateArgs({ selectedCommand: command.label }); } }; return <div className="grid gap-[var(--rui-content-gap)]">{args.modal ? <><Button type="button" variant="outline" className="w-fit" onClick={() => updateArgs({ open: true })}>打开应用搜索</Button><ApplicationSearch {...searchProps} open={args.open} onOpenChange={open => updateArgs({ open })} shortcut={args.shortcut || false} /></> : <CommandSearch {...searchProps} />}<p role="status" className="text-sm text-muted-foreground">{args.selectedCommand ? '本地已选择：' + args.selectedCommand : '本地搜索示例，不执行外部操作。'}</p></div>; },
};
