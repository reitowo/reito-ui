import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { staticSitePaths } from './src/routes.ts';
import { reitoDocs } from './site/docs-plugin.ts';

/** GitHub Pages has no SPA fallback. Copy the shell to 404.html and known routes. */
function prerenderSite(): Plugin {
  return {
    name: 'prerender-lab-routes',
    apply: 'build',
    closeBundle() {
      const dist = fileURLToPath(new URL('./dist', import.meta.url));
      const indexPath = path.join(dist, 'index.html');
      if (!fs.existsSync(indexPath)) return;
      const index = fs.readFileSync(indexPath);
      fs.writeFileSync(path.join(dist, '404.html'), index);
      const manifest = JSON.parse(fs.readFileSync(fileURLToPath(new URL('./src/catalog-manifest.json', import.meta.url)), 'utf8')) as { entries: { id: string }[] };
      const ids = [...new Set(manifest.entries.map((entry) => entry.id))];
      for (const route of staticSitePaths(ids)) {
        const dir = path.join(dist, route);
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, 'index.html'), index);
      }
    },
  };
}

export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react(), tailwindcss(), prerenderSite(), reitoDocs()],
  resolve: { alias: [
    { find: /^@reito\/ui\/styles\.css$/, replacement: fileURLToPath(new URL('../../packages/ui/src/styles.css', import.meta.url)) },
    { find: /^@reito\/ui\/basic$/, replacement: fileURLToPath(new URL('../../packages/ui/src/basic.ts', import.meta.url)) },
    { find: /^@reito\/ui\/ai$/, replacement: fileURLToPath(new URL('../../packages/ui/src/ai/index.ts', import.meta.url)) },
    { find: /^@reito\/ui\/complex$/, replacement: fileURLToPath(new URL('../../packages/ui/src/complex/index.ts', import.meta.url)) },
    { find: /^@reito\/ui\/affect$/, replacement: fileURLToPath(new URL('../../packages/ui/src/affect/index.ts', import.meta.url)) },
    { find: /^@reito\/ui$/, replacement: fileURLToPath(new URL('../../packages/ui/src/index.ts', import.meta.url)) },
  ] },
});
