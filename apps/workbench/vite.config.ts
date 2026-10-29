import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: [
    { find: /^@reito\/ui\/styles\.css$/, replacement: fileURLToPath(new URL('../../packages/ui/src/styles.css', import.meta.url)) },
    { find: /^@reito\/ui\/basic$/, replacement: fileURLToPath(new URL('../../packages/ui/src/basic.ts', import.meta.url)) },
    { find: /^@reito\/ui\/complex$/, replacement: fileURLToPath(new URL('../../packages/ui/src/complex/index.ts', import.meta.url)) },
    { find: /^@reito\/ui\/ai$/, replacement: fileURLToPath(new URL('../../packages/ui/src/ai/index.ts', import.meta.url)) },
    { find: /^@reito\/ui\/affect$/, replacement: fileURLToPath(new URL('../../packages/ui/src/affect/index.ts', import.meta.url)) },
    { find: /^@reito\/ui$/, replacement: fileURLToPath(new URL('../../packages/ui/src/index.ts', import.meta.url)) },
  ] },
});
