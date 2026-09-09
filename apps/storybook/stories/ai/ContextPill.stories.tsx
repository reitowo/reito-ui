import type { ComponentProps } from 'react';
import { useArgs } from 'storybook/preview-api';
import { textControl, booleanControl, choiceControl, recipeControl } from '../feature-controls.js';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ContextPill } from '../../../../packages/ui/src/ai/context.js';
import { File, Folder } from 'lucide-react';
import { StoryFrame } from './story-frame.js';

const meta = { id: "ai-contextpill", title: "AI/ContextPill 上下文标签", component: ContextPill, args: { label: 'design-language.md', children: 'design-language.md' }, render: args => <div className="flex min-w-0"><ContextPill {...args} /></div>, decorators: [Story => <StoryFrame><Story /></StoryFrame>] } satisfies Meta<typeof ContextPill>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Guidelines: Story = { name: "默认示例",};
export const Removable: Story = { name: "可移除", args: { onRemove: fn() }, play: async ({ canvasElement, args }) => { await userEvent.click(within(canvasElement).getByRole('button', { name: `移除${args.label}` })); await expect(args.onRemove).toHaveBeenCalledTimes(1); } };
export const Disabled: Story = { name: "禁用移除", args: { onRemove: fn(), disabled: true } };
export const LongName: Story = { name: "长名称截断",
  args: { label: 'packages/ui/src/components/workspace/very-long-context-file-name.tsx', children: 'packages/ui/src/components/workspace/very-long-context-file-name.tsx', onRemove: fn() },
  render: args => <div className="max-w-64"><ContextPill {...args} /></div>,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByTitle(args.label);
    const remove = canvas.getByRole('button', { name: `移除${args.label}` });
    const pill = label.parentElement!.getBoundingClientRect();
    const action = remove.getBoundingClientRect();
    await expect(label.scrollWidth).toBeGreaterThan(label.clientWidth);
    await expect(action.width).toBe(action.height);
    await expect(action.right).toBeLessThanOrEqual(pill.right);
    await expect(action.top).toBeGreaterThanOrEqual(pill.top);
    await expect(action.bottom).toBeLessThanOrEqual(pill.bottom);
    await userEvent.click(remove);
    await expect(args.onRemove).toHaveBeenCalledTimes(1);
  },
};

export const FileContext: Story = { name: "文件图标", args: { icon: <File /> } };
export const WorkspaceContext: Story = { name: "工作区图标", args: { label: '当前工作区', children: '当前工作区', icon: <Folder /> } };

type PlaygroundArgs = Pick<ComponentProps<typeof ContextPill>, 'label' | 'disabled'> & { removable: boolean; present: boolean; iconKind: 'none' | 'file' | 'folder' };
export const Playground: StoryObj<PlaygroundArgs> = {
 name: "参数调试", args: { label: 'design-language.md', disabled: false, removable: true, present: true, iconKind: 'file' },
 argTypes: { label: textControl, disabled: booleanControl, removable: recipeControl(booleanControl, '提供 onRemove 回调；移除后 present 会同步变为 false。'), present: recipeControl(booleanControl, '宿主是否渲染上下文标签。'), iconKind: recipeControl(choiceControl(['none', 'file', 'folder']), '传给 icon 插槽的示例图标。') },
 parameters: { controls: { include: ['label', 'disabled', 'removable', 'present', 'iconKind'] } },
 render: function PlaygroundRender(args) { const [, updateArgs] = useArgs(); return <div className="flex min-w-0">{args.present ? <ContextPill label={args.label} disabled={args.disabled} icon={args.iconKind === 'file' ? <File /> : args.iconKind === 'folder' ? <Folder /> : undefined} onRemove={args.removable ? () => updateArgs({ present: false }) : undefined}>{args.label}</ContextPill> : <p className="text-sm text-muted-foreground">已移除；打开 present 重新展示。</p>}</div>; },
};
