import React from 'react';
import { createRoot } from 'react-dom/client';
import '@reito/tokens/css';
import '@reito/ui/styles.css';
import { ReitoThemeProvider, Text, type DensityMode } from '@reito/ui/basic';
import {
  CompositionDemo,
  PageTabsDemo,
  KnowledgePageDemo,
  RegionPageDemo,
  RegionShellDemo,
} from '../../skills/reito-ui/assets/workbench.js';
import { ThemeApiDemo } from './theme-api.js';

const query = new URLSearchParams(location.search);
const mode = query.get('theme') === 'dark' ? 'dark' : 'light';
const density = (query.get('density') || 'compact') as DensityMode;
createRoot(document.getElementById('root')!).render(
  query.has('theme-api') ? (
    <ThemeApiDemo />
  ) : (
    <ReitoThemeProvider
      root
      mode={mode}
      density={density}
      tokens={
        query.has('pageGap') ? { semantic: { 'section-gap': 'var(--rui-space-6)' } } : undefined
      }
    >
      {query.get('page') === 'regions' ? (
        <RegionPageDemo
          page={query.get('kind') === 'admissions' ? 'admissions' : 'requests'}
          state={(query.get('state') as 'empty' | 'loading' | 'error' | 'records') || 'empty'}
        />
      ) : query.get('page') === 'shell' ? (
        <RegionShellDemo />
      ) : query.get('page') === 'tabs' ? (
        <PageTabsDemo
          variant={query.get('variant') === 'default' ? 'default' : 'line'}
          orientation={query.get('orientation') === 'vertical' ? 'vertical' : 'horizontal'}
        />
      ) : query.get('page') === 'knowledge' ? (
        <KnowledgePageDemo />
      ) : (
        <CompositionDemo customized={query.has('customized')} />
      )}
      <Text className="font-mono" data-testid="mono">
        session_id_012345
      </Text>
    </ReitoThemeProvider>
  ),
);
