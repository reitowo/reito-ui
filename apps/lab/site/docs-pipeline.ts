import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { DocComponent, DocPage, DocSection, DocsData } from '../src/site/docs-types.ts';

/**
 * One content source for the docs pages, `/llms.txt`, `/llms-full.txt` and the per-page `.md`
 * mirrors. Bodies keep root-relative site links (`/docs/x`) and the `{{SITE_URL}}` /
 * `{{STORYBOOK_URL}}` placeholders; each output resolves them for its own medium.
 */

export const repository = 'https://github.com/reitowo/reito-ui';
const repoRoot = fileURLToPath(new URL('../../../', import.meta.url));
const contentDir = fileURLToPath(new URL('../content/docs/', import.meta.url));
const manifestPath = fileURLToPath(new URL('../src/catalog-manifest.json', import.meta.url));

interface SourceSpec { slug: string; file: string; title: string; description: string }

const authored: Array<Omit<SourceSpec, 'title' | 'description'>> = [
  { slug: 'introduction', file: 'apps/lab/content/docs/introduction.md' },
  { slug: 'installation', file: 'apps/lab/content/docs/installation.md' },
  { slug: 'getting-started', file: 'apps/lab/content/docs/getting-started.md' },
  { slug: 'theming', file: 'apps/lab/content/docs/theming.md' },
  { slug: 'ai', file: 'apps/lab/content/docs/ai.md' },
];

const guides: SourceSpec[] = [
  { slug: 'composition', file: 'docs/composition.md', title: '页面组合与默认主题', description: '一次接入、组合所有权、统一默认尺寸、页头与页签，以及从 0.5.8 升级。' },
  { slug: 'design-contract', file: 'skills/reito-ui/references/design-contract.md', title: '设计契约', description: '组件选择、Panel 与 Card、文字角色、内距所有权、表单、会话、主题与禁止事项（英文，随 skill 分发）。' },
  { slug: 'layouts/dashboard', file: 'skills/reito-ui/references/layouts/dashboard.md', title: 'Dashboard 布局参考', description: '带侧栏应用的固定外壳：SidebarProvider → Sidebar → AppShell → WorkspacePreset（英文）。' },
  { slug: 'layouts/settings', file: 'skills/reito-ui/references/layouts/settings.md', title: 'Settings 布局参考', description: '设置、偏好、账户与项目配置页的固定结构（英文）。' },
  { slug: 'design-language', file: 'docs/design-language.md', title: 'Graphite 设计语言', description: 'Token 来源与分层、语义角色、字体密度与尺度、桌面布局与状态。' },
];

const recipes: SourceSpec[] = [
  { slug: 'recipes/dashboard-workspace', file: 'docs/recipes/dashboard-workspace.md', title: 'Dashboard 工作面', description: '用 Sidebar、AppShell、WorkspacePreset、DataTable、Form 与 ApplicationSearch 组合紧凑桌面工作台。' },
  { slug: 'recipes/content-workspace', file: 'docs/recipes/content-workspace.md', title: '内容工作面', description: '阅读、编辑与检查内容的工作面组合。' },
  { slug: 'recipes/dynamic-form', file: 'docs/components/dynamic-form.md', title: '动态条件表单', description: '基于 FormField、AsyncForm 与基础输入的条件字段配方。' },
];

/** Guides whose file name is not a catalog id. */
const guideAliases: Record<string, string> = { 'command-search': 'docs/components/application-search.md' };

const layerInfo = {
  basic: { name: '基础', importPath: '@reito/ui/basic' },
  complex: { name: '复杂', importPath: '@reito/ui/complex' },
  ai: { name: 'AI', importPath: '@reito/ui/ai' },
} as const;

const read = (file: string) => fs.readFileSync(path.join(repoRoot, file), 'utf8').replace(/\r\n/g, '\n');

export function componentTitle(name: string) {
  return name.replace(/\s*[\u3400-\u9fff].*$/u, '').trim() || name;
}

function frontmatter(source: string) {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(source);
  if (!match) return { data: {} as Record<string, string>, content: source };
  const data: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const index = line.indexOf(':');
    if (index > 0) data[line.slice(0, index).trim()] = line.slice(index + 1).trim();
  }
  return { data, content: source.slice(match[0].length) };
}

function stripTitle(markdown: string) {
  const match = /^\s*#\s+(.+)\n/.exec(markdown);
  return match ? { title: match[1].trim(), body: markdown.slice(match[0].length).replace(/^\n+/, '') } : { title: '', body: markdown };
}

/** Rewrites repo-relative links outside fenced code: known docs become site links, the rest GitHub. */
function rewriteLinks(markdown: string, sourceFile: string, fileToSlug: Map<string, string>) {
  let fenced = false;
  return markdown.split('\n').map((line) => {
    if (/^\s*(```|~~~)/.test(line)) { fenced = !fenced; return line; }
    if (fenced) return line;
    return line
      .replace(/https?:\/\/(?:127\.0\.0\.1|localhost):600[67]\/?/g, '{{STORYBOOK_URL}}/')
      .replace(/(!?)\[([^\]]*)\]\(([^)\s]+)((?:\s+"[^"]*")?)\)/g, (all, bang: string, text: string, href: string, title: string) => {
        if (/^(?:[a-z]+:|#|\/|\{\{)/i.test(href)) return all;
        const [target, hash = ''] = href.split('#');
        const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(sourceFile), decodeURI(target)));
        const slug = fileToSlug.get(resolved);
        const anchor = hash ? `#${hash}` : '';
        if (slug && !bang) return `[${text}](/docs/${slug}${anchor}${title})`;
        const url = bang ? `https://raw.githubusercontent.com/reitowo/reito-ui/main/${resolved}` : `${repository}/blob/main/${resolved}${anchor}`;
        return `${bang}[${text}](${url}${title})`;
      });
  }).join('\n');
}

function componentBody(component: DocComponent, guide: string | undefined) {
  const story = component.storyId ? `{{STORYBOOK_URL}}/?path=/story/${encodeURIComponent(component.storyId)}` : undefined;
  const lines = [
    `> ${component.description}`,
    '',
    '| 项 | 内容 |',
    '| --- | --- |',
    `| 名称 | ${component.name} |`,
    `| 层 | ${component.layerName} |`,
    `| 导入入口 | \`${component.importPath}\` |`,
    `| Storybook | ${story ? `[参数调试](${story})（${component.stories} 个 story）` : '—'} |`,
    `| 示例源码 | [${component.sourceFile}](${repository}/blob/main/${component.sourceFile}) |`,
    '',
    `在 [组件库](/gallery/${component.id}) 中打开实时预览，或在 [Lab](/components/${component.id}) 中检查主题与密度。`,
    '',
  ];
  if (guide) lines.push('## 使用指南', '', guide.trim(), '');
  else lines.push('## 使用指南', '', '此组件暂无单独的使用指南。参数、变体与状态以 Storybook 参数调试和随包发布的 TypeScript 声明为准。', '');
  return lines.join('\n');
}

export function loadDocs(): DocsData {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as {
    entries: Array<{ layer: keyof typeof layerInfo; id: string; name: string; description: string; storyId?: string; sourceFile: string; stories: number }>;
  };
  const fileToSlug = new Map<string, string>();
  for (const spec of [...authored, ...guides, ...recipes]) fileToSlug.set(spec.file, spec.slug);
  for (const entry of manifest.entries) {
    fileToSlug.set(guideAliases[entry.id] ?? `docs/components/${entry.id}.md`, `components/${entry.id}`);
  }
  const pages: DocPage[] = [];
  const sections: DocSection[] = [];
  const section = (title: string, slugs: string[]) => sections.push({ title, slugs });

  const startSlugs: string[] = [];
  for (const spec of authored) {
    const { data, content } = frontmatter(read(spec.file));
    const { title, body } = stripTitle(content);
    pages.push({ slug: spec.slug, title: data.title || title, description: data.description || '', section: '开始', source: spec.file, body: rewriteLinks(body, spec.file, fileToSlug) });
    startSlugs.push(spec.slug);
  }
  section('开始', startSlugs);

  for (const [name, specs] of [['指南', guides], ['配方', recipes]] as const) {
    for (const spec of specs) {
      const { body } = stripTitle(read(spec.file));
      pages.push({ slug: spec.slug, title: spec.title, description: spec.description, section: name, source: spec.file, body: rewriteLinks(body, spec.file, fileToSlug) });
    }
    section(name, specs.map((spec) => spec.slug));
  }

  for (const layer of Object.keys(layerInfo) as Array<keyof typeof layerInfo>) {
    const slugs: string[] = [];
    for (const entry of manifest.entries.filter((item) => item.layer === layer)) {
      const component: DocComponent = {
        id: entry.id, layer, layerName: layerInfo[layer].name, importPath: layerInfo[layer].importPath,
        name: entry.name, description: entry.description, storyId: entry.storyId, stories: entry.stories, sourceFile: entry.sourceFile,
      };
      const guideFile = guideAliases[entry.id] ?? `docs/components/${entry.id}.md`;
      const guide = fs.existsSync(path.join(repoRoot, guideFile)) ? rewriteLinks(stripTitle(read(guideFile)).body, guideFile, fileToSlug) : undefined;
      const slug = `components/${entry.id}`;
      pages.push({ slug, title: componentTitle(entry.name), description: entry.description, section: `组件 · ${component.layerName}`, source: guide ? guideFile : entry.sourceFile, body: componentBody(component, guide), component });
      slugs.push(slug);
    }
    section(`组件 · ${layerInfo[layer].name}`, slugs);
  }
  return { pages, sections };
}

export function watchedFiles() {
  return [
    manifestPath,
    ...fs.readdirSync(contentDir).map((file) => path.join(contentDir, file)),
    ...[...guides, ...recipes].map((spec) => path.join(repoRoot, spec.file)),
    ...fs.readdirSync(path.join(repoRoot, 'docs/components')).map((file) => path.join(repoRoot, 'docs/components', file)),
  ];
}

export interface OutputUrls { site: string; storybook: string }

/** Absolute links for agent-facing Markdown; doc links point at their `.md` mirrors. */
export function toMarkdown(page: DocPage, urls: OutputUrls) {
  const header = [`# ${page.title}`, '', page.description ? `${page.description}\n` : '', `网页：${urls.site}/docs/${page.slug} · Markdown：${urls.site}/docs/${page.slug}.md`, ''].join('\n');
  return resolve(`${header}\n${page.body.trim()}\n`, urls);
}

function resolve(markdown: string, urls: OutputUrls) {
  return markdown
    .replaceAll('{{SITE_URL}}', urls.site)
    .replaceAll('{{STORYBOOK_URL}}', urls.storybook)
    .replace(/\]\(\/docs\/([^)#\s]+)(#[^)\s]*)?/g, (_all, slug: string, hash = '') => `](${urls.site}/docs/${slug}.md${hash}`)
    .replace(/\]\(\/(?!\/)/g, `](${urls.site}/`);
}

export function llmsIndex(data: DocsData, urls: OutputUrls) {
  const bySlug = new Map(data.pages.map((page) => [page.slug, page]));
  const lines = [
    '# Reito UI',
    '',
    '> 面向桌面工具的 React 组件库：Graphite 中性灰阶、紧凑控件、基础 / 复杂 / AI 三层组件，基于 shadcn / Base UI 与 Tailwind CSS 4。为你的工具构建一致的界面。',
    '',
    '- 安装：`npm install @reito/ui @reito/tokens`，入口依次引入 `@reito/tokens/css` 与 `@reito/ui/styles.css`，用 `<ReitoThemeProvider root>` 包住应用。',
    '- 普通页面只使用公开组件与语义 token，不写应用 CSS、间距或排版 utility；带侧栏的应用使用 Dashboard 布局参考。',
    '- AI 组件只提供界面与本地状态，不连接模型。',
    `- 每个链接都是 Markdown；整站全文见 ${urls.site}/llms-full.txt。`,
    '',
  ];
  for (const section of data.sections) {
    lines.push(`## ${section.title}`, '');
    for (const slug of section.slugs) {
      const page = bySlug.get(slug)!;
      lines.push(`- [${page.title}](${urls.site}/docs/${slug}.md)${page.description ? `: ${page.description}` : ''}`);
    }
    lines.push('');
  }
  lines.push('## Optional', '', `- [全文](${urls.site}/llms-full.txt): 所有文档与组件页合并为一个文件`, `- [组件库](${urls.site}/gallery): 全部组件的实时预览`, `- [Storybook](${urls.storybook}/): 参数调试与变体`, `- [源码](${repository}): GitHub 仓库`, '');
  return lines.join('\n');
}

export function llmsFull(data: DocsData, urls: OutputUrls) {
  return [
    '# Reito UI — 完整文档',
    '',
    `> 由 ${urls.site}/llms.txt 索引的全部页面。每页以分隔线开始，并标注网页与 Markdown 地址。`,
    '',
    ...data.pages.map((page) => `---\n\n${toMarkdown(page, urls)}`),
  ].join('\n');
}
