import { useArgs } from 'storybook/preview-api';
import { textControl, booleanControl, choiceControl } from '../feature-controls.js';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { PermissionRequest } from '../../../../packages/ui/src/ai/decisions.js';
import { PermissionRequestDemo } from '../../../../packages/ui/src/ai/catalog.js';
import { StoryFrame } from './story-frame.js';

const meta = { title: 'AI/PermissionRequest', component: PermissionRequest, args: { title: '运行本地检查', description: '此处只展示授权状态，不会执行命令。', decision: 'pending', onDecision: fn() }, decorators: [Story => <StoryFrame><Story /></StoryFrame>] } satisfies Meta<typeof PermissionRequest>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Guidelines: Story = { name: '等待授权',};
export const Allowed: Story = { name: '已允许', args: { decision: 'allowed' } };
export const Denied: Story = { name: '已拒绝', args: { decision: 'denied' } };
export const Disabled: Story = { name: '禁用', args: { disabled: true } };
export const LocalDecision: Story = { name: '交互场景：允许与拒绝', render: () => <PermissionRequestDemo />, play: async ({ canvasElement }) => { const canvas = within(canvasElement); await userEvent.click(canvas.getByRole('button', { name: '拒绝' })); await expect(canvas.getByRole('status')).toHaveTextContent('已拒绝'); await expect(canvas.queryByRole('button', { name: '允许一次' })).not.toBeInTheDocument(); await userEvent.click(canvas.getByRole('button', { name: '重置权限示例' })); await userEvent.click(canvas.getByRole('button', { name: '允许一次' })); await expect(canvas.getByRole('status')).toHaveTextContent('已允许'); } };



export const Playground: Story = {
  name: '参数调试', args: { decision: 'pending', disabled: false, title: '运行本地检查', description: '此处只展示授权状态，不会执行命令。', detail: '', allowLabel: '允许一次', denyLabel: '拒绝' },
  argTypes: { decision: choiceControl(['pending', 'allowed', 'denied']), disabled: booleanControl, title: textControl, description: textControl, detail: textControl, allowLabel: textControl, denyLabel: textControl },
  parameters: { controls: { include: ['decision', 'disabled', 'title', 'description', 'detail', 'allowLabel', 'denyLabel'] } },
  render: function PlaygroundRender(args) { const [, updateArgs] = useArgs(); return <PermissionRequest {...args} onDecision={decision => updateArgs({ decision })} />; },
};
