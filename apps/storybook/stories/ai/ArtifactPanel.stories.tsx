import { useArgs } from 'storybook/preview-api';
import { textControl, choiceControl } from '../feature-controls.js';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { ArtifactPanel } from '../../../../packages/ui/src/ai/artifact.js';
import { ArtifactPanelDemo } from '../../../../packages/ui/src/ai/catalog.js';
import { StoryFrame } from './story-frame.js';

const meta = { title: 'AI/ArtifactPanel', component: ArtifactPanel, args: { title: 'workspace.ts', versions: [{ id: 'v1', label: '版本 1', status: 'ready', preview: <p className="text-sm">本地静态预览</p>, code: 'export const density = "compact";', language: 'typescript' }] }, decorators: [Story => <StoryFrame><Story /></StoryFrame>], parameters: { docs: { description: { component: '产物的版本、预览和代码组合。预览由调用方提供 ReactNode，组件不会运行任意源码，也不生成假 diff。' } } } } satisfies Meta<typeof ArtifactPanel>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Guidelines: Story = { name: '默认预览',};
export const Code: Story = { name: '代码视图', args: { view: 'code' } };
export const Error: Story = { name: '预览失败', args: { versions: [{ id: 'error', label: '草稿', status: 'error', error: '本地预览示例：缺少必填的工作区名称。' }] } };
export const Empty: Story = { name: '没有版本', args: { versions: [] } };
export const VersionsAndPreview: Story = { name: '交互场景：版本、编辑与关闭',
  render: () => <ArtifactPanelDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const document = within(canvasElement.ownerDocument.body);
    const name = canvas.getByRole('textbox', { name: '工作区名称' });
    await userEvent.clear(name);
    await userEvent.type(name, '桌面工作台');
    await userEvent.click(canvas.getByRole('button', { name: '保存本地预览' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('已保存：桌面工作台');
    await userEvent.click(canvas.getByRole('tab', { name: '代码' }));
    const source = canvas.getByLabelText('WorkspaceSettings.tsx代码');
    await expect(source).toBeVisible();
    await expect(source.textContent).toBe('export const workspace = { name: "桌面工作台" };');
    await expect(source.querySelector('code')).toHaveAttribute('data-highlighted', 'true');
    await expect(source.querySelector('.token.keyword')).toBeVisible();
    await userEvent.click(canvas.getByRole('combobox', { name: '产物版本' }));
    await userEvent.click(document.getByRole('option', { name: '版本 1' }));
    await expect(source.textContent).toBe('export const workspace = { name: "默认工作区" };');
    await expect(source.querySelector('.token.string')).toBeVisible();
    await userEvent.click(canvas.getByRole('tab', { name: '预览' }));
    await expect(canvas.getByText('初始版本：默认工作区')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: '关闭产物WorkspaceSettings.tsx' }));
    await expect(canvas.getByRole('button', { name: '打开产物示例' })).toBeVisible();
  },
};

export const Draft: Story = { name: '草稿预览', args: { versions: [{ id: 'draft', label: '草稿版本', status: 'draft', preview: <p className="text-sm">本地草稿预览，等待确认。</p>, code: 'export const draft = true;', language: 'typescript' }] } };
export const MissingPreview: Story = { name: '版本没有预览', args: { versions: [{ id: 'source', label: '仅源码', status: 'ready', code: 'export const density = "compact";', language: 'typescript' }] } };

export const Playground: Story = {
  name: '参数调试', args: { title: 'workspace.ts', view: 'preview', version: 'v1', versions: [{ id: 'v1', label: '版本 1', status: 'ready', preview: <p className="text-sm">本地静态预览 · 版本 1</p>, code: 'export const version = 1;', language: 'typescript' }, { id: 'v2', label: '版本 2', status: 'draft', preview: <p className="text-sm">本地草稿预览 · 版本 2</p>, code: 'export const version = 2;', language: 'typescript' }] },
  argTypes: { title: textControl, view: choiceControl(['preview', 'code']), version: choiceControl(['v1', 'v2']) },
  parameters: { controls: { include: ['view', 'version', 'title'] } },
  render: function PlaygroundRender(args) { const [, updateArgs] = useArgs(); return <ArtifactPanel {...args} onViewChange={view => updateArgs({ view })} onVersionChange={version => updateArgs({ version })} />; },
};
