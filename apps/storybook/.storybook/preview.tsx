import type { Preview } from '@storybook/react-vite';
import { useLayoutEffect, type ReactNode } from 'react';
import { TooltipProvider } from '../../../packages/ui/src/primitives/tooltip';
import { ComponentDocs } from './docs-page';
import '@reito/tokens/css';
import '@reito/ui/styles.css';
import '../stories/storybook.css';

function ThemeFrame({ theme, density, docs, children }: { theme: string; density: string; docs: boolean; children: ReactNode }) {
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.density = density;
    document.documentElement.style.colorScheme = theme;
  }, [theme, density]);
  return <TooltipProvider><div className={`reito-root sb-theme-frame${docs ? ' sb-docs-frame' : ''}`} data-theme={theme} data-density={density}>{children}</div></TooltipProvider>;
}

const preview: Preview = {
  tags: ['autodocs'],
  globalTypes: {
    theme: {
      description: 'Shared semantic color theme, including portaled surfaces.',
      toolbar: { title: 'Theme', icon: 'circlehollow', dynamicTitle: true, items: [
        { value: 'dark', title: 'Dark graphite' }, { value: 'light', title: 'Light graphite' },
      ] },
    },
    density: {
      description: 'Shared control heights and spacing. Typography stays readable.',
      toolbar: { title: 'Density', icon: 'component', dynamicTitle: true, items: [
        { value: 'compact', title: 'Compact' }, { value: 'comfortable', title: 'Comfortable' },
      ] },
    },
  },
  initialGlobals: { theme: 'dark', density: 'compact' },
  decorators: [(Story, context) => (
    <ThemeFrame theme={String(context.globals.theme)} density={String(context.globals.density)} docs={context.viewMode === 'docs'}>
      <Story />
    </ThemeFrame>
  )],
  parameters: {
    layout: 'padded',
    controls: { expanded: true, matchers: { color: /(background|color)$/i, date: /Date$/i } },
    a11y: { test: 'error' },
    options: { storySort: (a, b) => {
      if (a.title !== b.title) {
        const layers = ['基础', '复杂', 'AI'];
        const layer = layers.indexOf(a.title.split('/')[0]) - layers.indexOf(b.title.split('/')[0]);
        return layer || a.title.localeCompare(b.title, 'en', { numeric: true });
      }
      // Props are edited in one Playground; named stories remain useful presets.
      const ranks = [a, b].map(entry => entry.type === 'docs' ? 5
        : entry.id.endsWith('--playground') ? 0
        : entry.id.endsWith('--default') ? 1
        : /总览|对比/.test(entry.name) ? 4
        : /交互示例|交互场景/.test(entry.name) ? 3 : 2);
      return ranks[0] - ranks[1];
    } },
    docs: { page: ComponentDocs },
    backgrounds: { disable: true },
  },
};

export default preview;
