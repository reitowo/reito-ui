import { useArgs } from 'storybook/preview-api';
import { textControl, booleanControl, choiceControl, recipeControl } from '../feature-controls.js';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { AttachmentList } from '../../../../packages/ui/src/ai/context.js';
import { AttachmentListDemo } from '../../../../packages/ui/src/ai/catalog.js';
import { StoryFrame } from './story-frame.js';

const meta = { title: 'AI/AttachmentList', component: AttachmentList, args: { items: [{ id: 'guide', name: 'design-language.md', sizeLabel: '12 KB', status: 'ready' }] }, decorators: [Story => <StoryFrame><Story /></StoryFrame>] } satisfies Meta<typeof AttachmentList>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Guidelines: Story = { name: '文件已就绪',};
export const Processing: Story = { name: '处理中', args: { items: [{ id: 'image', name: 'workspace-preview.png', kind: 'image', status: 'uploading' }] } };
export const Error: Story = { name: '处理失败', args: { items: [{ id: 'image', name: 'workspace-preview.png', kind: 'image', status: 'error', error: '本地状态示例：附件无法处理' }] } };
export const Empty: Story = { name: '没有附件', args: { items: [] } };
export const RetryAndRemove: Story = { name: '交互场景：重试与移除', render: () => <AttachmentListDemo />, play: async ({ canvasElement }) => { const canvas = within(canvasElement); await userEvent.click(canvas.getByRole('button', { name: '重试workspace-preview.png' })); await expect(canvas.getByText('48 KB')).toBeVisible(); await expect(canvas.queryByRole('button', { name: '重试workspace-preview.png' })).not.toBeInTheDocument(); await userEvent.click(canvas.getByRole('button', { name: '移除附件workspace-preview.png' })); await userEvent.click(canvas.getByRole('button', { name: '移除附件design-language.md' })); await expect(canvas.getByText('没有附件')).toBeVisible(); await userEvent.click(canvas.getByRole('button', { name: '重置示例附件' })); await expect(canvas.getByRole('list', { name: '附件' })).toBeVisible(); } };

export const ImageReady: Story = { name: '图片已就绪', args: { items: [{ id: 'image', name: 'workspace-preview.png', kind: 'image', sizeLabel: '48 KB', status: 'ready' }] } };
export const Removable: Story = { name: '可移除附件', args: { onRemove: fn() } };

type PlaygroundArgs = { itemName: string; itemStatus: 'ready' | 'uploading' | 'error'; itemKind: 'file' | 'image'; sizeLabel: string; itemError: string; empty: boolean; removable: boolean; emptyLabel: string };
export const Playground: StoryObj<PlaygroundArgs> = {
 name: '参数调试', args: { itemName: 'design-language.md', itemStatus: 'ready', itemKind: 'file', sizeLabel: '12 KB', itemError: '本地状态示例：附件无法处理。', empty: false, removable: true, emptyLabel: '没有附件' },
 argTypes: { itemName: recipeControl(textControl, 'items[0].name'), itemStatus: recipeControl(choiceControl(['ready', 'uploading', 'error']), 'items[0].status'), itemKind: recipeControl(choiceControl(['file', 'image']), 'items[0].kind'), sizeLabel: recipeControl(textControl, 'items[0].sizeLabel'), itemError: recipeControl(textControl, 'items[0].error'), empty: recipeControl(booleanControl, '传入空 items。'), removable: recipeControl(booleanControl, '提供 onRemove 回调。'), emptyLabel: textControl },
 parameters: { controls: { include: ['itemStatus', 'itemKind', 'itemName', 'sizeLabel', 'itemError', 'removable', 'empty', 'emptyLabel'] } },
 render: function PlaygroundRender(args) { const [, updateArgs] = useArgs(); return <AttachmentList items={args.empty ? [] : [{ id: 'example', name: args.itemName, kind: args.itemKind, status: args.itemStatus, sizeLabel: args.sizeLabel, error: args.itemError }]} emptyLabel={args.emptyLabel} onRemove={args.removable ? () => updateArgs({ empty: true }) : undefined} onRetry={() => updateArgs({ itemStatus: 'ready' })} />; },
};
