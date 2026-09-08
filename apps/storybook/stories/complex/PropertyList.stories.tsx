import { useArgs } from 'storybook/preview-api';
import { textControl, booleanControl, choiceControl, recipeControl } from '../feature-controls.js';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { PropertyList, type PropertyChange, type PropertyItem, type PropertyKind, type PropertyValue } from '../../../../packages/ui/src/complex/index.js';
import { PropertyListDemo } from '../../../../packages/ui/src/complex/catalog.js';
const meta = { title: '复杂/PropertyList 属性编辑', component: PropertyListDemo, parameters: { docs: { description: { component: '逐字段编辑器，支持文本、数字、布尔、选项和日期适配，嵌套路径、草稿通知、自定义验证、逐项只读/禁用与 Escape 取消。确认中文输入法候选不会触发表单保存。' } } } } satisfies Meta<typeof PropertyListDemo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Interactive: Story = {
  name: '交互场景：校验与保存',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '编辑保留天数' }));
    const input = canvas.getByRole('spinbutton', { name: '保留天数' });
    await userEvent.clear(input); await userEvent.type(input, '500');
    await userEvent.click(canvas.getByRole('button', { name: '保存字段' }));
    expect(canvas.getByRole('alert')).toHaveTextContent('不能大于 365');
    await userEvent.clear(input); await userEvent.type(input, '60');
    await userEvent.click(canvas.getByRole('button', { name: '保存字段' }));
    expect(canvas.getByText('60', { exact: true })).toBeInTheDocument();
    expect(canvas.queryByRole('button', { name: '编辑工作区 ID' })).not.toBeInTheDocument();
  },
};
export const Disabled: Story = { name: '全部禁用', render: () => <PropertyList items={[{ key: 'name', label: '名称', value: '只读快照' }]} onValueChange={() => {}} disabled /> };

function PropertyExample({ initial }: { initial: PropertyItem[] }) { const [items, setItems] = useState(initial); return <PropertyList items={items} onValueChange={(key, value) => setItems(previous => previous.map(item => item.key === key ? { ...item, value } : item))} />; }
export const Default: Story = { name: '文本属性', render: () => <PropertyExample initial={[{ key: 'name', label: '工作区名称', value: 'Graphite 工作区' }]} /> };
export const NumberProperty: Story = { name: '数字属性', render: () => <PropertyExample initial={[{ key: 'retention', label: '保留天数', value: 30, kind: 'number', description: '以天为单位' }]} /> };
export const ReadOnly: Story = { name: '只读属性', render: () => <PropertyList items={[{ key: 'id', label: '工作区 ID', value: 'workspace-local-01', readOnly: true }]} onValueChange={() => {}} /> };

export const BooleanProperty: Story = { name: '布尔属性', render: () => <PropertyExample initial={[{ key: 'autosave', label: '自动保存', value: true, kind: 'boolean', trueLabel: '已启用', falseLabel: '已关闭' }]} /> };
export const SelectProperty: Story = { name: '选项属性', render: () => <PropertyExample initial={[{ key: 'density', label: '界面密度', value: 'compact', kind: 'select', options: [{ value: 'compact', label: '紧凑' }, { value: 'comfortable', label: '舒适' }] }]} /> };
export const DateProperty: Story = { name: '日期属性', render: () => <PropertyExample initial={[{ key: 'archiveDate', label: '归档日期', value: '2026-09-30', kind: 'date', min: '2026-09-01', max: '2026-12-31' }]} /> };

function NestedExample() {
  const [values, setValues] = useState<Record<string, PropertyValue>>({ fontSize: 14, wordWrap: true, theme: 'graphite' });
  const [event, setEvent] = useState('尚未修改');
  const items: PropertyItem[] = [
    { key: 'fontSize', path: ['editor', 'appearance', 'fontSize'], label: '字号', value: values.fontSize, kind: 'number', min: 10, max: 24, step: 1 },
    { key: 'wordWrap', path: ['editor', 'layout', 'wordWrap'], label: '自动换行', value: values.wordWrap, kind: 'boolean' },
    { key: 'theme', path: ['editor', 'appearance', 'theme'], label: '主题', value: values.theme, kind: 'select', options: [{ value: 'graphite', label: 'Graphite' }, { value: 'paper', label: 'Paper' }] },
  ];
  return <div className="space-y-[var(--rui-content-gap)]"><PropertyList items={items} onDraftValueChange={(_key, draft, path) => setEvent(`草稿 ${path.join('.')} = ${String(draft)}`)} onValueChange={(key, value, path) => { setValues(previous => ({ ...previous, [key]: value })); setEvent(`已保存 ${path.join('.')} = ${String(value)}`); }} /><p role="status" className="text-xs text-muted-foreground">{event}</p></div>;
}

export const NestedPaths: Story = { name: '嵌套路径与草稿更新', render: () => <NestedExample /> };
export const PerItemDisabled: Story = { name: '逐项禁用', render: () => <PropertyList items={[{ key: 'editable', label: '可编辑属性', value: '本地值' }, { key: 'locked', label: '禁用属性', value: '由策略管理', disabled: true }, { key: 'fixed', label: '只读属性', value: '不可编辑', readOnly: true }]} onValueChange={() => {}} /> };
export const Narrow: Story = { name: '窄宽度', render: () => <div className="max-w-80"><NestedExample /></div> };

function TransactionExample({ failure = false }: { failure?: boolean }) {
  const [values, setValues] = useState<Record<string, PropertyValue>>({ name: 'Graphite 工作区', retention: 30, autosave: true });
  const [receipt, setReceipt] = useState('尚未提交');
  const items: PropertyItem[] = [
    { key: 'name', label: '工作区名称', value: values.name, defaultValue: '个人工作区' },
    { key: 'retention', label: '保留天数', value: values.retention, defaultValue: 14, kind: 'number', min: 1, max: 365, description: '自动保存开启时至少保留 7 天' },
    { key: 'autosave', label: '自动保存', value: values.autosave, defaultValue: true, kind: 'boolean' },
  ];
  function applyChanges(changes: PropertyChange[]) {
    setValues(previous => Object.fromEntries(Object.entries(previous).map(([key, value]) => [key, changes.find(change => change.key === key)?.value ?? value])));
  }
  return <div className="space-y-[var(--rui-content-gap)]">
    <PropertyList
      items={items}
      onValueChange={(key, value) => setValues(previous => ({ ...previous, [key]: value }))}
      onBatchValueChange={applyChanges}
      validateAll={async current => {
        await new Promise(resolve => setTimeout(resolve, 40));
        return current.autosave && Number(current.retention) < 7 ? { retention: '自动保存开启时至少保留 7 天' } : {};
      }}
      onSubmit={async current => {
        await new Promise(resolve => setTimeout(resolve, 60));
        if (failure) throw new Error('本地设置服务暂时不可用，草稿仍然保留。');
        if (current.name === '占用名称') return { fieldErrors: { name: '这个工作区名称已被占用' }, error: '请修正标记的属性。' };
        setReceipt(`已提交 ${String(current.name)} / ${String(current.retention)} 天`);
      }}
    />
    <p data-testid="property-receipt" className="text-xs text-muted-foreground">{receipt}</p>
  </div>;
}

export const Transactional: Story = { name: '批量事务与跨字段校验', render: () => <TransactionExample /> };
export const SubmitFailure: Story = { name: '提交失败并保留草稿', render: () => <TransactionExample failure /> };

type PlaygroundArgs = { label: string; disabled: boolean; fieldLabel: string; fieldValue: string; defaultValue: string; kind: PropertyKind; readOnly: boolean; itemDisabled: boolean; description: string; nestedPath: boolean; transactional: boolean; submitBehavior: 'success' | 'field-error' | 'error' };
export const Playground: StoryObj<PlaygroundArgs> = {
 name: '参数调试', args: { label: '属性', disabled: false, fieldLabel: '工作区名称', fieldValue: 'Graphite 工作区', defaultValue: '个人工作区', kind: 'text', readOnly: false, itemDisabled: false, description: '', nestedPath: false, transactional: false, submitBehavior: 'success' },
 argTypes: { label: textControl, disabled: booleanControl, fieldLabel: recipeControl(textControl, 'items[0].label'), fieldValue: recipeControl(textControl, 'items[0].value；number 与 boolean 模式会转换类型。'), defaultValue: recipeControl(textControl, 'items[0].defaultValue'), kind: recipeControl(choiceControl(['text', 'number', 'boolean', 'select', 'date']), 'items[0].kind'), readOnly: recipeControl(booleanControl, 'items[0].readOnly'), itemDisabled: recipeControl(booleanControl, 'items[0].disabled'), description: recipeControl(textControl, 'items[0].description'), nestedPath: recipeControl(booleanControl, 'items[0].path'), transactional: recipeControl(booleanControl, '启用列表级保存、取消与重置。'), submitBehavior: recipeControl(choiceControl(['success', 'field-error', 'error']), 'onSubmit 返回结果。') },
 parameters: { controls: { include: ['kind', 'readOnly', 'itemDisabled', 'disabled', 'nestedPath', 'transactional', 'submitBehavior', 'fieldLabel', 'fieldValue', 'defaultValue', 'description', 'label'] } },
 render: function PlaygroundRender(args) {
   const [, updateArgs] = useArgs();
   const value: PropertyValue = args.kind === 'number' ? (Number.isFinite(Number(args.fieldValue)) ? Number(args.fieldValue) : 0) : args.kind === 'boolean' ? args.fieldValue === 'true' : args.fieldValue;
   const defaultValue: PropertyValue = args.kind === 'number' ? Number(args.defaultValue) || 0 : args.kind === 'boolean' ? args.defaultValue === 'true' : args.defaultValue;
   return <PropertyList label={args.label} disabled={args.disabled} items={[{ key: 'example', path: args.nestedPath ? ['workspace', 'example'] : undefined, label: args.fieldLabel, value, defaultValue, kind: args.kind, readOnly: args.readOnly, disabled: args.itemDisabled, description: args.description, options: args.kind === 'select' ? [{ value: 'compact', label: '紧凑' }, { value: 'comfortable', label: '舒适' }] : undefined }]} onValueChange={(_, next) => updateArgs({ fieldValue: String(next) })} onBatchValueChange={changes => updateArgs({ fieldValue: String(changes[0]?.value ?? value) })} onSubmit={args.transactional ? async () => args.submitBehavior === 'error' ? { error: '示例提交失败，草稿已保留。' } : args.submitBehavior === 'field-error' ? { fieldErrors: { example: '示例字段错误' } } : undefined : undefined} />;
 },
};
