import type { ComponentProps } from 'react';
import { useArgs } from 'storybook/preview-api';
import { textControl, booleanControl, choiceControl, recipeControl } from '../feature-controls.js';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { DiffViewer } from '../../../../packages/ui/src/complex/diff-viewer.js';
import { DiffViewerDemo, demoDiffHunks } from '../../../../packages/ui/src/complex/catalog.js';

const meta = {
  title: '复杂/DiffViewer 差异查看', component: DiffViewerDemo,
  parameters: { docs: { description: { component: '传入显式 hunks/rows、前后行号及文本。宿主决定行配对；组件不运行 diff 算法、不执行代码。修改用新增/删除文字语义和符号共同表达。' } } },
} satisfies Meta<typeof DiffViewerDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
  name: '交互场景：统一、并排与换行',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole('table')).toHaveAccessibleName('统一差异：修改前与修改后');
    expect(canvas.getAllByText('新增行')).toHaveLength(2);
    expect(canvas.getAllByText('删除行')).toHaveLength(2);
    await userEvent.click(canvas.getByRole('button', { name: '并排视图' }));
    expect(canvas.getByRole('table')).toHaveAccessibleName('并排差异：修改前与修改后');
    expect(canvas.getByText('density: "compact",')).toBeInTheDocument();
    expect(canvas.getByText('legacyToolbar: true,')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: '自动换行' }));
    expect(canvas.getByRole('button', { name: '自动换行' })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(canvas.getByRole('button', { name: '统一视图' }));
    expect(canvas.getByRole('table')).toHaveAccessibleName('统一差异：修改前与修改后');
  },
};
export const Empty: Story = { name: '无文本差异', render: () => <DiffViewer filename="unchanged.ts" hunks={[]} /> };
export const Binary: Story = { name: '二进制文件', render: () => <DiffViewer filename="preview.png" hunks={[]} binary /> };
export const Error: Story = { name: '加载错误', render: () => <DiffViewer filename="workspace.ts" hunks={[]} error="未能读取差异数据，请检查宿主提供的内容。" /> };
export const LongLines: Story = {
  name: '长行局部滚动',
  render: () => <DiffViewer filename="config.json" hunks={[{ id: 'long', header: '@@ -1 +1 @@', rows: [{
    id: 'configuration', kind: 'change',
    before: { lineNumber: 1, text: JSON.stringify({ description: '原有工作区配置'.repeat(24) }) },
    after: { lineNumber: 1, text: JSON.stringify({ description: '新增可读的共享配置'.repeat(28) }) },
  }] }]} />,
};

export const Default: Story = { name: '统一视图', render: () => <DiffViewer filename="workspace.ts" hunks={demoDiffHunks} defaultView="unified" /> };
export const Split: Story = { name: '并排视图', render: () => <DiffViewer filename="workspace.ts" hunks={demoDiffHunks} defaultView="split" /> };
export const Wrapped: Story = { name: '自动换行', render: () => <DiffViewer filename="config.json" defaultWrap hunks={[{ id: 'long', header: '@@ -1 +1 @@', rows: [{ id: 'configuration', kind: 'change', before: { lineNumber: 1, text: JSON.stringify({ description: '原有工作区配置'.repeat(24) }) }, after: { lineNumber: 1, text: JSON.stringify({ description: '新增可读的共享配置'.repeat(28) }) } }] }]} /> };

type PlaygroundArgs = Pick<ComponentProps<typeof DiffViewer>, 'view' | 'defaultWrap' | 'binary' | 'filename' | 'beforeLabel' | 'afterLabel' | 'error'> & { empty: boolean };
export const Playground: StoryObj<PlaygroundArgs> = {
 name: '参数调试', args: { view: 'unified', defaultWrap: false, binary: false, filename: 'workspace.ts', beforeLabel: '修改前', afterLabel: '修改后', error: '', empty: false },
 argTypes: { view: choiceControl(['unified', 'split']), defaultWrap: { ...booleanControl, description: '初始换行状态；修改时重建此示例。工具栏的换行仍由组件内部管理。' }, binary: booleanControl, filename: textControl, beforeLabel: textControl, afterLabel: textControl, error: textControl, empty: recipeControl(booleanControl, '传入空 hunks。') },
 parameters: { controls: { include: ['view', 'defaultWrap', 'binary', 'filename', 'beforeLabel', 'afterLabel', 'error', 'empty'] } },
 render: function PlaygroundRender(args) { const [, updateArgs] = useArgs(); const { empty, ...props } = args; return <DiffViewer key={String(args.defaultWrap)} {...props} hunks={empty ? [] : demoDiffHunks} onViewChange={view => updateArgs({ view })} onRetry={() => updateArgs({ error: '' })} />; },
};
