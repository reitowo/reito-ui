import { useArgs } from 'storybook/preview-api';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, within } from 'storybook/test';
import { ImageCompare, type ImageCompareSource } from '../../../../packages/ui/src/basic/image-compare.js';
import { galleryDemoItems, ImageCompareDemo } from '../../../../packages/ui/src/basic/catalog.js';
import { booleanControl, choiceControl, rangeControl, textControl } from '../feature-controls.js';

const meta = {
  title: '基础/ImageCompare 图像对比',
  component: ImageCompareDemo,
  parameters: { docs: { description: { component: '图像前后重叠对比，支持受控比例、横纵方向、原生 range 键盘、Pointer Events 拖动和独立加载/失败状态。' } } },
} satisfies Meta<typeof ImageCompareDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

const before: ImageCompareSource = { src: galleryDemoItems[0]!.src, alt: '调整前的山形工作区', label: '调整前' };
const after: ImageCompareSource = { src: galleryDemoItems[1]!.src, alt: '调整后的面板工作区', label: '调整后' };

export const Default: Story = { name: '默认横向对比', render: () => <ImageCompareDemo /> };
export const Overview: Story = {
  name: '交互场景：范围调整', render: () => <ImageCompare before={before} after={after} defaultPosition={50} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const slider = canvas.getByRole('slider', { name: '图像前后对比' });
    slider.focus();
    fireEvent.input(slider, { target: { value: '100' } });
    await expect(slider).toHaveValue('100');
    await expect(slider).toHaveAttribute('aria-valuetext', '调整前 100%，调整后 0%');
  },
};

function ControlledExample() {
  const [position, setPosition] = useState(35);
  return <div className="space-y-[var(--rui-content-gap)]"><ImageCompare before={before} after={after} position={position} onPositionChange={setPosition} /><p data-testid="compare-event" className="text-xs text-muted-foreground">对比比例：{Math.round(position)}%</p></div>;
}

function ErrorExample({ side }: { side: 'before' | 'after' | 'both' }) {
  const [latest, setLatest] = useState('尚未重试');
  const failedBefore = side === 'before' || side === 'both' ? { ...before, status: 'error' as const, error: '调整前图像解码失败' } : before;
  const failedAfter = side === 'after' || side === 'both' ? { ...after, status: 'error' as const, error: '调整后图像解码失败' } : after;
  return <div className="space-y-[var(--rui-content-gap)]"><ImageCompare before={failedBefore} after={failedAfter} onRetry={current => setLatest(`请求重试：${current === 'before' ? '调整前' : '调整后'}`)} /><p data-testid="retry-event" className="text-xs text-muted-foreground">{latest}</p></div>;
}

export const Controlled: Story = { name: '受控比例', render: () => <ControlledExample /> };
export const Vertical: Story = { name: '纵向对比', render: () => <ImageCompare before={before} after={after} orientation="vertical" aspectRatio={4 / 3} /> };
export const QuarterPosition: Story = { name: '25% 初始比例', render: () => <ImageCompare before={before} after={after} defaultPosition={25} /> };
export const Contain: Story = { name: '完整适配图像', render: () => <ImageCompare before={before} after={after} objectFit="contain" /> };
export const FineStep: Story = { name: '细粒度键盘步进', render: () => <ImageCompare before={before} after={after} step={0.5} /> };
export const LoadingBefore: Story = { name: '调整前加载中', render: () => <ImageCompare before={{ ...before, status: 'loading' }} after={after} /> };
export const LoadingAfter: Story = { name: '调整后加载中', render: () => <ImageCompare before={before} after={{ ...after, status: 'loading' }} /> };
export const ErrorBefore: Story = { name: '调整前失败', render: () => <ErrorExample side="before" /> };
export const ErrorAfter: Story = { name: '调整后失败', render: () => <ErrorExample side="after" /> };
export const BothErrors: Story = { name: '两侧均失败', render: () => <ErrorExample side="both" /> };
export const Disabled: Story = { name: '禁用调整', render: () => <ImageCompare before={before} after={after} disabled /> };
export const Narrow: Story = { name: '窄工作面', render: () => <div className="max-w-72"><ImageCompare before={before} after={after} /></div> };

type PlaygroundArgs = { position: number; orientation: 'horizontal' | 'vertical'; step: number; objectFit: 'cover' | 'contain'; aspectRatio: number; beforeLabel: string; afterLabel: string; disabled: boolean; label: string };
export const Playground: StoryObj<PlaygroundArgs> = {
  name: '参数调试',
  args: { position: 50, orientation: 'horizontal', step: 1, objectFit: 'cover', aspectRatio: 16 / 9, beforeLabel: '调整前', afterLabel: '调整后', disabled: false, label: '图像前后对比' },
  argTypes: { position: rangeControl(0, 100), orientation: choiceControl(['horizontal', 'vertical']), step: rangeControl(0.5, 10, 0.5), objectFit: choiceControl(['cover', 'contain']), aspectRatio: rangeControl(0.5, 2.5, 0.1), beforeLabel: textControl, afterLabel: textControl, disabled: booleanControl, label: textControl },
  parameters: { controls: { include: ['position', 'orientation', 'step', 'objectFit', 'aspectRatio', 'beforeLabel', 'afterLabel', 'disabled', 'label'] } },
  render: function PlaygroundRender(args) {
    const [, updateArgs] = useArgs<PlaygroundArgs>();
    return <ImageCompare before={before} after={after} {...args} onPositionChange={position => updateArgs({ position })} />;
  },
};
