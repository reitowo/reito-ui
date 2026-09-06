import type { ComponentProps } from 'react';
import { useArgs } from 'storybook/preview-api';
import { textControl, booleanControl, recipeControl } from '../feature-controls.js';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, userEvent, within } from 'storybook/test';
import { CommandSearch } from '../../../../packages/ui/src/complex/index.js';
import { CommandSearchDemo, demoCommands } from '../../../../packages/ui/src/complex/catalog.js';
const meta = { title: '复杂/CommandSearch 命令搜索', component: CommandSearchDemo, parameters: { docs: { description: { component: 'cmdk 负责分组、关键词匹配、空态与方向键导航。组件阻止中文输入法候选确认误触执行；示例只展示选中结果，不启动外部程序。' } } } } satisfies Meta<typeof CommandSearchDemo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Interactive: Story = {
  name: '交互场景：搜索、空态、IME 与执行',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement); const input = canvas.getByRole('combobox', { name: '搜索命令' });
    await userEvent.type(input, 'zzzz-no-result');
    expect(canvas.getByText('没有找到匹配的命令')).toBeInTheDocument();
    await userEvent.clear(input); await userEvent.type(input, 'project');
    expect(canvas.getByRole('option', { name: /打开项目/ })).toBeInTheDocument();
    await fireEvent.compositionStart(input);
    await fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', isComposing: true });
    expect(canvas.getByRole('status')).toHaveTextContent('选择命令以预览结果');
    await fireEvent.compositionEnd(input);
    await userEvent.keyboard('{Enter}');
    expect(canvas.getByRole('status')).toHaveTextContent('已选择：打开项目（本地演示）');
  },
};
export const Empty: Story = { name: '无可用命令', render: () => <CommandSearch groups={[]} onSelect={() => {}} /> };
export const Loading: Story = { name: '加载中', render: () => <CommandSearch groups={[]} onSelect={() => {}} loading /> };

export const Default: Story = { name: '默认命令列表', render: () => <CommandSearch groups={demoCommands} onSelect={() => {}} /> };
export const NoMatches: Story = { name: '搜索没有结果', render: () => <CommandSearch groups={demoCommands} query="不存在的命令" onSelect={() => {}} /> };
export const DisabledCommand: Story = { name: '禁用命令', render: () => <CommandSearch groups={[{ id: 'local', label: '本地工具', commands: [{ id: 'terminal', label: '打开终端', description: '此示例中不可用', disabled: true }] }]} onSelect={() => {}} /> };

type PlaygroundArgs = Pick<ComponentProps<typeof CommandSearch>, 'query' | 'loading' | 'label' | 'placeholder' | 'emptyMessage'> & { empty: boolean; selectedCommand: string };
export const Playground: StoryObj<PlaygroundArgs> = {
 name: '参数调试', args: { query: '', loading: false, label: '搜索命令', placeholder: '搜索命令或关键词…', emptyMessage: '没有找到匹配的命令', empty: false, selectedCommand: '' },
 argTypes: { query: textControl, loading: booleanControl, label: textControl, placeholder: textControl, emptyMessage: textControl, empty: recipeControl(booleanControl, '传入空 groups。'), selectedCommand: recipeControl(textControl, '宿主收到 onSelect 后显示所选命令。') },
 parameters: { controls: { include: ['query', 'loading', 'label', 'placeholder', 'emptyMessage', 'empty', 'selectedCommand'] } },
 render: function PlaygroundRender(args) { const [, updateArgs] = useArgs(); return <div className="grid gap-3"><CommandSearch groups={args.empty ? [] : demoCommands} query={args.query} onQueryChange={query => updateArgs({ query })} loading={args.loading} label={args.label} placeholder={args.placeholder} emptyMessage={args.emptyMessage} onSelect={command => updateArgs({ selectedCommand: command.label })} /><p role="status" className="text-sm text-muted-foreground">{args.selectedCommand ? '本地已选择：' + args.selectedCommand : '本地命令展示，不执行外部操作。'}</p></div>; },
};
