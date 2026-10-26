import React from 'react';
import { createRoot } from 'react-dom/client';
import '@reito/tokens/css';
import '@reito/ui/styles.css';
import { ReitoThemeProvider, Text, type DensityMode } from '@reito/ui/basic';
import { CompositionDemo } from '../../skills/reito-ui/assets/workbench.js';

const query = new URLSearchParams(location.search);
const mode = query.get('theme') === 'dark' ? 'dark' : 'light';
const density = (query.get('density') || 'compact') as DensityMode;
createRoot(document.getElementById('root')!).render(
  <ReitoThemeProvider root mode={mode} density={density}>
    <CompositionDemo customized={query.has('customized')} />
    <Text className="font-mono" data-testid="mono">session_id_012345</Text>
  </ReitoThemeProvider>,
);
