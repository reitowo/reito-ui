import { useArgs } from 'storybook/preview-api';
import { textControl, booleanControl, choiceControl, recipeControl } from '../feature-controls.js';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { act, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { PropertyList, type PropertyItem } from '../../../../packages/ui/src/complex/index.js';
import { PropertyListDemo } from '../../../../packages/ui/src/complex/catalog.js';
const meta = { title: '复杂/PropertyList 属性编辑', component: PropertyListDemo, parameters: { docs: { description: { component: '逐字段编辑器，支持数字解析、自定义验证、只读与 Escape 取消。确认中文输入法候选不会触发表单保存。' } } } } satisfies Meta<typeof PropertyListDemo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Interactive: Story = {
  name: '交互场景：校验、保存与取消',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: '编辑保留天数' }));
    const input = canvas.getByRole('spinbutton', { name: '保留天数' });
    await userEvent.clear(input); await userEvent.type(input, '500');
    await userEvent.click(canvas.getByRole('button', { name: '保存' }));
    expect(canvas.getByRole('alert')).toHaveTextContent('请输入 1 至 365 的整数');
    await userEvent.clear(input); await userEvent.type(input, '60');
    await userEvent.click(canvas.getByRole('button', { name: '保存' }));
    expect(canvas.getByText('60', { exact: true })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: '编辑工作区名称' }));
    await userEvent.clear(canvas.getByRole('textbox', { name: '工作区名称' }));
    await userEvent.type(canvas.getByRole('textbox', { name: '工作区名称' }), '未保存名称');
    // Development React needs act for the unmount; production React omits that API.
    const cancel = async () => { await userEvent.keyboard('{Escape}'); };
    if (typeof act === 'function') await act(cancel);
    else await cancel();
    await waitFor(() => expect(canvas.getByText('Graphite 工作区', { exact: true })).toBeVisible());
    await waitFor(() => expect(canvas.getByRole('button', { name: '编辑工作区名称' })).toHaveFocus());
    expect(canvas.queryByRole('button', { name: '编辑工作区 ID' })).not.toBeInTheDocument();
  },
};
export const Disabled: Story = { name: '全部禁用', render: () => <PropertyList items={[{ key: 'name', label: '名称', value: '只读快照' }]} onValueChange={() => {}} disabled /> };

function PropertyExample({ initial }: { initial: PropertyItem[] }) { const [items, setItems] = useState(initial); return <PropertyList items={items} onValueChange={(key, value) => setItems(previous => previous.map(item => item.key === key ? { ...item, value } : item))} />; }
export const Default: Story = { name: '文本属性', render: () => <PropertyExample initial={[{ key: 'name', label: '工作区名称', value: 'Graphite 工作区' }]} /> };
export const NumberProperty: Story = { name: '数字属性', render: () => <PropertyExample initial={[{ key: 'retention', label: '保留天数', value: 30, kind: 'number', description: '以天为单位' }]} /> };
export const ReadOnly: Story = { name: '只读属性', render: () => <PropertyList items={[{ key: 'id', label: '工作区 ID', value: 'workspace-local-01', readOnly: true }]} onValueChange={() => {}} /> };

type PlaygroundArgs = { label: string; disabled: boolean; fieldLabel: string; fieldValue: string; kind: 'text' | 'number'; readOnly: boolean; description: string };
export const Playground: StoryObj<PlaygroundArgs> = {
 name: '参数调试', args: { label: '属性', disabled: false, fieldLabel: '工作区名称', fieldValue: 'Graphite 工作区', kind: 'text', readOnly: false, description: '' },
 argTypes: { label: textControl, disabled: booleanControl, fieldLabel: recipeControl(textControl, 'items[0].label'), fieldValue: recipeControl(textControl, 'items[0].value；number 模式解析为有限数字，无效值回退为 0。'), kind: recipeControl(choiceControl(['text', 'number']), 'items[0].kind'), readOnly: recipeControl(booleanControl, 'items[0].readOnly'), description: recipeControl(textControl, 'items[0].description') },
 parameters: { controls: { include: ['kind', 'readOnly', 'disabled', 'fieldLabel', 'fieldValue', 'description', 'label'] } },
 render: function PlaygroundRender(args) { const [, updateArgs] = useArgs(); const value = args.kind === 'number' ? (Number.isFinite(Number(args.fieldValue)) ? Number(args.fieldValue) : 0) : args.fieldValue; return <PropertyList label={args.label} disabled={args.disabled} items={[{ key: 'example', label: args.fieldLabel, value, kind: args.kind, readOnly: args.readOnly, description: args.description }]} onValueChange={(_, value) => updateArgs({ fieldValue: String(value) })} />; },
};
