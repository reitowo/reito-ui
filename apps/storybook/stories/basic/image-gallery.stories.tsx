import { useArgs } from 'storybook/preview-api';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ImageGallery, type ImageGalleryItem } from '../../../../packages/ui/src/basic/image-gallery.js';
import { galleryDemoItems, ImageGalleryDemo } from '../../../../packages/ui/src/basic/catalog.js';
import { booleanControl, choiceControl, recipeControl, textControl } from '../feature-controls.js';

const meta = {
  title: '基础/ImageGallery 图片画廊', component: ImageGalleryDemo,
  parameters: { docs: { story: { inline: false, height: 'var(--rui-container-xl)' }, description: { component: '独立图片画廊，支持受控活动项、缩略图、模态放大、前后导航、加载/失败/重试、键盘和焦点恢复。缩放、旋转、全屏与下载属于后续查看器能力。' } } },
} satisfies Meta<typeof ImageGalleryDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: '交互场景：打开、导航与关闭', render: () => <ImageGalleryDemo />,
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

export const Single: Story = { name: '单张预览', render: () => <ImageGallery items={[galleryDemoItems[0]!]} /> };
export const Empty: Story = { name: '空状态', render: () => <ImageGallery items={[]} emptyLabel="当前没有图片" /> };
export const Loading: Story = { name: '加载状态', render: () => <ImageGallery items={[{ ...galleryDemoItems[0]!, status: 'loading' }]} /> };
export const ErrorState: Story = { name: '失败与重试', render: function ErrorGallery() { const item: ImageGalleryItem = { ...galleryDemoItems[0]!, status: 'error', error: '本地图像解码失败' }; return <ImageGallery items={[item]} onRetry={() => {}} />; } };
export const WithoutThumbnails: Story = { name: '隐藏缩略图', render: () => <ImageGallery items={galleryDemoItems} showThumbnails={false} /> };
export const Loop: Story = { name: '循环导航', render: () => <ImageGallery items={galleryDemoItems} loop defaultPreviewOpen /> };
export const Disabled: Story = { name: '禁用预览', render: () => <ImageGallery items={galleryDemoItems} disabled /> };
export const Narrow: Story = { name: '窄工作面', render: () => <div className="max-w-80"><ImageGallery items={galleryDemoItems} /></div> };

type PlaygroundArgs = { activeId: string; previewOpen: boolean; showThumbnails: boolean; loop: boolean; disabled: boolean; label: string };
export const Playground: StoryObj<PlaygroundArgs> = {
  name: '参数调试', args: { activeId: galleryDemoItems[0]!.id, previewOpen: false, showThumbnails: true, loop: false, disabled: false, label: '图片画廊' },
  argTypes: { activeId: recipeControl(choiceControl(galleryDemoItems.map(item => item.id)), 'activeId'), previewOpen: recipeControl(booleanControl, 'previewOpen'), showThumbnails: booleanControl, loop: booleanControl, disabled: booleanControl, label: textControl },
  parameters: { controls: { include: ['activeId', 'previewOpen', 'showThumbnails', 'loop', 'disabled', 'label'] } },
  render: function PlaygroundRender(args) { const [, updateArgs] = useArgs<PlaygroundArgs>(); return <ImageGallery {...args} items={galleryDemoItems} onActiveChange={id => updateArgs({ activeId: id })} onPreviewOpenChange={previewOpen => updateArgs({ previewOpen })} />; },
};
