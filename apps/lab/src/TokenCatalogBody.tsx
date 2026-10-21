import { useEffect, useId, useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { tokenCatalog, type TokenDefinition } from '@reito/tokens/catalog';
import { Button, Checkbox, Input, Label, SelectInput } from '@reito/ui/basic';

const groups = [
  { value: 'foundation', label: '基础尺度' },
  { value: 'themes', label: '语义颜色' },
  { value: 'density', label: '密度' },
  { value: 'components', label: '组件变量' },
  { value: 'palette', label: '基础色板' },
  { value: 'colorScales', label: '彩色色阶' },
  { value: 'colorThemes', label: '配色方案' },
];
const types: Record<string, string> = {
  color: '颜色',
  dimension: '尺寸',
  duration: '时长',
  fontFamily: '字体',
  fontWeight: '字重',
  number: '数值',
  shadow: '阴影',
  cubicBezier: '动效曲线',
};
const collator = new Intl.Collator('en', { numeric: true });
const semanticOrder = [
  'bg',
  'surface',
  'elevated',
  'composer-bg',
  'text',
  'text-secondary',
  'text-muted',
  'border',
  'border-strong',
  'hover',
  'active',
  'primary',
  'on-primary',
  'primary-hover',
  'action-accent',
  'on-action-accent',
  'action-accent-hover',
  'accent',
  'accent-soft',
  'focus',
  'success',
  'success-soft',
  'warning',
  'warning-soft',
  'danger',
  'danger-soft',
  'info',
  'overlay',
];
const definitions = [...tokenCatalog].sort((a, b) => {
  const groupOrder =
    groups.findIndex((group) => group.value === a.group) -
    groups.findIndex((group) => group.value === b.group);
  if (groupOrder) return groupOrder;
  if (a.group === 'themes') {
    const themeOrder = collator.compare(a.theme ?? '', b.theme ?? '');
    if (themeOrder) return themeOrder;
    const index = (token: TokenDefinition) => {
      const found = semanticOrder.indexOf(token.path.split('.').at(-1)!);
      return found < 0 ? semanticOrder.length : found;
    };
    return index(a) - index(b) || collator.compare(a.path, b.path);
  }
  return collator.compare(a.path, b.path);
});
const variables = [
  ...new Set(definitions.flatMap((token) => (token.cssVariable ? [token.cssVariable] : []))),
];
const componentDefinitions = definitions.filter((token) => token.group === 'components');
const componentGroups = new Set(componentDefinitions.map((token) => token.path.split('.')[1])).size;

function readCurrentValues() {
  const root = document.documentElement;
  const style = getComputedStyle(root);
  return {
    theme: root.dataset.theme,
    density: root.dataset.density,
    rootSize: Number.parseFloat(style.fontSize),
    values: Object.fromEntries(
      variables.map((variable) => [variable, style.getPropertyValue(variable).trim()]),
    ),
  };
}

function dimension(value: string, rootSize: number) {
  const rem = value.match(/^(-?(?:\d+(?:\.\d*)?|\.\d+))rem$/);
  return rem ? `${value} · ${Number((Number(rem[1]) * rootSize).toFixed(3))}px` : value;
}

function scope(token: TokenDefinition) {
  return [
    groups.find((group) => group.value === token.group)?.label ?? token.group,
    token.theme === 'light' ? '浅色' : token.theme === 'dark' ? '深色' : '',
    token.density === 'comfortable' ? '舒适' : token.density === 'dense' ? '高密' : token.density === 'compact' ? '紧凑' : '',
  ]
    .filter(Boolean)
    .join(' / ');
}

const names: Record<string, string> = {
  bg: '画布',
  surface: '面板',
  elevated: '浮层',
  text: '正文',
  'text-secondary': '次级文字',
  'text-muted': '辅助文字',
  border: '边界',
  'border-strong': '强调边界',
  hover: '悬停',
  active: '按下',
  primary: '主操作',
  'on-primary': '主操作文字',
  accent: '强调表面',
  focus: '键盘焦点',
  success: '成功',
  warning: '警告',
  danger: '错误',
  info: '信息',
  'font-interface': '界面字号',
  'font-reading': '正文字号',
  'font-caption': '辅助字号',
  'font-sans': '界面字体',
  'font-mono': '等宽字体',
  'control-height': '控件高度',
  'control-height-xs': 'XS 控件高度',
  'control-height-sm': '小控件高度',
  'control-height-lg': '大控件高度',
  'content-padding': '内容内距',
  'content-gap': '内容间距',
  height: '高度',
  radius: '圆角',
  'padding-x': '左右内距',
  'padding-y': '上下内距',
  'font-size': '字号',
  'text-gap': '文字间距',
  'action-accent': '强调操作',
  'on-action-accent': '强调操作文字',
  'action-accent-hover': '强调操作悬停',
  'primary-hover': '主操作悬停',
  'accent-soft': '强调底色',
  'composer-bg': '输入区背景',
  'control-thumb': '控件滑块',
  'success-soft': '成功底色',
  'warning-soft': '警告底色',
  'danger-soft': '错误底色',
  overlay: '遮罩',
  'syntax-comment': '代码注释',
  'syntax-function': '代码函数',
  'syntax-keyword': '代码关键字',
  'syntax-number': '代码数字',
  'syntax-operator': '代码运算符',
  'syntax-property': '代码属性',
  'syntax-punctuation': '代码标点',
  'syntax-string': '代码字符串',
  'syntax-type': '代码类型',
};
function name(token: TokenDefinition) {
  const parts = token.path.split('.');
  const key = parts.at(-1)!;
  const label = names[key] ?? key;
  if (token.group === 'colorScales') return `${parts[1]} ${key}`;
  if (token.group === 'colorThemes') return `${parts[2]} / ${label}`;
  if (token.group === 'components') return `${parts[1]} / ${label}`;
  return label;
}

function shortName(token: TokenDefinition) {
  return token.cssVariable?.replace('--rui-', '') ?? token.path.split('.').slice(1).join(' / ');
}

export function TokenCatalogBody({ onExport }: { onExport: () => void }) {
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('themes');
  const [allModes, setAllModes] = useState(false);
  const [selectedPath, setSelectedPath] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [current, setCurrent] = useState(readCurrentValues);
  const modesId = useId();
  useEffect(() => {
    const observer = new MutationObserver(() => setCurrent(readCurrentValues()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style', 'data-theme', 'data-density'],
    });
    return () => observer.disconnect();
  }, []);
  const available = useMemo(
    () =>
      definitions.filter(
        (token) =>
          allModes ||
          ((!token.theme || token.theme === current.theme) &&
            (!token.density || token.density === current.density)),
      ),
    [allModes, current.theme, current.density],
  );
  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return available.filter(
      (token) =>
        (group === 'all' || token.group === group) &&
        `${name(token)} ${token.path} ${token.cssVariable ?? ''} ${token.description} ${token.type} ${types[token.type] ?? ''} ${JSON.stringify(token.sourceValue)} ${token.cssValue}`
          .toLowerCase()
          .includes(search),
    );
  }, [query, group, available]);
  const selected = filtered.find((token) => token.path === selectedPath) ?? filtered[0];
  const categories = [{ value: 'all', label: '全部变量' }, ...groups].map((category) => ({
    ...category,
    count:
      category.value === 'all'
        ? available.length
        : available.filter((token) => token.group === category.value).length,
  }));
  function isCurrent(token: TokenDefinition) {
    return (
      (!token.theme || token.theme === current.theme) &&
      (!token.density || token.density === current.density)
    );
  }
  function value(token: TokenDefinition) {
    return token.cssVariable && isCurrent(token)
      ? current.values[token.cssVariable] || token.resolvedValue
      : token.resolvedValue;
  }
  function changeGroup(value: string) {
    setGroup(value);
    setSelectedPath('');
  }
  const details = selected ? (
    <>
      <div className="mb-4">
        <h3 className="text-sm font-medium">{name(selected)}</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {types[selected.type] ?? selected.type} · {scope(selected)}
        </p>
      </div>
      <dl className="grid gap-4 text-xs">
        <div>
          <dt className="mb-2 text-muted-foreground">
            {selected.cssVariable && isCurrent(selected) ? '当前 CSS 值' : '定义预览'}
          </dt>
          <dd className="flex items-start gap-2">
            {selected.type === 'color' && (
              <span
                aria-hidden="true"
                className="size-8 shrink-0 rounded-md border border-border"
                style={{ backgroundColor: value(selected) }}
              />
            )}
            <code className="min-w-0 break-all">
              {dimension(value(selected), current.rootSize)}
            </code>
          </dd>
        </div>
        {selected.cssVariable && (
          <div>
            <dt className="mb-1 text-muted-foreground">CSS 变量</dt>
            <dd>
              <code className="break-all">{selected.cssVariable}</code>
            </dd>
          </div>
        )}
        <div>
          <dt className="mb-1 text-muted-foreground">源路径</dt>
          <dd>
            <code className="break-all">{selected.path}</code>
          </dd>
        </div>
        <div>
          <dt className="mb-1 text-muted-foreground">源定义</dt>
          <dd>
            <code className="block whitespace-pre-wrap break-all">
              {typeof selected.sourceValue === 'string'
                ? selected.sourceValue
                : JSON.stringify(selected.sourceValue, null, 2)}
            </code>
          </dd>
        </div>
        {selected.cssValue !== selected.resolvedValue && (
          <div>
            <dt className="mb-1 text-muted-foreground">CSS 引用</dt>
            <dd>
              <code className="break-all">{selected.cssValue}</code>
            </dd>
          </div>
        )}
      </dl>
      {!selected.cssVariable && (
        <p className="mt-4 text-xs text-muted-foreground">
          这是一条配色方案定义，选择该配色时应用到共享角色。
        </p>
      )}
      {group === 'components' && (
        <p className="mt-4 text-xs text-muted-foreground">
          当前组件专属变量为 {componentGroups} 组、{componentDefinitions.length}{' '}
          项；其余组件复用共享角色。
        </p>
      )}
      {selected.description && (
        <p className="mt-4 break-words text-xs text-muted-foreground">{selected.description}</p>
      )}
    </>
  ) : (
    <p className="text-xs text-muted-foreground">选择变量查看详情。</p>
  );
  return (
    <>
      <div className="flex shrink-0 flex-wrap items-center gap-3 border-b px-[var(--rui-compact-surface-padding-x)] py-[var(--rui-compact-surface-padding-y)]">
        <Input
          aria-label="搜索设计变量"
          placeholder="搜索变量…"
          className="min-w-0 flex-1"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <SelectInput
          aria-label="变量分类"
          className="w-full md:hidden"
          value={group}
          onValueChange={changeGroup}
          options={categories.map((category) => ({
            value: category.value,
            label: `${category.label} · ${category.count}`,
          }))}
        />
        <Label
          htmlFor={modesId}
          className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground"
        >
          <Checkbox id={modesId} checked={allModes} onCheckedChange={setAllModes} />
          全部模式
        </Label>
      </div>
      <div className="flex min-h-0 flex-1">
        <nav
          aria-label="变量分类导航"
          className="hidden w-[var(--rui-sidebar-width)] shrink-0 overflow-auto border-r p-2 md:block"
        >
          {categories.map((category) => (
            <button
              key={category.value}
              type="button"
              aria-pressed={group === category.value}
              onClick={() => changeGroup(category.value)}
              className="flex min-h-[var(--rui-control-height-sm)] w-full items-center justify-between gap-2 rounded-sm px-[var(--rui-menu-item-padding-x)] py-[var(--rui-menu-item-padding-y)] text-left text-sm outline-none hover:bg-accent aria-pressed:bg-accent focus-visible:ring-[length:var(--rui-focus-width)] focus-visible:ring-ring"
            >
              {category.label}
              <span className="text-xs text-muted-foreground">{category.count}</span>
            </button>
          ))}
        </nav>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div
            role="region"
            aria-label="设计变量列表"
            tabIndex={0}
            className="rui-scroll-focus min-h-0 flex-1 overflow-auto p-2"
          >
            {filtered.map((token) => (
              <button
                key={token.path}
                type="button"
                data-token-path={token.path}
                aria-label={`查看变量 ${token.path}`}
                aria-pressed={selected?.path === token.path}
                onClick={() => {
                  setSelectedPath(token.path);
                  setDetailsOpen(true);
                }}
                className="flex w-full min-w-0 items-center gap-3 rounded-sm px-[var(--rui-menu-item-padding-x)] py-[var(--rui-menu-item-padding-y)] text-left outline-none hover:bg-accent aria-pressed:bg-accent focus-visible:ring-[length:var(--rui-focus-width)] focus-visible:ring-ring"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm" title={token.path}>
                    {name(token)}
                  </span>
                  {shortName(token) !== name(token) && (
                    <code
                      className="block truncate text-xs text-muted-foreground"
                      title={token.cssVariable ?? token.path}
                    >
                      {shortName(token)}
                    </code>
                  )}
                </span>
                <code
                  className="max-w-[50%] truncate text-xs text-muted-foreground"
                  title={value(token)}
                >
                  {dimension(value(token), current.rootSize)}
                </code>
                {token.type === 'color' && (
                  <span
                    aria-hidden="true"
                    className="size-5 shrink-0 rounded-sm border border-border"
                    style={{ backgroundColor: value(token) }}
                  />
                )}
              </button>
            ))}
            {!filtered.length && (
              <p className="p-[var(--rui-content-padding)] text-sm text-muted-foreground">
                没有匹配的变量。
              </p>
            )}
          </div>
          <details
            open={detailsOpen}
            onToggle={(event) => setDetailsOpen(event.currentTarget.open)}
            className="shrink-0 border-t px-[var(--rui-content-padding)] py-2 lg:hidden"
          >
            <summary className="cursor-pointer text-sm">变量详情</summary>
            <div
              role="region"
              aria-label="当前变量的详细定义"
              tabIndex={0}
              className="rui-scroll-focus mt-3 max-h-48 overflow-auto"
            >
              {details}
            </div>
          </details>
        </div>
        <aside
          aria-label="变量详情"
          tabIndex={0}
          className="rui-scroll-focus hidden w-[var(--rui-inspector-width)] min-w-0 shrink-0 overflow-auto border-l p-[var(--rui-content-padding)] lg:block"
        >
          {details}
        </aside>
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t px-[var(--rui-compact-surface-padding-x)] py-[var(--rui-compact-surface-padding-y)]">
        <span role="status" className="text-xs text-muted-foreground">
          {filtered.length} 条结果 · 完整源定义 {definitions.length} 条
        </span>
        <Button variant="ghost" size="xs" onClick={onExport}>
          <Download />
          导出完整 JSON
        </Button>
      </div>
    </>
  );
}
