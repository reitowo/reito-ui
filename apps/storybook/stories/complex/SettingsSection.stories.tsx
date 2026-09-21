import { useId } from 'react';
import { useArgs } from 'storybook/preview-api';
import { Bell } from 'lucide-react';
import { textControl, booleanControl, choiceControl, recipeControl } from '../feature-controls.js';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SettingsSection, SettingsRow } from '../../../../packages/ui/src/complex/index.js';
import { Switch } from '../../../../packages/ui/src/primitives/switch.js';
import { SettingsSectionDemo } from '../../../../packages/ui/src/complex/catalog.js';
import { SettingsDialogExample } from './settings-dialog-example.js';
const meta = { id: "复杂-settingssection-设置分组", title: "复杂/SettingsSection 设置分组", component: SettingsSectionDemo, parameters: { docs: { description: { component: 'SettingsSection 默认保留外框；variant="plain" 使用平铺分隔。SettingsRow 支持 htmlFor 关联单个控件、orientation="vertical" 展开选项，以及 labelId / descriptionId 供组名与说明引用。控件状态、ARIA 引用和持久化仍由调用方提供。弹窗仅保存本地示例状态。' } } } } satisfies Meta<typeof SettingsSectionDemo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Interactive: Story = { name: "交互 · 偏好设置与本地保存" };

export const Default: Story = { name: "默认设置分组", render: () => <SettingsSection title="通知设置"><SettingsRow label="桌面提醒"><Switch aria-label="桌面提醒" defaultChecked /></SettingsRow></SettingsSection> };
export const WithDescription: Story = { name: "带分组与行说明", render: () => <SettingsSection title="通知设置" description="仅用于本地组件展示。"><SettingsRow label="桌面提醒" description="在任务完成时显示提醒"><Switch aria-label="桌面提醒" defaultChecked /></SettingsRow></SettingsSection> };
export const DisabledSetting: Story = { name: "禁用设置项", render: () => <SettingsSection title="同步设置"><SettingsRow label="云端同步" description="本地示例没有配置外部服务"><Switch aria-label="云端同步" disabled /></SettingsRow></SettingsSection> };
export const InlineIconValue: Story = {
 name: '行内图标与文字',
 render: () => <SettingsSection title="通知设置" description="仅展示本地状态，不连接外部通知服务。"><SettingsRow label="提醒状态"><span><Bell className="size-4" aria-hidden="true" /> 已关闭</span></SettingsRow><SettingsRow label="纯文本状态"><span>未启用自动提醒</span></SettingsRow></SettingsSection>,
};

export const Plain: Story = { name: '平铺分组', render: () => <SettingsSection title="通知设置" variant="plain"><SettingsRow label="提醒状态"><span>已开启</span></SettingsRow><SettingsRow label="接收范围"><span>仅提及我</span></SettingsRow></SettingsSection> };
export const SettingsDialog: Story = { name: '交互 · 设置弹窗与展开选项', render: () => <SettingsDialogExample /> };
export const LoadingDialog: Story = { name: '设置弹窗 · 加载中', render: () => <SettingsDialogExample state="loading" /> };
export const ErrorDialog: Story = { name: '设置弹窗 · 失败与重试', render: () => <SettingsDialogExample state="error" /> };

type PlaygroundArgs = { title: string; description: string; variant: 'outlined' | 'plain'; orientation: 'horizontal' | 'vertical'; rowLabel: string; rowDescription: string; checked: boolean; disabled: boolean };
export const Playground: StoryObj<PlaygroundArgs> = {
 name: "参数调试", args: { title: '通知设置', description: '本地设置组合示例。', variant: 'outlined', orientation: 'horizontal', rowLabel: '桌面提醒', rowDescription: '任务完成时显示提醒', checked: true, disabled: false },
 argTypes: { title: textControl, description: textControl, variant: choiceControl(['outlined', 'plain']), orientation: recipeControl(choiceControl(['horizontal', 'vertical']), 'SettingsRow.orientation'), rowLabel: recipeControl(textControl, 'SettingsRow.label'), rowDescription: recipeControl(textControl, 'SettingsRow.description'), checked: recipeControl(booleanControl, '组合 Switch.checked；实际交互同步 Controls。'), disabled: recipeControl(booleanControl, '组合 Switch.disabled，不是 SettingsSection prop。') },
 parameters: { controls: { include: ['title', 'description', 'variant', 'orientation', 'rowLabel', 'rowDescription', 'checked', 'disabled'] } },
 render: function PlaygroundRender(args) { const id = useId(); const [, updateArgs] = useArgs(); return <SettingsSection title={args.title} description={args.description} variant={args.variant}><SettingsRow label={args.rowLabel} htmlFor={id} description={args.rowDescription} descriptionId={`${id}-description`} orientation={args.orientation}><Switch id={id} aria-describedby={args.rowDescription ? `${id}-description` : undefined} checked={args.checked} disabled={args.disabled} onCheckedChange={checked => updateArgs({ checked })} /></SettingsRow></SettingsSection>; },
};
