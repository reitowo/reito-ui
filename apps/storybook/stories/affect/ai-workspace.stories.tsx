import type { Meta, StoryObj } from '@storybook/react-vite';
import { AiWorkspaceDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-ai-workspace',
  title: '模式/AiWorkspace 助手工作区',
  component: AiWorkspaceDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '侧栏、对话与项目，组合 ChatComposer。' } } },
} satisfies Meta<typeof AiWorkspaceDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
