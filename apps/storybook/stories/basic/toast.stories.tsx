import { useEffect, useRef } from 'react';
import { Button, ToastProvider, useToastManager } from '../../../../packages/ui/src/basic.js';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ToastDemo } from '../../../../packages/ui/src/basic/catalog.js';

const meta = { title: '基础/Toast', component: ToastDemo, tags: ['autodocs'], parameters: { docs: { description: { component: '本地 Base UI Toast 组合。Provider、焦点、F6 导航、公告、计时器和移除语义均由 Base UI 管理；示例 timeout=0 便于检查。' } } } } satisfies Meta<typeof ToastDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '成功与关闭', play: async ({ canvasElement }) => {
  const canvas = within(canvasElement); const body = within(canvasElement.ownerDocument.body);
  await userEvent.click(canvas.getByRole('button', { name: '显示通知' }));
  const region = await body.findByRole('region', { name: '通知' });
  await expect(within(region).getByText('更改已保存')).toBeVisible();
  await userEvent.keyboard('{F6}');
  await waitFor(() => expect(region).toHaveFocus());
  await userEvent.click(within(region).getByRole('button', { name: '关闭通知' }));
  await waitFor(() => expect(within(region).queryByText('更改已保存')).not.toBeInTheDocument());
} };
export const Undo: Story = { name: '撤销操作', args: { mode: 'undo' }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement); const body = within(canvasElement.ownerDocument.body);
  await userEvent.click(canvas.getByRole('button', { name: '归档示例任务' }));
  await expect(canvas.getByText('任务状态：已归档')).toBeVisible();
  await userEvent.click(await body.findByRole('button', { name: '撤销归档' }));
  await waitFor(() => expect(canvas.getByText('任务状态：进行中')).toBeVisible());
} };
export const Async: Story = { name: '异步加载到成功', args: { mode: 'async' }, play: async ({ canvasElement }) => {
  const canvas = within(canvasElement); const body = within(canvasElement.ownerDocument.body);
  const save = canvas.getByRole('button', { name: '保存设置' });
  await userEvent.click(save);
  await expect(save).toBeDisabled();
  const region = await body.findByRole('region', { name: '通知' });
  await waitFor(() => expect(within(region).getByText('设置已保存')).toBeVisible());
  await expect(save).toBeEnabled();
  await userEvent.keyboard('{F6}');
  await waitFor(() => expect(region).toHaveFocus());
  await userEvent.click(within(region).getByRole('button', { name: '关闭通知' }));
} };
export const Error: Story = { name: '高优先级错误', args: { mode: 'error' } };

function NotificationTrigger({ type }: { type: 'info' | 'loading' }) { const manager = useToastManager(); return <Button variant="outline" onClick={() => manager.add({ type, title: type === 'loading' ? '正在加载本地示例' : '工作区提示', description: type === 'loading' ? '持续加载状态，使用关闭按钮结束展示。' : '这是本地示例通知。' })}>显示通知</Button>; }
export const Information: Story = { name: '普通信息', render: () => <ToastProvider timeout={0}><NotificationTrigger type="info" /></ToastProvider> };
export const Loading: Story = { name: '持续加载', render: () => <ToastProvider timeout={0}><NotificationTrigger type="loading" /></ToastProvider> };

type ToastPlaygroundArgs = { type: 'info' | 'success' | 'error' | 'loading'; title: string; description: string; timeout: number };
function ToastPlaygroundTrigger(args: ToastPlaygroundArgs) {
  const manager = useToastManager();
  const toastId = useRef<string | null>(null);
  useEffect(() => { if (toastId.current) manager.update(toastId.current, { type: args.type, title: args.title, description: args.description, timeout: args.timeout }); }, [args.type, args.title, args.description, args.timeout, manager.update]);
  return <Button variant="outline" onClick={() => { if (toastId.current) manager.close(toastId.current); toastId.current = manager.add({ ...args }); }}>显示通知</Button>;
}
export const Playground: StoryObj<ToastPlaygroundArgs> = {
  name: '参数调试', args: { type: 'success', title: '更改已保存', description: '这是本地组件示例通知。', timeout: 0 },
  argTypes: { type: { control: 'select', options: ['info', 'success', 'error', 'loading'], table: { category: 'ToastManager' } }, title: { control: 'text', table: { category: 'ToastManager' } }, description: { control: 'text', table: { category: 'ToastManager' } }, timeout: { control: { type: 'number', min: 0, step: 1000 }, table: { category: 'ToastManager' }, description: '毫秒；0 表示手动关闭。修改参数会同步到已显示通知。' } },
  parameters: { controls: { include: ['type', 'title', 'description', 'timeout'] }, docs: { story: { inline: false, height: 'var(--rui-container-lg)' } } },
  render: args => <ToastProvider timeout={args.timeout}><ToastPlaygroundTrigger {...args} /></ToastProvider>,
};
