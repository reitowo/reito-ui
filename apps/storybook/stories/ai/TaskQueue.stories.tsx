import type { ComponentProps } from 'react';
import { useArgs } from 'storybook/preview-api';
import { textControl, booleanControl, choiceControl, recipeControl } from '../feature-controls.js';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { TaskQueue } from '../../../../packages/ui/src/ai/task-queue.js';
import { demoQueueTasks, TaskQueueDemo } from '../../../../packages/ui/src/ai/catalog.js';
import { StoryFrame } from './story-frame.js';

const meta = { title: 'AI/TaskQueue', component: TaskQueue, args: { tasks: demoQueueTasks, onPause: fn(), onResume: fn(), onCancel: fn(), onRetry: fn() }, decorators: [Story => <StoryFrame><Story /></StoryFrame>], parameters: { docs: { description: { component: '队列任务、计数和筛选的展示组合。任务状态始终由宿主提供；暂停、继续、取消、重试调用宿主回调。本地示例不创建后台任务。' } } } } satisfies Meta<typeof TaskQueue>;
export default meta;
type Story = StoryObj<typeof meta>;

async function expectAlignedRows(canvasElement: HTMLElement) {
  const rows = [...canvasElement.querySelectorAll<HTMLElement>('[data-slot="task-queue-row"]')];
  const center = (element: Element) => { const box = element.getBoundingClientRect(); return box.y + box.height / 2; };
  const statusRight = rows[0]?.children[2].getBoundingClientRect().right;
  for (const row of rows) {
    const title = row.children[1].firstElementChild!;
    const status = row.children[2];
    await expect(Math.abs(center(title) - center(status))).toBeLessThanOrEqual(1);
    await expect(status.getBoundingClientRect().right).toBe(statusRight);
    const boundary = row.closest('section')!.getBoundingClientRect();
    for (const button of row.querySelectorAll('button')) {
      await expect(Math.abs(center(title) - center(button))).toBeLessThanOrEqual(1);
      await expect(button.getBoundingClientRect().right).toBeLessThanOrEqual(boundary.right);
    }
  }
}

export const Guidelines: Story = { name: '交互场景：暂停、取消与筛选',
  render: () => <TaskQueueDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const document = within(canvasElement.ownerDocument.body);
    await expectAlignedRows(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '暂停任务：检查工作区布局' }));
    await expect(await canvas.findByRole('button', { name: '继续任务：检查工作区布局' })).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: '继续任务：检查工作区布局' }));
    await expect(await canvas.findByRole('button', { name: '暂停任务：检查工作区布局' })).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: '取消任务：检查焦点样式' }));
    await expect(canvas.getByText('已取消')).toBeVisible();
    const select = canvas.getByRole('combobox', { name: '筛选任务队列' });
    select.focus(); await userEvent.keyboard('{ArrowDown}');
    await document.findByRole('option', { name: '需要处理的任务' });
    await userEvent.keyboard('{Home}{ArrowDown}{ArrowDown}{Enter}');
    await waitFor(() => expect(canvas.queryByText('检查工作区布局')).not.toBeInTheDocument());
    await userEvent.click(canvas.getByRole('button', { name: '重试任务：检查产物预览' }));
    await expect(canvas.getByText('当前筛选下没有任务')).toBeVisible();
  },
};
export const Disabled: Story = { name: '禁用队列', args: { disabled: true } };
export const Empty: Story = { name: '空队列', args: { tasks: [] } };
export const Completed: Story = { name: '已完成', args: { tasks: [{ id: 'done', title: '确认共享令牌', status: 'completed' }], filter: 'completed' } };
export const CallbackError: Story = { name: '操作失败', args: { onPause: fn(async () => { throw new Error('本地暂停失败，任务状态仍由宿主持有。'); }) }, play: async ({ canvasElement }) => { const canvas = within(canvasElement); await userEvent.click(canvas.getByRole('button', { name: '暂停任务：检查工作区布局' })); await expect(await canvas.findByRole('alert')).toHaveTextContent('本地暂停失败'); await expect(canvas.getByRole('button', { name: '暂停任务：检查工作区布局' })).toBeEnabled(); } };

const longTitle = '检查工作区里特别长的组件名称与无空格路径packages/ui/src/workspace/settings.ts';
const longError = '本地错误示例：预览数据缺少workspaceSettings.requiredConfiguration字段，请补齐后重新尝试。';
export const Narrow: Story = { name: '窄面板与长文本',
  args: { tasks: [{ id: 'long', title: longTitle, description: '完整说明保留在文本和悬停提示中', status: 'running' }, { id: 'error', title: '检查产物预览', status: 'failed', error: longError }, { id: 'done', title: '确认共享令牌', status: 'completed' }], onOpen: fn() },
  render: args => <div className="w-64 max-w-full"><TaskQueue {...args} /></div>,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expectAlignedRows(canvasElement);
    const title = canvas.getByRole('button', { name: longTitle });
    await expect(title.scrollWidth).toBeGreaterThan(title.clientWidth);
    await expect(title.parentElement?.getAttribute('title')).toContain(longTitle);
    await userEvent.click(title);
    await expect(args.onOpen).toHaveBeenCalledWith('long');
    const pause = canvas.getByRole('button', { name: `暂停任务：${longTitle}` });
    await expect(pause.getBoundingClientRect().width).toBe(pause.getBoundingClientRect().height);
    await expect(pause.querySelector('span')).not.toBeVisible();
    pause.focus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onPause).toHaveBeenCalledWith('long');
    const error = canvas.getByText(longError);
    await expect(error).toBeVisible();
    await expect(error.scrollWidth).toBeLessThanOrEqual(error.clientWidth + 1);
    await expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth + 1);
  },
};

export const Default: Story = { name: '运行中', args: { tasks: [{ id: 'layout', title: '检查工作区布局', description: '本地队列状态示例', status: 'running' }] } };
export const Queued: Story = { name: '排队中', args: { tasks: [{ id: 'layout', title: '检查工作区布局', status: 'queued' }] } };
export const Paused: Story = { name: '已暂停', args: { tasks: [{ id: 'layout', title: '检查工作区布局', status: 'paused' }] } };
export const Failed: Story = { name: '执行失败', args: { tasks: [{ id: 'layout', title: '检查工作区布局', status: 'failed', error: '本地错误示例：缺少布局配置。' }] } };
export const Cancelled: Story = { name: '已取消', args: { tasks: [{ id: 'layout', title: '检查工作区布局', status: 'cancelled' }] } };

type PlaygroundArgs = Pick<ComponentProps<typeof TaskQueue>, 'filter' | 'disabled' | 'title'> & { taskStatus: 'queued' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled'; taskTitle: string; taskDescription: string; taskError: string; empty: boolean };
export const Playground: StoryObj<PlaygroundArgs> = {
 name: '参数调试', args: { filter: 'all', disabled: false, title: '任务队列', taskStatus: 'running', taskTitle: '检查工作区布局', taskDescription: '本地队列状态示例', taskError: '本地示例：缺少布局配置。', empty: false },
 argTypes: { filter: choiceControl(['all', 'active', 'attention', 'completed', 'cancelled']), disabled: booleanControl, title: textControl, taskStatus: recipeControl(choiceControl(['queued', 'running', 'paused', 'completed', 'failed', 'cancelled']), 'tasks[0].status；操作按钮将同步更新此状态。'), taskTitle: recipeControl(textControl, 'tasks[0].title'), taskDescription: recipeControl(textControl, 'tasks[0].description'), taskError: recipeControl(textControl, 'tasks[0].error'), empty: recipeControl(booleanControl, '传入空 tasks。') },
 parameters: { controls: { include: ['taskStatus', 'filter', 'disabled', 'taskTitle', 'taskDescription', 'taskError', 'title', 'empty'] } },
 render: function PlaygroundRender(args) { const [, updateArgs] = useArgs(); return <TaskQueue filter={args.filter} disabled={args.disabled} title={args.title} tasks={args.empty ? [] : [{ id: 'example', status: args.taskStatus, title: args.taskTitle, description: args.taskDescription, error: args.taskError }]} onFilterChange={filter => updateArgs({ filter })} onPause={() => updateArgs({ taskStatus: 'paused' })} onResume={() => updateArgs({ taskStatus: 'running' })} onCancel={() => updateArgs({ taskStatus: 'cancelled' })} onRetry={() => updateArgs({ taskStatus: 'queued' })} />; },
};
