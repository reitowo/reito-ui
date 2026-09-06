import type { StorybookConfig } from '@storybook/react-vite';
import { fileURLToPath } from 'node:url';
import { mergeConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

const workspaceFile = (path: string) => fileURLToPath(new URL(`../../../${path}`, import.meta.url));

const config: StorybookConfig = {
  stories: ['../stories/{basic,complex,ai}/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: { name: '@storybook/react-vite', options: {} },
  core: { disableTelemetry: true },
  docs: { defaultName: 'Docs' },
  viteFinal: async (config) => mergeConfig(config, {
    plugins: [tailwindcss()],
    resolve: {
      alias: [
        { find: /^@reito\/ui\/styles\.css$/, replacement: workspaceFile('packages/ui/src/styles.css') },
        { find: /^@reito\/ui\/basic$/, replacement: workspaceFile('packages/ui/src/basic.ts') },
        { find: /^@reito\/ui$/, replacement: workspaceFile('packages/ui/src/index.ts') },
        { find: /^@reito\/tokens\/css$/, replacement: workspaceFile('packages/tokens/dist/tokens.css') },
      ],
    },
  }),
};

export default config;

