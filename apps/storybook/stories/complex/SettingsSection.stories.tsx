import { useArgs } from 'storybook/preview-api';
import { textControl, booleanControl, recipeControl } from '../feature-controls.js';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SettingsSection, SettingsRow } from '../../../../packages/ui/src/complex/index.js';
import { Switch } from '../../../../packages/ui/src/primitives/switch.js';
import { SettingsSectionDemo } from '../../../../packages/ui/src/complex/catalog.js';
const meta = { title: '复杂/SettingsSection 设置分组', component: SettingsSectionDemo, parameters: { docs: { description: { component: 'SettingsSection 和 SettingsRow 负责分组布局。表单标签、受控状态、持久化由调用方提供。此示例包含输入、开关、禁用项和本地保存反馈。' } } } } satisfies Meta<typeof SettingsSectionDemo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Interactive: Story = { name: '交互场景：偏好设置与本地保存' };

export const Default: Story = { name: '默认设置分组', render: () => <SettingsSection title="通知设置"><SettingsRow label="桌面提醒"><Switch aria-label="桌面提醒" defaultChecked /></SettingsRow></SettingsSection> };
export const WithDescription: Story = { name: '带分组与行说明', render: () => <SettingsSection title="通知设置" description="仅用于本地组件展示。"><SettingsRow label="桌面提醒" description="在任务完成时显示提醒"><Switch aria-label="桌面提醒" defaultChecked /></SettingsRow></SettingsSection> };
export const DisabledSetting: Story = { name: '禁用设置项', render: () => <SettingsSection title="同步设置"><SettingsRow label="云端同步" description="本地示例没有配置外部服务"><Switch aria-label="云端同步" disabled /></SettingsRow></SettingsSection> };

type PlaygroundArgs = { title: string; description: string; rowLabel: string; rowDescription: string; checked: boolean; disabled: boolean };
export const Playground: StoryObj<PlaygroundArgs> = {
 name: '参数调试', args: { title: '通知设置', description: '本地设置组合示例。', rowLabel: '桌面提醒', rowDescription: '任务完成时显示提醒', checked: true, disabled: false },
 argTypes: { title: textControl, description: textControl, rowLabel: recipeControl(textControl, 'SettingsRow.label'), rowDescription: recipeControl(textControl, 'SettingsRow.description'), checked: recipeControl(booleanControl, '组合 Switch.checked；实际交互同步 Controls。'), disabled: recipeControl(booleanControl, '组合 Switch.disabled，不是 SettingsSection prop。') },
 parameters: { controls: { include: ['title', 'description', 'rowLabel', 'rowDescription', 'checked', 'disabled'] } },
 render: function PlaygroundRender(args) { const [, updateArgs] = useArgs(); return <SettingsSection title={args.title} description={args.description}><SettingsRow label={args.rowLabel} description={args.rowDescription}><Switch aria-label={args.rowLabel} checked={args.checked} disabled={args.disabled} onCheckedChange={checked => updateArgs({ checked })} /></SettingsRow></SettingsSection>; },
};
