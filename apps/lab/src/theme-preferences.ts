import { themeTokens } from '@reito/tokens/themes';
import type { ThemeColors, ThemeMode } from '@reito/ui/basic';
export type ThemeDensity = 'compact' | 'comfortable' | 'dense';

export function readThemeDensity(): ThemeDensity {
  try {
    const density = localStorage.getItem('reito-density');
    return density === 'comfortable' || density === 'dense' ? density : 'compact';
  } catch {
    return 'compact';
  }
}
export function readThemeColors(): Partial<ThemeColors> {
  try {
    const value = JSON.parse(localStorage.getItem('reito-colors') || '{}');
    if (!value || typeof value !== 'object') return {};
    return {
      ...(value.primary === 'neutral' || Object.hasOwn(themeTokens.colors, value.primary)
        ? { primary: value.primary }
        : {}),
      ...(value.neutral === 'graphite' || Object.hasOwn(themeTokens.neutrals, value.neutral)
        ? { neutral: value.neutral }
        : {}),
    };
  } catch {
    return {};
  }
}

export function readThemeMode(): ThemeMode {
  try {
    const mode = localStorage.getItem('reito-theme');
    return mode === 'light' || mode === 'system' ? mode : 'dark';
  } catch {
    return 'dark';
  }
}
