import { useState, type ComponentProps } from 'react';
import { useArgs } from 'storybook/preview-api';
import { booleanControl, numberControl, recipeControl, textControl } from '../feature-controls.js';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { LogViewer, type LogEntry } from '../../../../packages/ui/src/complex/log-viewer.js';
import { LogViewerDemo, demoLogEntries } from '../../../../packages/ui/src/complex/catalog.js';
import { Button } from '../../../../packages/ui/src/primitives/button.js';

function makeLogs(count: number, start = 0): LogEntry[] {
  return Array.from({ length: count }, (_, offset) => {
    const index = start + offset;
    const level = (['debug', 'info', 'info', 'warning', 'info', 'error'] as const)[index % 6];
    return {
      id: `log-${String(index).padStart(5, '0')}`,
      level,
      time: `10:${String(Math.floor(index / 60) % 60).padStart(2, '0')}:${String(index % 60).padStart(2, '0')}`,
      source: index % 4 === 0 ? 'workspace/indexer' : index % 4 === 1 ? 'agent/runtime' : index % 4 === 2 ? 'extension/host' : 'sync/service',
      message: index % 29 === 0
        ? `任务 ${index} 正在处理动态长行：${'工作区索引与依赖状态 '.repeat(12)}\n下一行保留同一日志记录的测量与阅读锚点。`
        : `任务 ${index} 已完成本地日志阶段。`,
    };
  });
}

const largeLogs = makeLogs(10_000);
const makeStreamLogs = (count: number, start = 0) => makeLogs(count, start).map((entry, offset) => ({ ...entry, message: `流式任务 ${start + offset} 已写入本地日志。` }));

const meta = {
  title: '复杂/LogViewer 日志查看', component: LogViewerDemo,
  parameters: { docs: { description: { component: '宿主持有日志和加载过程。组件提供动态虚拟窗口、稳定追加/前插锚点、等级与文本查询、暂停跟随、可配置视图，以及显式加载边界；它不读取终端或持久化偏好。' } } },
} satisfies Meta<typeof LogViewerDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

type PlaygroundArgs = Pick<ComponentProps<typeof LogViewer>, 'query' | 'levels' | 'follow' | 'loading' | 'disabled' | 'label' | 'error' | 'virtualized' | 'overscan' | 'totalCount' | 'hasOlder' | 'loadingOlder' | 'loadOlderError'> & {
  empty: boolean;
  wrapLines: boolean;
  showTimestamp: boolean;
  showLevel: boolean;
  showSource: boolean;
};

export const Playground: StoryObj<PlaygroundArgs> = {
  name: '参数调试',
  args: {
    query: '', levels: ['debug', 'info', 'warning', 'error'], follow: true, loading: false, disabled: false,
    label: '日志', error: '', virtualized: true, overscan: 6, totalCount: 25, hasOlder: false, loadingOlder: false, loadOlderError: '', empty: false,
    wrapLines: true, showTimestamp: true, showLevel: true, showSource: true,
  },
  argTypes: {
    query: textControl,
    levels: { control: 'check', options: ['debug', 'info', 'warning', 'error'] },
    follow: booleanControl, loading: booleanControl, disabled: booleanControl, label: textControl, error: textControl,
    virtualized: booleanControl, overscan: numberControl, totalCount: numberControl, hasOlder: booleanControl, loadingOlder: booleanControl,
    loadOlderError: textControl, empty: recipeControl(booleanControl, '传入空 entries。'), wrapLines: booleanControl,
    showTimestamp: booleanControl, showLevel: booleanControl, showSource: booleanControl,
  },
  parameters: { controls: { include: ['query', 'levels', 'follow', 'loading', 'disabled', 'label', 'error', 'virtualized', 'overscan', 'totalCount', 'hasOlder', 'loadingOlder', 'loadOlderError', 'empty', 'wrapLines', 'showTimestamp', 'showLevel', 'showSource'] } },
  render: function PlaygroundRender(args) {
    const [, updateArgs] = useArgs();
    const { empty, wrapLines, showTimestamp, showLevel, showSource, ...props } = args;
    return <LogViewer {...props} entries={empty ? [] : demoLogEntries} viewportClassName="h-56"
      viewPreferences={{ wrapLines, showTimestamp, showLevel, showSource }}
      onQueryChange={query => updateArgs({ query })} onLevelsChange={levels => updateArgs({ levels })}
      onFollowChange={follow => updateArgs({ follow })}
      onViewPreferencesChange={preferences => updateArgs(preferences)}
      onLoadOlder={() => updateArgs({ loadingOlder: true })} onClear={() => updateArgs({ empty: true })} />;
  },
};

export const Overview: Story = { name: '总览', render: () => <LogViewerDemo /> };

function InteractiveDemo() {
  const [entries, setEntries] = useState(demoLogEntries);
  const [follow, setFollow] = useState(true);
  return <div className="space-y-[var(--rui-content-gap)]">
    <LogViewer entries={entries} follow={follow} onFollowChange={setFollow} onClear={() => setEntries([])} viewportClassName="h-48" />
    <Button size="sm" variant="outline" onClick={() => setEntries(current => [...current, { id: `new-${current.length}`, level: 'warning', time: '10:30:00', source: 'local-preview', message: '新增本地日志' }])}>添加示例日志</Button>
  </div>;
}

export const Interactive: Story = {
  name: '交互场景：查询、级别、跟随与清除', render: () => <InteractiveDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const search = canvas.getByRole('textbox', { name: '搜索日志' });
    await userEvent.type(search, '认证');
    expect(canvas.getByText('显示 1 / 已加载 25 · 跟随最新')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: '错误' }));
    expect(canvas.getByText('没有符合筛选条件的日志')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: '错误' }));
    await userEvent.clear(search);
    await userEvent.click(canvas.getByRole('button', { name: '暂停跟随' }));
    await userEvent.click(canvas.getByRole('button', { name: '添加示例日志' }));
    expect(canvas.getByText('已加载 26 · 跟随已暂停')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: '恢复跟随' }));
    await userEvent.click(canvas.getByRole('button', { name: '清除' }));
    expect(canvas.getByText('还没有日志记录')).toBeInTheDocument();
    expect(canvas.getByRole('button', { name: '清除' })).toBeDisabled();
  },
};

function StreamDemo({ paused = false }: { paused?: boolean }) {
  const [entries, setEntries] = useState(() => makeStreamLogs(120));
  return <div className="space-y-[var(--rui-content-gap)]">
    <LogViewer entries={entries} defaultFollow={!paused} viewportClassName="h-52" />
    <Button size="sm" variant="outline" onClick={() => setEntries(current => [...current, ...makeStreamLogs(4, current.length)])}>追加 4 条日志</Button>
  </div>;
}

function OlderLogsDemo({ fail = false }: { fail?: boolean }) {
  const [start, setStart] = useState(160);
  const entries = makeLogs(200 - start, start);
  return <LogViewer entries={entries} totalCount={200} hasOlder={start > 0} loadOlderError={fail ? '更早日志加载失败' : undefined}
    onLoadOlder={() => setStart(current => Math.max(0, current - 20))} defaultFollow={false} viewportClassName="h-52" />;
}

export const VirtualLarge: Story = { name: '一万条动态虚拟日志', render: () => <LogViewer entries={largeLogs} viewportClassName="h-72" /> };
export const AppendFollowing: Story = { name: '跟随时增量追加', render: () => <StreamDemo /> };
export const AppendPaused: Story = { name: '暂停时增量追加', render: () => <StreamDemo paused /> };
export const LoadOlder: Story = { name: '前插加载更早日志', render: () => <OlderLogsDemo /> };
export const LoadOlderPending: Story = { name: '正在加载更早日志', render: () => <LogViewer entries={makeLogs(40, 160)} totalCount={200} hasOlder loadingOlder onLoadOlder={() => undefined} defaultFollow={false} /> };
export const LoadOlderError: Story = { name: '更早日志失败与重试', render: () => <OlderLogsDemo fail /> };
export const LongWrapped: Story = { name: '动态长行换行', render: () => <LogViewer entries={makeLogs(80)} defaultFollow={false} viewportClassName="h-64" /> };
export const LongUnwrapped: Story = { name: '长行横向滚动', render: () => <LogViewer entries={makeLogs(80)} defaultFollow={false} defaultViewPreferences={{ wrapLines: false }} viewportClassName="h-64" /> };
export const MinimalView: Story = { name: '精简视图偏好', render: () => <LogViewer entries={demoLogEntries} defaultViewPreferences={{ showTimestamp: false, showLevel: false, showSource: false }} /> };
export const Filtered: Story = { name: '等级与来源查询', render: () => <LogViewer entries={makeLogs(180)} levels={['warning', 'error']} query="sync/service" defaultFollow={false} /> };
export const InitialLoading: Story = { name: '首次加载', render: () => <LogViewer entries={[]} loading /> };
export const ErrorWithCache: Story = { name: '错误与已缓存日志', render: () => <LogViewer entries={demoLogEntries} error="日志来源连接失败，保留上次记录。" /> };
export const Empty: Story = { name: '空日志', render: () => <LogViewer entries={[]} /> };
export const Disabled: Story = { name: '禁用操作', render: () => <LogViewer entries={demoLogEntries} disabled onClear={() => undefined} /> };
export const NonVirtual: Story = { name: '小集合非虚拟模式', render: () => <LogViewer entries={demoLogEntries.slice(0, 8)} virtualized={false} viewportClassName="h-52" /> };
export const Narrow: Story = { name: '窄宽度', render: () => <div className="max-w-80"><LogViewer entries={makeLogs(80)} defaultFollow={false} defaultViewPreferences={{ wrapLines: true }} viewportClassName="h-60" /></div> };
