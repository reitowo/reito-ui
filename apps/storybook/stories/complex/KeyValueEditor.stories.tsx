import type { ComponentProps } from 'react';
import { booleanControl, choiceControl, rangeControl, recipeControl, textControl } from '../feature-controls.js';
import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { KeyValueEditor, type KeyValueEntry, type KeyValueKind } from '../../../../packages/ui/src/complex/key-value-editor.js';
import { KeyValueEditorDemo } from '../../../../packages/ui/src/complex/catalog.js';

const meta = {
  title: '复杂/KeyValueEditor 键值编辑', component: KeyValueEditorDemo,
  parameters: { docs: { description: { component: '受控数组保留稳定行 ID 和无效草稿。支持文本、数字、布尔、选项和日期值，嵌套路径、逐项禁用/只读、草稿通知、重复键校验，以及跨行校验、批量提交、取消/重置和异步错误定位。密码输入只提供视觉遮罩。' } } },
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

const typedEntries: KeyValueEntry[] = [
  { id: 'port', key: 'PORT', value: '5173', kind: 'number', min: 1, max: 65535 },
  { id: 'autosave', key: 'AUTOSAVE', value: 'true', kind: 'boolean' },
  { id: 'density', key: 'DENSITY', value: 'compact', kind: 'select', options: [{ value: 'compact', label: '紧凑' }, { value: 'comfortable', label: '舒适' }] },
  { id: 'archive', key: 'ARCHIVE_DATE', value: '2026-09-30', kind: 'date', min: '2026-09-01', max: '2026-12-31' },
];
export const TypedValues: Story = { name: '富类型值编辑', render: () => <EntryExample initial={typedEntries} requireValues /> };
export const NestedPaths: Story = { name: '嵌套路径与草稿', render: function NestedPathEditor() { const [value, setValue] = useState<KeyValueEntry[]>([{ id: 'font', key: 'FONT_SIZE', value: '14', kind: 'number', path: ['editor', 'appearance', 'fontSize'] }]); const [draft, setDraft] = useState('尚未修改'); return <div className="space-y-[var(--rui-content-gap)]"><KeyValueEditor value={value} onValueChange={setValue} onDraftValueChange={(_id, patch, path) => setDraft(`${path.join('.')} = ${patch.value ?? patch.key}`)} /><p role="status" className="text-xs text-muted-foreground">{draft}</p></div>; } };
export const PerEntryDisabled: Story = { name: '逐项禁用与只读', render: () => <EntryExample initial={[{ id: 'open', key: 'EDITABLE', value: 'local' }, { id: 'disabled', key: 'POLICY', value: 'managed', disabled: true }, { id: 'readonly', key: 'WORKSPACE_ID', value: 'local-01', readOnly: true }]} /> };
export const Narrow: Story = { name: '窄宽度', render: () => <div className="max-w-80"><EntryExample initial={typedEntries} requireValues /></div> };

const transactionInitial: KeyValueEntry[] = [
  { id: 'mode', key: 'MODE', value: 'local', kind: 'select', options: [{ value: 'local', label: '本地' }, { value: 'production', label: '生产' }, { value: 'reserved', label: '保留值' }] },
  { id: 'port', key: 'PORT', value: '5173', kind: 'number', min: 1, max: 65535 },
];
const transactionDefaults: KeyValueEntry[] = [
  { ...transactionInitial[0], value: 'local' },
  { ...transactionInitial[1], value: '3000' },
];

function TransactionExample({ failure = false }: { failure?: boolean }) {
  const [value, setValue] = useState(() => transactionInitial.map(entry => ({ ...entry })));
  const [receipt, setReceipt] = useState('尚未应用');
  return <div className="space-y-[var(--rui-content-gap)]">
    <KeyValueEditor
      value={value}
      defaultValue={transactionDefaults}
      onValueChange={setValue}
      validateAll={async entries => {
        await new Promise(resolve => setTimeout(resolve, 40));
        const mode = entries.find(entry => entry.id === 'mode')?.value;
        const port = Number(entries.find(entry => entry.id === 'port')?.value);
        return mode === 'production' && port < 1024 ? { port: { value: '生产模式端口不能小于 1024' } } : {};
      }}
      onSubmit={async (entries, changes) => {
        await new Promise(resolve => setTimeout(resolve, 60));
        if (failure) throw new Error('本地配置服务暂时不可用，草稿仍然保留。');
        if (entries.find(entry => entry.id === 'mode')?.value === 'reserved') return { entryErrors: { mode: { value: '该模式值已被策略保留' } }, error: '请修正标记的配置。' };
        setReceipt(`已应用 ${entries.length} 项 / ${changes.length} 处更改`);
      }}
    />
    <p data-testid="key-value-receipt" className="text-xs text-muted-foreground">{receipt}</p>
  </div>;
}

export const Transactional: Story = { name: '批量事务与跨行校验', render: () => <TransactionExample /> };
export const SubmitFailure: Story = { name: '提交失败并保留草稿', render: () => <TransactionExample failure /> };

type PlaygroundArgs = Pick<ComponentProps<typeof KeyValueEditor>, 'label' | 'requireValues' | 'maxRows' | 'disabled' | 'submitLabel'> & { kind: KeyValueKind; entryDisabled: boolean; secret: boolean; nestedPath: boolean; fieldKey: string; fieldValue: string; transactional: boolean; submitBehavior: 'success' | 'field-error' | 'error' };
function KeyValuePlayground(args: PlaygroundArgs) {
 const [value, setValue] = useState<KeyValueEntry[]>([]);
 useEffect(() => setValue([{ id: 'example', key: args.fieldKey, value: args.fieldValue, kind: args.kind, disabled: args.entryDisabled, secret: args.secret, path: args.nestedPath ? ['workspace', args.fieldKey.toLowerCase()] : undefined, options: args.kind === 'select' ? [{ value: 'compact', label: '紧凑' }, { value: 'comfortable', label: '舒适' }] : undefined }]), [args.entryDisabled, args.fieldKey, args.fieldValue, args.kind, args.nestedPath, args.secret]);
 return <KeyValueEditor label={args.label} requireValues={args.requireValues} maxRows={args.maxRows} disabled={args.disabled} submitLabel={args.submitLabel} value={value} defaultValue={[{ id: 'example', key: 'WORKSPACE_NAME', value: 'Graphite' }]} onValueChange={setValue} onSubmit={args.transactional ? async () => args.submitBehavior === 'error' ? { error: '示例提交失败，草稿已保留。' } : args.submitBehavior === 'field-error' ? { entryErrors: { example: { value: '示例字段错误' } } } : undefined : undefined} />;
}
export const Playground: StoryObj<PlaygroundArgs> = {
 name: '参数调试', args: { label: '键值配置', requireValues: false, maxRows: 5, disabled: false, submitLabel: '应用配置', kind: 'text', entryDisabled: false, secret: false, nestedPath: false, fieldKey: 'WORKSPACE_NAME', fieldValue: 'Graphite', transactional: true, submitBehavior: 'success' },
 argTypes: { label: textControl, requireValues: booleanControl, maxRows: rangeControl(1, 10), disabled: booleanControl, submitLabel: textControl, kind: recipeControl(choiceControl(['text', 'number', 'boolean', 'select', 'date']), 'value[0].kind'), entryDisabled: recipeControl(booleanControl, 'value[0].disabled'), secret: recipeControl(booleanControl, 'value[0].secret'), nestedPath: recipeControl(booleanControl, 'value[0].path'), fieldKey: recipeControl(textControl, 'value[0].key'), fieldValue: recipeControl(textControl, 'value[0].value'), transactional: recipeControl(booleanControl, '启用提交、取消与重置。'), submitBehavior: recipeControl(choiceControl(['success', 'field-error', 'error']), 'onSubmit 返回结果。') },
 parameters: { controls: { include: ['kind', 'entryDisabled', 'secret', 'nestedPath', 'transactional', 'submitBehavior', 'fieldKey', 'fieldValue', 'requireValues', 'maxRows', 'disabled', 'label', 'submitLabel'] } }, render: args => <KeyValuePlayground {...args} />,
};
