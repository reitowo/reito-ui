import { textControl, booleanControl, rangeControl, recipeControl } from '../feature-controls.js';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Citation, Sources } from '../../../../packages/ui/src/ai/context.js';
import { demoSources, SourcesDemo } from '../../../../packages/ui/src/ai/catalog.js';
import { StoryFrame } from './story-frame.js';

const meta = { id: "ai-sources", title: "AI/Sources 引用来源", component: Sources, args: { items: demoSources }, decorators: [Story => <StoryFrame><Story /></StoryFrame>], parameters: { docs: { description: { component: '行内 Citation 与来源列表。内容和链接由调用方提供；不进行搜索或生成来源。不接受 javascript: 或 data: 链接。' } } } } satisfies Meta<typeof Sources>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Guidelines: Story = { name: "引用与来源组合", render: () => <SourcesDemo /> };
export const List: Story = { name: "来源列表",};
export const MissingLink: Story = { name: "来源无链接", args: { items: [{ id: 'local', title: '本地设计评审笔记', description: '未提供可跳转地址' }] } };
export const UnsafeLinkIsText: Story = { name: "无效链接显示为文本", render: () => <p className="text-sm">没有可跳转地址的引用：<Citation source={{ id: 'invalid', title: '无效链接示例', href: 'javascript:alert(1)' }} index={1} /></p> };
export const Empty: Story = { name: "没有来源", args: { items: [] } };

export const InlineCitation: Story = { name: "行内引用", render: () => <p className="text-sm">共享组件应消费语义令牌。<Citation source={demoSources[0]} index={1} /></p> };

type PlaygroundArgs = { sourceTitle: string; sourceDescription: string; sourceHref: string; empty: boolean; inline: boolean; index: number };
export const Playground: StoryObj<PlaygroundArgs> = {
 name: "参数调试", args: { sourceTitle: '本地设计规范', sourceDescription: '调用方提供的参考条目。', sourceHref: '', empty: false, inline: false, index: 1 },
 argTypes: { sourceTitle: recipeControl(textControl, 'SourceItem.title'), sourceDescription: recipeControl(textControl, 'SourceItem.description'), sourceHref: recipeControl(textControl, 'SourceItem.href；空值显示普通文本。'), empty: recipeControl(booleanControl, '传入空 items 或不渲染行内引用。'), inline: recipeControl(booleanControl, '在 Sources 列表和 Citation 行内引用之间选择组合方式。'), index: { ...rangeControl(1, 20), table: { category: 'Citation props' } } },
 parameters: { controls: { include: ['inline', 'sourceTitle', 'sourceDescription', 'sourceHref', 'index', 'empty'] } },
 render: args => { const source = { id: 'example', title: args.sourceTitle, description: args.sourceDescription, href: args.sourceHref }; return args.inline ? <p className="text-sm">共享组件消费语义令牌。{!args.empty && <Citation source={source} index={args.index} />}</p> : <Sources items={args.empty ? [] : [source]} />; },
};
