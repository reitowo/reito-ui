import { useArgs } from 'storybook/preview-api';
import { textControl, booleanControl, choiceControl } from '../feature-controls.js';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ModelSelector } from '../../../../packages/ui/src/ai/model-selector.js';
import { demoModels, ModelSelectorDemo } from '../../../../packages/ui/src/ai/catalog.js';
import { StoryFrame } from './story-frame.js';

const meta = { id: "ai-modelselector", title: "AI/ModelSelector 模型选择", component: ModelSelector, args: { options: demoModels, value: 'auto', onValueChange: fn() }, decorators: [Story => <StoryFrame><Story /></StoryFrame>], parameters: { docs: { description: { component: '基于官方 Base UI Select 组合；选项、可用性和选中值由调用方提供。本示例没有连接模型服务。' } } } } satisfies Meta<typeof ModelSelector>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Guidelines: Story = { name: "交互 · 模型键盘选择",
  render: () => <ModelSelectorDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const document = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('combobox', { name: '选择模型' });
    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(await document.findByRole('option', { name: /未配置模型/ })).toHaveAttribute('aria-disabled', 'true');
    await userEvent.keyboard('{End}{Enter}');
    await expect(canvas.getByRole('status')).toHaveTextContent('当前本地选项：自动');
    await userEvent.keyboard('{ArrowUp}{Enter}');
    await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('当前本地选项：示例模型'));
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
export const Compact: Story = { name: "紧凑显示", args: { compact: true } };
export const Disabled: Story = { name: "状态 · 禁用", args: { disabled: true } };
export const Unselected: Story = { name: "未选择", args: { value: null } };
export const Empty: Story = { name: "没有可用模型", args: { value: null, options: [], disabled: true } };

export const Default: Story = { name: "默认显示" };

export const Playground: Story = {
  name: "参数调试", args: { value: 'auto', compact: false, disabled: false, label: '选择模型' },
  argTypes: { value: choiceControl([null, ...demoModels.filter(option => !option.disabled).map(option => option.id)]), compact: booleanControl, disabled: booleanControl, label: textControl },
  parameters: { controls: { include: ['value', 'compact', 'disabled', 'label'] } },
  render: function PlaygroundRender(args) { const [, updateArgs] = useArgs(); return <ModelSelector {...args} onValueChange={value => updateArgs({ value })} />; },
};
