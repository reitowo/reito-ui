import type { ComponentProps } from 'react';
import { textControl, booleanControl, rangeControl } from '../feature-controls.js';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { KeyValueEditor, type KeyValueEntry } from '../../../../packages/ui/src/complex/key-value-editor.js';
import { KeyValueEditorDemo } from '../../../../packages/ui/src/complex/catalog.js';

const meta = {
  title: '复杂/KeyValueEditor 键值编辑', component: KeyValueEditorDemo,
  parameters: { docs: { description: { component: '受控数组保留稳定行 ID 和无效草稿。键去掉前后空白后按大小写区分校验重复，值是否必填可配置。密码输入只提供视觉遮罩；应用回调可以返回 Promise。' } } },
} satisfies Meta<typeof KeyValueEditorDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
  name: '交互场景：增删、校验、遮罩与应用',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByLabelText('值 2（敏感）')).toHaveAttribute('type', 'password');
    await userEvent.click(canvas.getByRole('button', { name: '显示第 2 项的值' }));
    expect(canvas.getByLabelText('值 2（敏感）')).toHaveAttribute('type', 'text');
    await userEvent.click(canvas.getByRole('button', { name: '隐藏第 2 项的值' }));
    await userEvent.click(canvas.getByRole('button', { name: '添加键值' }));
    expect(canvas.getByRole('button', { name: '应用配置' })).toBeDisabled();
    await userEvent.type(canvas.getByLabelText('键 3'), 'WORKSPACE');
    await userEvent.type(canvas.getByLabelText('值 3'), 'local');
    expect(canvas.getAllByText('键不能重复')).toHaveLength(2);
    await userEvent.clear(canvas.getByLabelText('键 3'));
    await userEvent.type(canvas.getByLabelText('键 3'), 'REGION');
    await userEvent.click(canvas.getByRole('button', { name: '应用配置' }));
    expect(canvas.getByText('已应用 3 项本地配置')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: '删除第 3 项' }));
    expect(canvas.queryByLabelText('键 3')).not.toBeInTheDocument();
  },
};
export const Empty: Story = {
  name: '从空配置开始',
  render: function EmptyEditor() {
    const [value, setValue] = useState<KeyValueEntry[]>([]);
    return <KeyValueEditor value={value} onValueChange={setValue} />;
  },
};
export const Invalid: Story = {
  name: '状态对比：重复键与必填错误',
  render: function InvalidEditor() {
    const [value, setValue] = useState<KeyValueEntry[]>([{ id: 'a', key: 'MODE', value: '' }, { id: 'b', key: 'MODE', value: 'local' }]);
    return <KeyValueEditor value={value} onValueChange={setValue} requireValues />;
  },
};
export const Disabled: Story = { name: '禁用', render: () => <KeyValueEditor value={[{ id: 'fixed', key: 'WORKSPACE_ID', value: 'local-01', readOnly: true }]} onValueChange={() => {}} disabled /> };

function EntryExample({ initial, requireValues = false }: { initial: KeyValueEntry[]; requireValues?: boolean }) { const [value, setValue] = useState(initial); return <KeyValueEditor value={value} onValueChange={setValue} requireValues={requireValues} />; }
export const Default: Story = { name: '默认键值', render: () => <EntryExample initial={[{ id: 'workspace', key: 'WORKSPACE', value: 'local' }]} /> };
export const Secret: Story = { name: '敏感值遮罩', render: () => <EntryExample initial={[{ id: 'example', key: 'EXAMPLE_SECRET', value: 'local-demo-value', secret: true }]} /> };
export const ReadOnly: Story = { name: '只读条目', render: () => <EntryExample initial={[{ id: 'workspace', key: 'WORKSPACE_ID', value: 'local-01', readOnly: true }]} /> };
export const RequiredValue: Story = { name: '必填值错误', render: () => <EntryExample initial={[{ id: 'workspace', key: 'WORKSPACE', value: '' }]} requireValues /> };
export const DuplicateKeys: Story = { name: '重复键错误', render: () => <EntryExample initial={[{ id: 'first', key: 'MODE', value: 'local' }, { id: 'second', key: 'MODE', value: 'preview' }]} /> };

type PlaygroundArgs = Pick<ComponentProps<typeof KeyValueEditor>, 'label' | 'requireValues' | 'maxRows' | 'disabled' | 'submitLabel'>;
function KeyValuePlayground(args: PlaygroundArgs) { const [value, setValue] = useState<KeyValueEntry[]>([{ id: 'example', key: 'WORKSPACE_NAME', value: 'Graphite' }]); return <KeyValueEditor {...args} value={value} onValueChange={setValue} onSubmit={() => {}} />; }
export const Playground: StoryObj<PlaygroundArgs> = {
 name: '参数调试', args: { label: '键值配置', requireValues: false, maxRows: 5, disabled: false, submitLabel: '应用配置' },
 argTypes: { label: textControl, requireValues: booleanControl, maxRows: rangeControl(1, 10), disabled: booleanControl, submitLabel: textControl },
 parameters: { controls: { include: ['requireValues', 'maxRows', 'disabled', 'label', 'submitLabel'] } }, render: args => <KeyValuePlayground {...args} />,
};
