import type { Meta, StoryObj } from '@storybook/react-vite';
import { VoiceOrbDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-voice-orb',
  title: '模式/VoiceOrb 语音球',
  component: VoiceOrbDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '听、想、说状态的语义球体。' } } },
} satisfies Meta<typeof VoiceOrbDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
