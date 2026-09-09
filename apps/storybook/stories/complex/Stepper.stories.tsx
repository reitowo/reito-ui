import { useArgs } from 'storybook/preview-api';
import { textControl, booleanControl, choiceControl, recipeControl } from '../feature-controls.js';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stepper } from '../../../../packages/ui/src/complex/index.js';
import { StepperDemo } from '../../../../packages/ui/src/complex/catalog.js';
const meta = { id: "复杂-stepper-分步流程", title: "复杂/Stepper 分步流程", component: StepperDemo, parameters: { docs: { description: { component: 'value 和 onValueChange 控制当前步骤。校验与允许跳转规则由调用方提供；示例含必填信息、偏好和最终确认。' } } } } satisfies Meta<typeof StepperDemo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Interactive: Story = { name: "交互 · 有状态的配置流程" };
export const ErrorAndDisabled: Story = { name: "状态对比 · 错误与不可进入步骤", render: () => <Stepper value="configure" steps={[{ id: 'create', title: '创建' }, { id: 'configure', title: '配置', error: true, description: '缺少必要字段' }, { id: 'publish', title: '发布', disabled: true }]} /> };

const steps = [{ id: 'create', title: '创建工作区' }, { id: 'configure', title: '配置偏好' }, { id: 'review', title: '确认配置' }];
function StepExample({ initial = 'create', error = false, disabled = false }: { initial?: string; error?: boolean; disabled?: boolean }) { const [current, setCurrent] = useState(initial); return <Stepper value={current} onValueChange={setCurrent} steps={steps.map(step => ({ ...step, error: error && step.id === 'configure', disabled: disabled && step.id === 'review' }))} />; }
export const Default: Story = { name: "第一步", render: () => <StepExample /> };
export const InProgress: Story = { name: "中间步骤", render: () => <StepExample initial="configure" /> };
export const Error: Story = { name: "步骤错误", render: () => <StepExample initial="configure" error /> };
export const Disabled: Story = { name: "不可进入的步骤", render: () => <StepExample initial="configure" disabled /> };

type PlaygroundArgs = { value: string; label: string; stepError: boolean; stepDisabled: boolean; description: string };
export const Playground: StoryObj<PlaygroundArgs> = {
 name: "参数调试", args: { value: 'configure', label: '操作步骤', stepError: false, stepDisabled: false, description: '配置本地偏好' },
 argTypes: { value: choiceControl(['create', 'configure', 'review']), label: textControl, stepError: recipeControl(booleanControl, 'steps[1].error'), stepDisabled: recipeControl(booleanControl, 'steps[2].disabled'), description: recipeControl(textControl, 'steps[1].description') },
 parameters: { controls: { include: ['value', 'stepError', 'stepDisabled', 'description', 'label'] } },
 render: function PlaygroundRender(args) { const [, updateArgs] = useArgs(); return <Stepper value={args.value} label={args.label} onValueChange={value => updateArgs({ value })} steps={steps.map((step, index) => ({ ...step, error: index === 1 && args.stepError, disabled: index === 2 && args.stepDisabled, description: index === 1 ? args.description : undefined }))} />; },
};
