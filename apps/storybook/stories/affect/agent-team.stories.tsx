import type { Meta, StoryObj } from '@storybook/react-vite';
import { AgentTeamDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-agent-team',
  title: '模式/AgentTeam 代理团队',
  component: AgentTeamDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '提示分出三个角色。' } } },
} satisfies Meta<typeof AgentTeamDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
