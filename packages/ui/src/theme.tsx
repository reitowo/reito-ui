import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useSyncExternalStore,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import {
  themeTokens,
  type ColorPalette,
  type DensityMode,
  type NeutralPalette,
  type ThemeTokenOverrides,
} from '@reito/tokens/themes';
import type { VariantProps } from 'class-variance-authority';
import type { buttonVariants } from './primitives/button.js';
import { ButtonSizeContext } from './lib/button-size-context.js';

export type {
  ColorPalette,
  DensityMode,
  NeutralPalette,
  ThemeTokenOverrides,
} from '@reito/tokens/themes';
export type ThemeMode = 'dark' | 'light' | 'system';
export type ThemeColor =
  | ColorPalette
  | 'primary'
  | 'neutral'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';
export type ThemeColors = {
  primary: ColorPalette | 'neutral';
  neutral: NeutralPalette;
  success: ColorPalette;
  warning: ColorPalette;
  danger: ColorPalette;
  info: ColorPalette;
};
/** Prop defaults a theme scope feeds to descendants. Props passed to a component always win. */
export type ThemeComponentDefaults = {
  Button?: VariantProps<typeof buttonVariants> & { color?: ThemeColor };
  Panel?: { flush?: boolean };
  SelectInput?: { placeholder?: string };
};
/** A shareable theme preset. Build one with createTheme and pass it to a provider's theme prop. */
export type ThemeConfig = {
  mode?: ThemeMode;
  colors?: Partial<ThemeColors>;
  density?: DensityMode;
  tokens?: ThemeTokenOverrides;
  defaults?: ThemeComponentDefaults;
};
type ThemeState = {
  mode: ThemeMode;
  scheme: 'dark' | 'light';
  density: DensityMode;
  colors: ThemeColors;
  tokens: ThemeTokenOverrides;
  defaults: ThemeComponentDefaults;
  style: CSSProperties;
  documentRoot: boolean;
};
const defaultColors: ThemeColors = {
  primary: 'neutral',
  neutral: 'graphite',
  success: 'green',
  warning: 'amber',
  danger: 'red',
  info: 'blue',
};
const ThemeContext = createContext<ThemeState | null>(null);
const getSystemScheme = (): 'dark' | 'light' =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark';
const getServerScheme = () => 'dark' as const;
const noSubscribe = () => () => {};
const subscribeSystem = (onChange: () => void) => {
  const media = window.matchMedia('(prefers-color-scheme: light)');
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
};
const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
const aliases = (values: Record<string, string>): CSSProperties =>
  Object.fromEntries([
    ...Object.entries(values).map(([key, value]) => ['--rui-' + key, value]),
    ...Object.entries(themeTokens.aliases).map(([key, value]) => [
      '--' + key,
      `var(--rui-${value})`,
    ]),
  ]) as CSSProperties;

function mergeTokens(
  parent?: ThemeTokenOverrides,
  local?: ThemeTokenOverrides,
): ThemeTokenOverrides {
  const components = { ...parent?.components };
  for (const key of Object.keys(local?.components ?? {}) as Array<keyof typeof components>) {
    Object.assign(components, { [key]: { ...components[key], ...local?.components?.[key] } });
  }
  return { semantic: { ...parent?.semantic, ...local?.semantic }, components };
}

function mergeDefaults(
  parent?: ThemeComponentDefaults,
  local?: ThemeComponentDefaults,
): ThemeComponentDefaults {
  const merged: ThemeComponentDefaults = { ...parent };
  for (const key of Object.keys(local ?? {}) as Array<keyof ThemeComponentDefaults>) {
    Object.assign(merged, { [key]: { ...parent?.[key], ...local?.[key] } });
  }
  return merged;
}

/**
 * Builds a typed theme preset from ordered layers; later layers win, like extending a base preset.
 * Colors and component defaults merge per field, token overrides merge per component.
 */
export function createTheme(...layers: ThemeConfig[]): ThemeConfig {
  return layers.reduce<ThemeConfig>(
    (theme, layer) => ({
      mode: layer.mode ?? theme.mode,
      colors: { ...theme.colors, ...layer.colors },
      density: layer.density ?? theme.density,
      tokens: mergeTokens(theme.tokens, layer.tokens),
      defaults: mergeDefaults(theme.defaults, layer.defaults),
    }),
    {},
  );
}

function themeStyle(
  scheme: 'dark' | 'light',
  colors: ThemeColors,
  density: DensityMode,
  tokens: ThemeTokenOverrides,
) {
  const values = {
    ...themeTokens.bindings,
    ...themeTokens.densityBindings[density],
    ...themeTokens.themeBindings[scheme],
    ...(colors.neutral === 'graphite' ? {} : themeTokens.neutralBindings[colors.neutral][scheme]),
  };
  // Neutral actions invert the current neutral surface; status colors remain independent.
  if (colors.neutral !== 'graphite') {
    values.primary = values.text;
    values['on-primary'] = values.bg;
  }
  if (colors.primary !== 'neutral') {
    const color = themeTokens.colorBindings[colors.primary][scheme];
    values.primary = color.solid;
    values['on-primary'] = color['on-solid'];
    values['primary-hover'] = color.hover;
    values['action-accent'] = color.solid;
    values['action-accent-hover'] = color.hover;
    values['on-action-accent'] = color['on-solid'];
  }
  for (const role of ['success', 'warning', 'danger', 'info'] as const) {
    const color = themeTokens.colorBindings[colors[role]][scheme];
    const key = role === 'info' ? 'accent' : role;
    values[key] = color.text;
    values[key + '-soft'] = color.soft;
  }
  Object.assign(values, tokens.semantic);
  for (const [component, overrides] of Object.entries(tokens.components ?? {})) {
    for (const [key, value] of Object.entries(overrides ?? {})) {
      values[`component-${component}-${key}`] = value;
    }
  }
  return { ...aliases(values), colorScheme: scheme };
}

export type ReitoThemeProviderProps = Omit<HTMLAttributes<HTMLDivElement>, 'color'> &
  ThemeConfig & {
    /** A createTheme preset. The individual props above override its fields. */
    theme?: ThemeConfig;
    /**
     * Curvature base (`--rui-radius`); every radius step and control/surface role scales
     * from it. Shorthand for `tokens.semantic.radius`.
     */
    radius?: string;
    root?: boolean;
    children?: ReactNode;
  };
export type ThemeProps = Omit<ReitoThemeProviderProps, 'root'>;

/**
 * A theme scope. Merge order is parent scope, then `theme`, then individual props.
 * `root` also themes document chrome and non-React surfaces.
 */
export function ReitoThemeProvider({
  theme,
  mode: modeProp,
  colors,
  density: densityProp,
  radius,
  tokens,
  defaults,
  root = false,
  children,
  style,
  className,
  ...props
}: ReitoThemeProviderProps) {
  const parent = useContext(ThemeContext);
  const mode = modeProp ?? theme?.mode;
  const density = densityProp ?? theme?.density;
  const selectedMode = mode ?? parent?.mode ?? 'dark';
  const systemScheme = useSyncExternalStore(
    selectedMode === 'system' ? subscribeSystem : noSubscribe,
    getSystemScheme,
    getServerScheme,
  );
  const scheme = selectedMode === 'system' ? systemScheme : selectedMode;
  const state = useMemo<ThemeState>(() => {
    const merged = { ...defaultColors, ...parent?.colors, ...theme?.colors, ...colors };
    const mergedTokens = mergeTokens(
      mergeTokens(parent?.tokens, theme?.tokens),
      radius === undefined ? tokens : mergeTokens(tokens, { semantic: { radius } }),
    );
    const mergedDensity = density ?? parent?.density ?? 'compact';
    return {
      mode: selectedMode,
      scheme,
      density: mergedDensity,
      colors: merged,
      tokens: mergedTokens,
      defaults: mergeDefaults(mergeDefaults(parent?.defaults, theme?.defaults), defaults),
      style: themeStyle(scheme, merged, mergedDensity, mergedTokens),
      documentRoot: root,
    };
  }, [
    selectedMode,
    scheme,
    density,
    parent,
    theme,
    colors?.primary,
    colors?.neutral,
    colors?.success,
    colors?.warning,
    colors?.danger,
    colors?.info,
    radius,
    tokens,
    defaults,
    root,
  ]);
  useBrowserLayoutEffect(() => {
    if (!root) return;
    const html = document.documentElement;
    const oldTheme = html.getAttribute('data-theme'),
      oldDensity = html.getAttribute('data-density');
    const entries = Object.entries(state.style);
    const previous = entries.map(([key]) => [
      key,
      html.style.getPropertyValue(key === 'colorScheme' ? 'color-scheme' : key),
    ]);
    html.dataset.theme = state.scheme;
    html.dataset.density = state.density;
    for (const [key, value] of entries)
      html.style.setProperty(key === 'colorScheme' ? 'color-scheme' : key, String(value));
    return () => {
      for (const [key, value] of previous) {
        const cssKey = key === 'colorScheme' ? 'color-scheme' : key;
        if (value) html.style.setProperty(cssKey, value);
        else html.style.removeProperty(cssKey);
      }
      if (oldTheme === null) html.removeAttribute('data-theme');
      else html.setAttribute('data-theme', oldTheme);
      if (oldDensity === null) html.removeAttribute('data-density');
      else html.setAttribute('data-density', oldDensity);
    };
  }, [root, state]);
  return (
    <ThemeContext.Provider value={state}>
      <div
        {...props}
        className={'reito-root' + (className ? ' ' + className : '')}
        data-rui-theme=""
        data-theme={root ? undefined : scheme}
        data-density={!root && density ? density : undefined}
        style={{ display: 'contents', ...(!root ? state.style : {}), ...style }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

/** Carries the nearest React theme through a Base UI portal without adding layout. */
export function ThemePortalScope({ children }: { children: ReactNode }) {
  const theme = useContext(ThemeContext);
  // 弹层是独立操作区域，不继承表格的行内按钮尺寸；用户主题仍完整保留。
  const content = (
    <ButtonSizeContext.Provider value={undefined}>{children}</ButtonSizeContext.Provider>
  );
  if (!theme) return content;
  return (
    <div
      className="reito-root contents"
      data-rui-theme="portal"
      data-theme={theme.documentRoot ? undefined : theme.scheme}
      data-density={
        theme.density === document.documentElement.dataset.density ? undefined : theme.density
      }
      style={theme.documentRoot ? undefined : theme.style}
    >
      {content}
    </div>
  );
}

/**
 * Local theme scope for a subtree: colors, mode, density, tokens and component prop defaults
 * apply to descendants only. Use ReitoThemeProvider root once for the application.
 */
export function Theme(props: ThemeProps) {
  return <ReitoThemeProvider {...props} root={false} />;
}

export function useReitoTheme() {
  return useContext(ThemeContext);
}

const noDefaults = {};
/** Theme-provided defaults for a component; apply them only to props the caller left undefined. */
export function useThemeDefaults<Name extends keyof ThemeComponentDefaults>(
  name: Name,
): NonNullable<ThemeComponentDefaults[Name]> {
  return (useContext(ThemeContext)?.defaults[name] ?? noDefaults) as NonNullable<
    ThemeComponentDefaults[Name]
  >;
}

/** Shared component color recipe; explicit colors never alter geometry or focus. */
export function useThemeColor(color?: ThemeColor): CSSProperties | undefined {
  const theme = useContext(ThemeContext);
  if (!color) return undefined;
  const settings = theme?.colors ?? defaultColors;
  const family =
    color === 'primary'
      ? settings.primary
      : color === 'success' || color === 'warning' || color === 'danger' || color === 'info'
        ? settings[color]
        : color;
  if (family === 'neutral')
    return aliases({
      primary: 'var(--rui-text)',
      'primary-hover': 'var(--rui-text-secondary)',
      'action-accent-hover': 'var(--rui-text-secondary)',
      'on-primary': 'var(--rui-bg)',
      'action-accent': 'var(--rui-text)',
      'on-action-accent': 'var(--rui-bg)',
      'color-text': 'var(--rui-text)',
      'color-soft': 'var(--rui-hover)',
      'color-border': 'var(--rui-border-strong)',
      // State tokens resolve where they are set. Rebind them on this element so
      // a local color is not stuck with the ancestor's already-resolved fill.
      ...buttonStateAliases('var(--rui-text)', 'var(--rui-text-secondary)', 'var(--rui-bg)'),
    });
  const light = themeTokens.colorBindings[family].light,
    dark = themeTokens.colorBindings[family].dark;
  const value = (role: string) => `light-dark(${light[role]}, ${dark[role]})`;
  return aliases({
    primary: value('solid'),
    'primary-hover': value('hover'),
    'action-accent-hover': value('hover'),
    'on-primary': value('on-solid'),
    'color-text': value('text'),
    'color-soft': value('soft'),
    'color-border': value('border'),
    'action-accent': value('solid'),
    'on-action-accent': value('on-solid'),
    ...buttonStateAliases(value('solid'), value('hover'), value('on-solid')),
  });
}

function buttonStateAliases(rest: string, hover: string, foreground: string) {
  return {
    'component-button-primary-bg-rest': rest,
    'component-button-primary-bg-hover': hover,
    'component-button-primary-bg-pressed': hover,
    'component-button-primary-bg-disabled': rest,
    'component-button-primary-fg': foreground,
    'component-button-accent-bg-rest': rest,
    'component-button-accent-bg-hover': hover,
    'component-button-accent-bg-pressed': hover,
    'component-button-accent-bg-disabled': rest,
    'component-button-accent-fg': foreground,
    'component-button-link-fg': rest,
  };
}
