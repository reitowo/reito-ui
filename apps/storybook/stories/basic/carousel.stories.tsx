import { useArgs } from 'storybook/preview-api';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Carousel } from '../../../../packages/ui/src/basic/carousel.js';
import { carouselDemoItems, CarouselDemo } from '../../../../packages/ui/src/basic/catalog.js';
import { Button } from '../../../../packages/ui/src/primitives/button.js';
import { booleanControl, rangeControl, recipeControl, textControl } from '../feature-controls.js';

const meta = { id: "基础-carousel-轮播",
  title: "基础/Carousel 轮播",
  component: CarouselDemo,
  parameters: { docs: { description: { component: '通用内容轮播，支持受控活动页、多项可见、前后按钮、页指示器、键盘、指针拖动、循环和可暂停自动播放。' } } },
} satisfies Meta<typeof CarouselDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

function Card({ item, action = false }: { item: (typeof carouselDemoItems)[number]; action?: boolean }) {
  return <article className="min-h-36 rounded-lg border border-border bg-card p-[var(--rui-content-padding)]">
    <p className="text-xs text-muted-foreground">步骤 {item.eyebrow}</p>
    <h3 className="mt-[var(--rui-space-2)] text-sm font-medium">{item.title}</h3>
    <p className="mt-[var(--rui-space-1)] text-xs leading-relaxed text-muted-foreground">{item.description}</p>
    {action && <Button className="mt-[var(--rui-content-gap-sm)]" variant="outline" size="xs">查看 {item.title}</Button>}
  </article>;
}

const itemProps = { items: carouselDemoItems, getItemId: (item: (typeof carouselDemoItems)[number]) => item.id, renderItem: (item: (typeof carouselDemoItems)[number]) => <Card item={item} />, label: '本地任务流程' };

export const Default: Story = { name: "默认轮播", render: () => <CarouselDemo /> };

export const Overview: Story = {
  name: "交互 · 按钮与指示器",
  render: () => <CarouselDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const carousel = canvas.getByRole('region', { name: '本地任务流程' });
    await userEvent.click(within(carousel).getByRole('button', { name: '下一页' }));
    await expect(within(carousel).getByRole('status')).toHaveTextContent('2 / 4');
    await userEvent.click(within(carousel).getByRole('button', { name: '转到第 4 页' }));
    await expect(within(carousel).getByRole('status')).toHaveTextContent('4 / 4');
  },
};

function ControlledExample() {
  const [index, setIndex] = useState(1);
  return <div className="space-y-[var(--rui-content-gap)]"><Carousel {...itemProps} activeIndex={index} onActiveIndexChange={setIndex} /><p data-testid="carousel-event" className="text-xs text-muted-foreground">活动项：{carouselDemoItems[index]?.title}</p></div>;
}

export const Controlled: Story = { name: "受控活动页", render: () => <ControlledExample /> };
export const MultipleVisible: Story = { name: "同时显示两项", render: () => <Carousel {...itemProps} itemsPerView={2} itemsPerMove={2} /> };
export const Looping: Story = { name: "首尾循环", render: () => <Carousel {...itemProps} loop /> };
export const Autoplay: Story = { name: "可暂停自动播放", render: () => <Carousel {...itemProps} autoplayInterval={800} loop /> };
export const PausedAutoplay: Story = { name: "自动播放初始暂停", render: () => <Carousel {...itemProps} autoplayInterval={800} loop defaultPaused /> };
export const WithoutControls: Story = { name: "隐藏前后按钮", render: () => <Carousel {...itemProps} showControls={false} /> };
export const WithoutIndicators: Story = { name: "隐藏页指示器", render: () => <Carousel {...itemProps} showIndicators={false} /> };
export const InteractiveContent: Story = { name: "幻灯片交互内容", render: () => <Carousel {...itemProps} renderItem={item => <Card item={item} action />} /> };
export const Single: Story = { name: "单项内容", render: () => <Carousel {...itemProps} items={carouselDemoItems.slice(0, 1)} /> };
export const Empty: Story = { name: "状态 · 空内容", render: () => <Carousel {...itemProps} items={[]} emptyLabel="当前没有轮播内容" /> };
export const Disabled: Story = { name: "禁用交互", render: () => <Carousel {...itemProps} disabled autoplayInterval={800} /> };
export const Narrow: Story = { name: "窄工作面", render: () => <div className="max-w-72"><Carousel {...itemProps} /></div> };

type PlaygroundArgs = { activeIndex: number; itemsPerView: number; itemsPerMove: number; loop: boolean; showControls: boolean; showIndicators: boolean; autoplayInterval: number; paused: boolean; disabled: boolean; label: string };
export const Playground: StoryObj<PlaygroundArgs> = {
  name: "参数调试",
  args: { activeIndex: 0, itemsPerView: 1, itemsPerMove: 1, loop: false, showControls: true, showIndicators: true, autoplayInterval: 0, paused: false, disabled: false, label: '本地任务流程' },
  argTypes: {
    activeIndex: recipeControl(rangeControl(0, carouselDemoItems.length - 1), '受控首个可见项；会归一到最近的有效页。'),
    itemsPerView: rangeControl(1, 4), itemsPerMove: rangeControl(1, 4), loop: booleanControl, showControls: booleanControl, showIndicators: booleanControl,
    autoplayInterval: rangeControl(0, 4000, 250), paused: booleanControl, disabled: booleanControl, label: textControl,
  },
  parameters: { controls: { include: ['activeIndex', 'itemsPerView', 'itemsPerMove', 'loop', 'showControls', 'showIndicators', 'autoplayInterval', 'paused', 'disabled', 'label'] } },
  render: function PlaygroundRender(args) {
    const [, updateArgs] = useArgs<PlaygroundArgs>();
    return <Carousel {...itemProps} {...args} onActiveIndexChange={activeIndex => updateArgs({ activeIndex })} onPausedChange={paused => updateArgs({ paused })} />;
  },
};
