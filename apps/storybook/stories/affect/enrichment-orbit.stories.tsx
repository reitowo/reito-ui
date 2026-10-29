import type { Meta, StoryObj } from '@storybook/react-vite';
import { EnrichmentOrbitDemo } from '../../../../packages/ui/src/affect/catalog.js';
import { StoryFrame } from '../ai/story-frame.js';

const meta = {
  id: '模式-enrichment-orbit',
  title: '模式/EnrichmentOrbit 富集轨道',
  component: EnrichmentOrbitDemo,
  decorators: [
    (Story) => (
      <StoryFrame>
        <Story />
      </StoryFrame>
    ),
  ],
  parameters: { docs: { description: { component: '中心节点与环绕标记。' } } },
} satisfies Meta<typeof EnrichmentOrbitDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '默认示例' };
