import { useArgs } from 'storybook/preview-api';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ImageGallery, type ImageGalleryItem } from '../../../../packages/ui/src/basic/image-gallery.js';
import { galleryDemoItems, ImageGalleryDemo } from '../../../../packages/ui/src/basic/catalog.js';
import { booleanControl, choiceControl, rangeControl, recipeControl, textControl } from '../feature-controls.js';

const meta = { id: "基础-imagegallery-图片画廊",
  title: "基础/ImageGallery 图片画廊", component: ImageGalleryDemo,
  parameters: { docs: { story: { inline: false, height: 'var(--rui-container-xl)' }, description: { component: '独立图片画廊，支持受控活动项、缩略图、模态放大、前后导航、加载/失败/重试、键盘和焦点恢复；查看层提供有界缩放、拖动、旋转、翻转、浏览器全屏与显式下载回调。' } } },
} satisfies Meta<typeof ImageGalleryDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: "交互 · 打开、导航与关闭", render: () => <ImageGalleryDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: /放大预览/ });
    await userEvent.click(trigger);
    const dialog = await body.findByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: '下一张' }));
    await expect(within(dialog).getByRole('status')).toHaveTextContent('2 / 3');
    await userEvent.keyboard('{ArrowRight}');
    await expect(within(dialog).getByRole('status')).toHaveTextContent('3 / 3');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const Single: Story = { name: "单张预览", render: () => <ImageGallery items={[galleryDemoItems[0]!]} /> };
export const Empty: Story = { name: "状态 · 空内容", render: () => <ImageGallery items={[]} emptyLabel="当前没有图片" /> };
export const Loading: Story = { name: "状态 · 加载中", render: () => <ImageGallery items={[{ ...galleryDemoItems[0]!, status: 'loading' }]} /> };
export const ErrorState: Story = { name: "失败与重试", render: function ErrorGallery() { const item: ImageGalleryItem = { ...galleryDemoItems[0]!, status: 'error', error: '本地图像解码失败' }; return <ImageGallery items={[item]} onRetry={() => {}} />; } };
export const WithoutThumbnails: Story = { name: "隐藏缩略图", render: () => <ImageGallery items={galleryDemoItems} showThumbnails={false} /> };
export const Loop: Story = { name: "循环导航", render: () => <ImageGallery items={galleryDemoItems} loop defaultPreviewOpen /> };
export const Disabled: Story = { name: "禁用预览", render: () => <ImageGallery items={galleryDemoItems} disabled /> };
export const Narrow: Story = { name: "窄工作面", render: () => <div className="max-w-80"><ImageGallery items={galleryDemoItems} /></div> };

function ViewerExample({ download = false, tools = true }: { download?: boolean; tools?: boolean }) {
  const [latest, setLatest] = useState('视图为初始状态');
  return <div className="space-y-[var(--rui-content-gap)]"><ImageGallery items={galleryDemoItems} defaultPreviewOpen viewerTools={tools} minZoom={0.5} maxZoom={3} zoomStep={0.5} onTransformChange={transform => setLatest(`${Math.round(transform.scale * 100)}% / ${transform.rotation}°`)} onDownload={download ? item => setLatest(`请求下载 ${item.title}`) : undefined} /><p data-testid="viewer-event" className="text-xs text-muted-foreground">{latest}</p></div>;
}
export const ViewerTools: Story = { name: "查看器变换工具", render: () => <ViewerExample /> };
export const DownloadAction: Story = { name: "显式下载回调", render: () => <ViewerExample download /> };
export const ToolsHidden: Story = { name: "隐藏查看工具", render: () => <ViewerExample tools={false} /> };

type PlaygroundArgs = { activeId: string; previewOpen: boolean; showThumbnails: boolean; loop: boolean; viewerTools: boolean; minZoom: number; maxZoom: number; zoomStep: number; downloadAction: boolean; disabled: boolean; label: string };
export const Playground: StoryObj<PlaygroundArgs> = {
  name: "参数调试", args: { activeId: galleryDemoItems[0]!.id, previewOpen: false, showThumbnails: true, loop: false, viewerTools: true, minZoom: 0.5, maxZoom: 4, zoomStep: 0.25, downloadAction: false, disabled: false, label: '图片画廊' },
  argTypes: { activeId: recipeControl(choiceControl(galleryDemoItems.map(item => item.id)), 'activeId'), previewOpen: recipeControl(booleanControl, 'previewOpen'), showThumbnails: booleanControl, loop: booleanControl, viewerTools: booleanControl, minZoom: rangeControl(0.25, 1, 0.25), maxZoom: rangeControl(1, 8, 0.25), zoomStep: rangeControl(0.1, 1, 0.05), downloadAction: recipeControl(booleanControl, '提供 onDownload 回调。'), disabled: booleanControl, label: textControl },
  parameters: { controls: { include: ['activeId', 'previewOpen', 'showThumbnails', 'loop', 'viewerTools', 'minZoom', 'maxZoom', 'zoomStep', 'downloadAction', 'disabled', 'label'] } },
  render: function PlaygroundRender({ downloadAction, ...args }) { const [, updateArgs] = useArgs<PlaygroundArgs>(); return <ImageGallery {...args} items={galleryDemoItems} onActiveChange={id => updateArgs({ activeId: id })} onPreviewOpenChange={previewOpen => updateArgs({ previewOpen })} onDownload={downloadAction ? () => {} : undefined} />; },
};
