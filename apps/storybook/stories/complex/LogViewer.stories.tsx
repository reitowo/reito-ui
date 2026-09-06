import type { ComponentProps } from 'react';
import { useArgs } from 'storybook/preview-api';
import { textControl, booleanControl, recipeControl } from '../feature-controls.js';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { LogViewer } from '../../../../packages/ui/src/complex/log-viewer.js';
import { LogViewerDemo, demoLogEntries } from '../../../../packages/ui/src/complex/catalog.js';

const meta = {
  title: '复杂/LogViewer 日志查看', component: LogViewerDemo,
  parameters: { docs: { description: { component: '日志数组由宿主持有。组件提供级别、搜索和跟随状态，可用回调清除宿主数据；上滚会暂停跟随，不接收或执行终端命令。' } } },
} satisfies Meta<typeof LogViewerDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
  name: '交互场景：搜索、级别、暂停与清除',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const search = canvas.getByRole('textbox', { name: '搜索日志' });
    await userEvent.type(search, '认证');
    expect(canvas.getByText('显示 1 / 25 条 · 跟随最新')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: '错误' }));
    expect(canvas.getByText('没有符合筛选条件的日志')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: '错误' }));
    await userEvent.clear(search);
    await userEvent.click(canvas.getByRole('button', { name: '暂停跟随' }));
    await userEvent.click(canvas.getByRole('button', { name: '添加示例日志' }));
    expect(canvas.getByText('显示 26 / 26 条 · 跟随已暂停')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: '恢复跟随' }));
    expect(canvas.getByText('显示 26 / 26 条 · 跟随最新')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: '清除日志' }));
    expect(canvas.getByText('还没有日志记录')).toBeInTheDocument();
    expect(canvas.getByRole('button', { name: '清除日志' })).toBeDisabled();
  },
};
export const Empty: Story = { name: '空日志', render: () => <LogViewer entries={[]} /> };
export const Loading: Story = { name: '加载中', render: () => <LogViewer entries={[]} loading /> };
export const Error: Story = { name: '错误与已缓存日志', render: () => <LogViewer entries={demoLogEntries} error="日志来源连接失败，保留上次记录。" /> };

export const Default: Story = { name: '默认日志', render: () => <LogViewer entries={demoLogEntries} /> };
export const Paused: Story = { name: '暂停跟随', render: () => <LogViewer entries={demoLogEntries} defaultFollow={false} /> };
export const Disabled: Story = { name: '禁用操作', render: () => <LogViewer entries={demoLogEntries} disabled /> };

type PlaygroundArgs = Pick<ComponentProps<typeof LogViewer>, 'query' | 'levels' | 'follow' | 'loading' | 'disabled' | 'label' | 'error'> & { empty: boolean };
export const Playground: StoryObj<PlaygroundArgs> = {
 name: '参数调试', args: { query: '', levels: ['debug', 'info', 'warning', 'error'], follow: true, loading: false, disabled: false, label: '日志', error: '', empty: false },
 argTypes: { query: textControl, levels: { control: 'check', options: ['debug', 'info', 'warning', 'error'] }, follow: booleanControl, loading: booleanControl, disabled: booleanControl, label: textControl, error: textControl, empty: recipeControl(booleanControl, '传入空 entries；清除按钮同步更新此参数。') },
 parameters: { controls: { include: ['query', 'levels', 'follow', 'loading', 'disabled', 'label', 'error', 'empty'] } },
 render: function PlaygroundRender(args) { const [, updateArgs] = useArgs(); const { empty, ...props } = args; return <LogViewer {...props} entries={empty ? [] : demoLogEntries} onQueryChange={query => updateArgs({ query })} onLevelsChange={levels => updateArgs({ levels })} onFollowChange={follow => updateArgs({ follow })} onClear={() => updateArgs({ empty: true })} />; },
};
