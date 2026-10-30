import React from 'react';
import { createRoot } from 'react-dom/client';
import '@reito/tokens/css';
import '@reito/ui/styles.css';
import { ReitoThemeProvider, Text, type DensityMode } from '@reito/ui/basic';
import * as Basic from '@reito/ui/basic';
import * as Complex from '@reito/ui/complex';
import {
  CompositionDemo,
  PageTabsDemo,
  KnowledgePageDemo,
  RegionPageDemo,
  DashboardDemo,
} from '../../skills/reito-ui/assets/workbench.js';
import { ThemeApiDemo } from './theme-api.js';
import { TableControlsDemo } from './table-controls.js';
import { InputGroupStatesExample } from '../../apps/storybook/stories/basic/input-group-states-example.js';
import { TimelineMarkersExample } from '../../apps/storybook/stories/basic/timeline-markers-example.js';
import { PanelSlotsExample } from '../../apps/storybook/stories/basic/panel-slots-example.js';

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
      {query.get('page') === 'panel-slots' ? (
        <PanelSlotsExample />
      ) : query.get('page') === 'timeline-markers' ? (
        <TimelineMarkersExample />
      ) : query.get('page') === 'input-group-states' ? (
        <InputGroupStatesExample />
      ) : query.get('page') === 'table-controls' ? (
        <TableControlsDemo />
      ) : query.get('page') === 'regions' ? (
        <RegionPageDemo
          page={query.get('kind') === 'admissions' ? 'admissions' : 'requests'}
          state={(query.get('state') as 'empty' | 'loading' | 'error' | 'records') || 'empty'}
        />
      ) : query.get('page') === 'dashboard' ? (
        <DashboardDemo bounded={query.has('bounded')} />
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
      <Text data-testid="layout-exports">
        {JSON.stringify({
          retired: ['Shell', 'AppShell', 'WorkspacePreset'].filter(
            (name) => name in Basic || name in Complex,
          ),
          dashboard: [
            'DashboardGroup',
            'DashboardSidebar',
            'DashboardPanel',
            'DashboardNavbar',
            'DashboardNavigationMenu',
          ].every((name) => name in Basic),
          workspace: 'WorkspaceLayout' in Complex && 'useResizableWorkspaceState' in Complex,
        })}
      </Text>
    </ReitoThemeProvider>
  ),
);
