import { useEffect, useState } from 'react';
import type { DensityMode, ThemeTokenOverrides } from '@reito/ui';

/**
 * Comfortable type in the token file matches compact (13px). Example chrome
 * steps the interface size up so 舒适 is visibly larger than 高密, while row
 * heights still come from the shared control-height scale.
 */
export function exampleDensityTokens(density: DensityMode): ThemeTokenOverrides | undefined {
  if (density !== 'comfortable') return undefined;
  return {
    semantic: {
      'font-interface': 'var(--rui-text-md)',
      'font-caption': 'var(--rui-text-sm)',
      'line-interface': 'var(--rui-text-xl)',
      'action-font-size': 'var(--rui-text-md)',
    },
  };
}

export function readExampleTheme(): 'dark' | 'light' {
  const query = new URLSearchParams(location.search).get('theme');
  if (query === 'light' || query === 'dark') return query;
  try { return localStorage.getItem('reito-theme') === 'light' ? 'light' : 'dark'; } catch { return 'dark'; }
}

export function readExampleDensity(fallback: DensityMode = 'compact'): DensityMode {
  const query = new URLSearchParams(location.search).get('density');
  if (query === 'dense' || query === 'compact' || query === 'comfortable') return query;
  try {
    const stored = localStorage.getItem('reito-density');
    if (stored === 'dense' || stored === 'compact' || stored === 'comfortable') return stored;
  } catch { /* keep the fallback */ }
  return fallback;
}

/** Keep theme and density in the query and in local preferences. */
export function useExamplePrefs(title: string, fallback: DensityMode = 'compact') {
  const [theme, setTheme] = useState(readExampleTheme);
  const [density, setDensity] = useState<DensityMode>(() => readExampleDensity(fallback));
  useEffect(() => {
    const url = new URL(location.href);
    url.searchParams.set('theme', theme);
    url.searchParams.set('density', density);
    history.replaceState(null, '', url);
    try {
      localStorage.setItem('reito-theme', theme);
      localStorage.setItem('reito-density', density);
    } catch { /* session values remain */ }
    document.title = title;
  }, [theme, density, title]);
  return { theme, setTheme, density, setDensity };
}
