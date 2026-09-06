import { textControl, booleanControl, choiceControl, recipeControl } from '../feature-controls.js';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Timeline } from '../../../../packages/ui/src/complex/index.js';
import { TimelineDemo } from '../../../../packages/ui/src/complex/catalog.js';
const meta = { title: '复杂/Timeline 时间线', component: TimelineDemo } satisfies Meta<typeof TimelineDemo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const States: Story = { name: '状态对比：完成、进行中与等待' };
export const Error: Story = { name: '失败与说明', render: () => <Timeline events={[{ id: 'failed', title: '本地校验失败', status: 'error', description: '配置文件缺少名称。修改后可以重新运行校验。', time: '09:42' }]} /> };
export const Empty: Story = { name: '无事件', render: () => <Timeline events={[]} /> };

export const Default: Story = { name: '已完成', render: () => <Timeline events={[{ id: 'complete', title: '工作区已创建', description: '已加载本地示例数据。', time: '09:30', status: 'complete' }]} /> };
export const Current: Story = { name: '进行中', render: () => <Timeline events={[{ id: 'current', title: '交互验证', description: '本地状态示例。', time: '09:36', status: 'current' }]} /> };
export const Pending: Story = { name: '等待开始', render: () => <Timeline events={[{ id: 'pending', title: '等待确认布局', status: 'pending' }]} /> };

type PlaygroundArgs = { label: string; eventTitle: string; eventDescription: string; eventStatus: 'complete' | 'current' | 'error' | 'pending'; eventTime: string; empty: boolean; emptyMessage: string };
export const Playground: StoryObj<PlaygroundArgs> = {
 name: '参数调试', args: { label: '活动时间线', eventTitle: '检查共享组件', eventDescription: '本地状态示例。', eventStatus: 'current', eventTime: '09:36', empty: false, emptyMessage: '还没有活动记录' },
 argTypes: { label: textControl, eventTitle: recipeControl(textControl, 'events[0].title'), eventDescription: recipeControl(textControl, 'events[0].description'), eventStatus: recipeControl(choiceControl(['complete', 'current', 'error', 'pending']), 'events[0].status'), eventTime: recipeControl(textControl, 'events[0].time'), empty: recipeControl(booleanControl, '传入空 events。'), emptyMessage: textControl },
 parameters: { controls: { include: ['eventStatus', 'eventTitle', 'eventDescription', 'eventTime', 'empty', 'emptyMessage', 'label'] } },
 render: args => <Timeline label={args.label} emptyMessage={args.emptyMessage} events={args.empty ? [] : [{ id: 'example', title: args.eventTitle, description: args.eventDescription, status: args.eventStatus, time: args.eventTime }]} />,
};
