import type { ComponentProps } from 'react';
import { useArgs } from 'storybook/preview-api';
import { textControl, booleanControl, choiceControl, recipeControl } from '../feature-controls.js';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { DisclosureTree } from '../../../../packages/ui/src/complex/index.js';
import { DisclosureTreeDemo, demoNodes } from '../../../../packages/ui/src/complex/catalog.js';
const meta = { title: '复杂/DisclosureTree 目录导航', component: DisclosureTreeDemo, parameters: { docs: { description: { component: '原生 details/summary 折叠目录。Tab 逐项移动，Enter/Space 展开目录；叶节点支持受控选中与禁用。它不是具有方向键模型的 ARIA tree。' } } } } satisfies Meta<typeof DisclosureTreeDemo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Interactive: Story = {
  name: '交互场景：嵌套目录与受控选择',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const src = canvas.getByText('src').closest('summary')!;
    // user-event does not emulate native summary keyboard activation; browser-level checks cover it.
    await userEvent.click(src);
    await waitFor(() => expect(src.parentElement).not.toHaveAttribute('open'));
    await expect(canvas.getByText('button.tsx').closest('button')).not.toBeVisible();
    await userEvent.click(src);
    await waitFor(() => expect(src.parentElement).toHaveAttribute('open'));
    const input = canvas.getByRole('button', { name: 'input.tsx' });
    input.focus();
    await userEvent.keyboard('{Enter}');
    await expect(input).toHaveAttribute('aria-pressed', 'true');
    await expect(canvas.getByRole('status')).toHaveTextContent('当前选择：input');
    await expect(canvas.getByRole('button', { name: 'private.tsx' })).toBeDisabled();
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'App.tsx' })).toHaveFocus();
    const docs = canvas.getByText('docs').closest('summary')!;
    await userEvent.click(docs);
    await waitFor(() => expect(docs.parentElement).toHaveAttribute('open'));
    await expect(canvas.getByRole('button', { name: '使用指南.md' })).toBeVisible();
  },
};
export const Empty: Story = { name: '空目录', render: () => <DisclosureTree nodes={[]} /> };

const longFolder = '特别长的本地组件目录workspace-components';
const longFile = '特别长的工作区文件名称WorkspaceConfiguration.settings.tsx';
const description = '完整文件说明保留给需要查看详情的人';
export const Narrow: Story = {
  name: '窄目录与完整名称',
  render: () => <div className="w-52 max-w-full"><DisclosureTree defaultExpanded={['src', 'folder']} nodes={[{ id: 'src', label: 'src', children: [{ id: 'folder', label: longFolder, children: [{ id: 'long', label: longFile, description }, { id: 'disabled', label: 'private.tsx', disabled: true }] }] }]} /></div>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tree = canvas.getByRole('navigation', { name: '文件目录' });
    const file = canvas.getByRole('button', { name: `${longFile} ${description}` });
    const label = canvas.getByText(longFile);
    const folder = canvas.getByText(longFolder);
    await expect(label.scrollWidth).toBeGreaterThan(label.clientWidth);
    await expect(folder.scrollWidth).toBeGreaterThan(folder.clientWidth);
    await expect(label.closest('[title]')?.getAttribute('title')).toContain(longFile);
    await expect(folder.closest('[title]')?.getAttribute('title')).toContain(longFolder);
    await expect(tree.scrollWidth).toBeLessThanOrEqual(tree.clientWidth + 1);
    await expect(file.getBoundingClientRect().right).toBeLessThanOrEqual(tree.getBoundingClientRect().right);
    file.focus();
    await userEvent.keyboard(' ');
    await expect(file).toHaveAttribute('aria-pressed', 'true');
    await expect(canvas.getByRole('button', { name: 'private.tsx' })).toBeDisabled();
  },
};

export const Default: Story = { name: '默认折叠目录', render: () => <DisclosureTree nodes={demoNodes} /> };
export const Expanded: Story = { name: '展开目录', render: () => <DisclosureTree nodes={demoNodes} defaultExpanded={['src', 'components']} /> };
export const Selected: Story = { name: '选中文件', render: () => <DisclosureTree nodes={[{ id: 'readme', label: 'README.md', description: '项目入口与本地运行说明' }]} value="readme" /> };
export const Disabled: Story = { name: '禁用文件', render: () => <DisclosureTree nodes={[{ id: 'private', label: 'private.tsx', disabled: true }]} /> };

type PlaygroundArgs = Pick<ComponentProps<typeof DisclosureTree>, 'value' | 'label' | 'emptyMessage'> & { empty: boolean };
export const Playground: StoryObj<PlaygroundArgs> = {
 name: '参数调试', args: { value: 'button', label: '文件目录', emptyMessage: '目录为空', empty: false },
 argTypes: { value: choiceControl(['button', 'input', 'app', 'readme', 'guide', 'tokens']), label: textControl, emptyMessage: textControl, empty: recipeControl(booleanControl, '传入空 nodes。目录展开由原生 details 自身管理。') },
 parameters: { controls: { include: ['value', 'label', 'emptyMessage', 'empty'] } },
 render: function PlaygroundRender(args) { const [, updateArgs] = useArgs(); const { empty, ...props } = args; return <DisclosureTree {...props} nodes={empty ? [] : demoNodes} defaultExpanded={['src', 'components', 'docs']} onValueChange={value => updateArgs({ value })} />; },
};
