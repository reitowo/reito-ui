import fs from 'node:fs';
import path from 'node:path';
import type { Plugin, ResolvedConfig } from 'vite';
import { llmsFull, llmsIndex, loadDocs, toMarkdown, watchedFiles, type OutputUrls } from './docs-pipeline.ts';

const virtualId = 'virtual:reito-docs';
const resolvedId = `\0${virtualId}`;
const trim = (value: string) => value.replace(/\/+$/, '');
const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** Docs content as a virtual module, plus `/llms.txt`, `/llms-full.txt` and `/docs/<slug>.md`. */
export function reitoDocs(): Plugin {
  let config: ResolvedConfig;
  const watched = new Set(watchedFiles().map((file) => path.resolve(file)));

  function files(urls: OutputUrls) {
    const data = loadDocs();
    const output = new Map<string, { body: string; type: string }>();
    output.set('llms.txt', { body: llmsIndex(data, urls), type: 'text/plain; charset=utf-8' });
    output.set('llms-full.txt', { body: llmsFull(data, urls), type: 'text/plain; charset=utf-8' });
    for (const page of data.pages) output.set(`docs/${page.slug}.md`, { body: toMarkdown(page, urls), type: 'text/markdown; charset=utf-8' });
    return { data, output };
  }

  return {
    name: 'reito-docs',
    configResolved(resolved) { config = resolved; },
    resolveId(id) { return id === virtualId ? resolvedId : undefined; },
    load(id) {
      if (id !== resolvedId) return undefined;
      for (const file of watched) this.addWatchFile(file);
      return `export default ${JSON.stringify(loadDocs())};`;
    },
    handleHotUpdate({ file, server }) {
      if (!watched.has(path.resolve(file))) return undefined;
      const module = server.moduleGraph.getModuleById(resolvedId);
      if (module) server.moduleGraph.invalidateModule(module);
      server.ws.send({ type: 'full-reload' });
      return [];
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const base = config.base;
        const url = decodeURIComponent((req.url ?? '').split('?')[0]);
        if (!url.startsWith(base)) return next();
        const key = url.slice(base.length);
        if (key !== 'llms.txt' && key !== 'llms-full.txt' && !(key.startsWith('docs/') && key.endsWith('.md'))) return next();
        const site = trim(`http://${req.headers.host}${base}`);
        const entry = files({ site, storybook: trim(process.env.VITE_STORYBOOK_URL || 'http://127.0.0.1:6007') }).output.get(key);
        if (!entry) return next();
        res.setHeader('Content-Type', entry.type);
        res.end(entry.body);
      });
    },
    closeBundle() {
      if (config.command !== 'build') return;
      const dist = path.resolve(config.root, config.build.outDir);
      const indexPath = path.join(dist, 'index.html');
      if (!fs.existsSync(indexPath)) return;
      const site = trim(process.env.VITE_SITE_URL || 'https://reitowo.github.io/reito-ui');
      const { data, output } = files({ site, storybook: trim(process.env.VITE_STORYBOOK_URL || `${site}/storybook`) });
      for (const [file, entry] of output) {
        fs.mkdirSync(path.dirname(path.join(dist, file)), { recursive: true });
        fs.writeFileSync(path.join(dist, file), entry.body);
      }
      const shell = fs.readFileSync(indexPath, 'utf8');
      const write = (route: string, title: string, description: string, markdown?: string) => {
        const head = [
          `<title>${escape(title)}</title>`,
          `<meta name="description" content="${escape(description)}"/>`,
          markdown ? `<link rel="alternate" type="text/markdown" href="${config.base}${markdown}"/>` : '',
        ].join('');
        const html = shell.replace(/<title>[\s\S]*?<\/title>/, '').replace(/<meta name="description"[^>]*>/, '').replace('</head>', `${head}</head>`);
        fs.mkdirSync(path.join(dist, route), { recursive: true });
        fs.writeFileSync(path.join(dist, route, 'index.html'), html);
      };
      write('docs', '文档 · Reito UI', '安装、主题、页面组合与全部组件文档。', 'docs/introduction.md');
      for (const page of data.pages) write(`docs/${page.slug}`, `${page.title} · Reito UI 文档`, page.description, `docs/${page.slug}.md`);
    },
  };
}
