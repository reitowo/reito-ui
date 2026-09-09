import type { Meta, StoryObj } from '@storybook/react-vite';
import { OneTimeCode } from '@reito/ui';
import { OneTimeCodeDemo } from '../../../../packages/ui/src/basic/one-time-code-demo';

const meta = {
  title: '基础/OneTimeCode', component: OneTimeCode,
  args: { label: 'JumpServer 验证码', code: '123456', remainingSeconds: 24, locked: false, loading: false, disabled: false },
  argTypes: {
    label: { control: 'text' }, code: { control: 'text' }, remainingSeconds: { control: 'number' },
    locked: { control: 'boolean' }, loading: { control: 'boolean' }, disabled: { control: 'boolean' },
    onCopy: { control: false, description: '宿主负责剪贴板操作；失败反馈由组件展示。' },
  },
} satisfies Meta<typeof OneTimeCode>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = { name: '参数调试', render: args => <OneTimeCode {...args} onCopy={async () => {}} /> };
export const Interactive: Story = { name: '交互场景', render: () => <OneTimeCodeDemo /> };
export const Locked: Story = { args: { locked: true } };
export const Loading: Story = { args: { loading: true } };
export const Empty: Story = { args: { code: null, remainingSeconds: undefined } };
export const Expired: Story = { args: { remainingSeconds: 0 } };
export const Disabled: Story = { args: { disabled: true, onCopy: async () => {} } };
