/** Site paths are relative to Vite's base (`/` locally, `/reito-ui/` on Pages). */

export const nanchuangPages = ['dashboard', 'files', 'events', 'inspector', 'trace', 'commands', 'settings'] as const;

export const templates = [
  {
    id: 'dashboard',
    title: '工作台',
    description: '统计、收件箱、客户表、设置、命令面板和通知。',
    pages: ['home', 'inbox', 'customers', 'settings'] as const,
    defaultPage: 'home',
  },
  {
    id: 'chat',
    title: '对话',
    description: '会话列表、消息记录和输入框。本地示例，没有模型连接。',
    pages: ['home'] as const,
    defaultPage: 'home',
  },
  {
    id: 'landing',
    title: '落地页',
    description: '产品介绍、功能、价格和页尾。',
    pages: ['home'] as const,
    defaultPage: 'home',
  },
  {
    id: 'nanchuang',
    title: '南窗',
    description: '一本虚构杂志的编辑室。刊名只留在这个示例里。',
    pages: nanchuangPages,
    defaultPage: 'dashboard',
  },
] as const;

export type TemplateId = (typeof templates)[number]['id'];

const basePrefix = () => {
  const base = import.meta.env.BASE_URL;
  return base.endsWith('/') ? base.slice(0, -1) : base;
};

export function sitePath(path = '') {
  const prefix = basePrefix();
  const clean = path.replace(/^\/+/, '').replace(/\/+$/, '');
  if (!clean) return prefix ? `${prefix}/` : '/';
  return `${prefix}/${clean}`;
}

export function currentSegments() {
  const prefix = basePrefix();
  let path = location.pathname;
  if (prefix && path.startsWith(prefix)) path = path.slice(prefix.length);
  return path.split('/').filter(Boolean);
}

export type SiteRoute =
  | { name: 'home' }
  | { name: 'overview' }
  | { name: 'theme-guide' }
  | { name: 'preview' }
  | { name: 'component'; id: string }
  | { name: 'templates' }
  | { name: 'template'; id: TemplateId; page: string; lockedDensity?: 'dense' };

function templateById(id: string) {
  return templates.find((item) => item.id === id);
}

function pageOf(id: TemplateId, page: string | undefined) {
  const template = templateById(id)!;
  const pages: readonly string[] = template.pages;
  return page && pages.includes(page) ? page : template.defaultPage;
}

export function parseRoute(segments = currentSegments(), search = location.search): SiteRoute {
  const params = new URLSearchParams(search);
  const [root, second, third] = segments;
  if (!root) {
    if (params.has('preview')) return { name: 'preview' };
    return { name: 'home' };
  }
  if (root === 'overview') return { name: 'overview' };
  if (root === 'theme-guide') return { name: 'theme-guide' };
  if (root === 'components' && second) return { name: 'component', id: decodeURIComponent(second) };
  if (root === 'examples') return { name: 'templates' };
  if (root === 'templates' && !second) return { name: 'templates' };
  if (root === 'templates' && second) {
    const template = templateById(second);
    if (!template) return { name: 'templates' };
    const locked = params.get('lock') === 'dense' ? 'dense' : undefined;
    return { name: 'template', id: template.id, page: pageOf(template.id, third), lockedDensity: locked };
  }
  return { name: 'home' };
}

function legacyRoute(search: string): SiteRoute | null {
  const params = new URLSearchParams(search);
  const view = params.get('view');
  const page = params.get('page') ?? undefined;
  const locked = view === 'dense' ? 'dense' as const : undefined;
  if (view === 'overview') return { name: 'overview' };
  if (view === 'theme-guide') return { name: 'theme-guide' };
  if (view === 'examples' && !params.get('example')) return { name: 'templates' };
  if (view === 'gallery' || view === 'dense' || (view === 'examples' && params.get('example') === 'nanchuang')) {
    return { name: 'template', id: 'nanchuang', page: pageOf('nanchuang', page), lockedDensity: locked };
  }
  if (view === 'examples' && params.get('example')) {
    const id = params.get('example')!;
    const template = templateById(id);
    if (!template) return { name: 'templates' };
    return { name: 'template', id: template.id, page: pageOf(template.id, page) };
  }
  const component = params.get('component');
  if (component) return { name: 'component', id: component };
  if (params.has('preview')) return { name: 'preview' };
  return null;
}

export function routePath(route: SiteRoute) {
  switch (route.name) {
    case 'home':
      return sitePath();
    case 'overview':
      return sitePath('overview');
    case 'theme-guide':
      return sitePath('theme-guide');
    case 'preview':
      return sitePath();
    case 'component':
      return sitePath(`components/${route.id}`);
    case 'templates':
      return sitePath('templates');
    case 'template': {
      const template = templateById(route.id)!;
      const leaf = template.pages.length > 1 || route.page !== template.defaultPage ? `/${route.page}` : '';
      return sitePath(`templates/${route.id}${leaf}`);
    }
  }
}

function keptSearch(search: string, route: SiteRoute) {
  const params = new URLSearchParams(search);
  for (const key of ['view', 'example', 'page', 'layer', 'component', 'p']) params.delete(key);
  if (route.name === 'template' && route.lockedDensity) params.set('lock', route.lockedDensity);
  else params.delete('lock');
  const text = params.toString();
  return text ? `?${text}` : '';
}

/** Rewrite `?view=` / `?layer=` links onto paths without a second document load. */
export function adoptLocation(): SiteRoute {
  const segments = currentSegments();
  const legacy = segments.length === 0 ? legacyRoute(location.search) : null;
  const route = legacy ?? parseRoute(segments, location.search);
  if (route.name === 'preview') return route;
  const next = `${routePath(route)}${keptSearch(location.search, route)}${location.hash}`;
  const current = `${location.pathname}${location.search}${location.hash}`;
  if (next !== current) history.replaceState(null, '', next);
  return route;
}

export function staticSitePaths(componentIds: string[]) {
  const paths = ['overview', 'theme-guide', 'templates', 'examples'];
  for (const template of templates) {
    paths.push(`templates/${template.id}`);
    for (const page of template.pages) paths.push(`templates/${template.id}/${page}`);
  }
  for (const id of componentIds) paths.push(`components/${id}`);
  return paths;
}
