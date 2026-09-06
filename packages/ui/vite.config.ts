import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    lib: { entry: Object.fromEntries(Object.entries({index:'index.ts',basic:'basic.ts',complex:'complex/index.ts',ai:'ai/index.ts'}).map(([name,path]) => [name,fileURLToPath(new URL(`./src/${path}`, import.meta.url))])), formats: ['es'], fileName: (_format, name) => `${name}.js`, cssFileName: 'styles' },
    rolldownOptions: { external: (id) => !id.startsWith('.') && !id.startsWith('/') && !id.includes(':') },
  },
});
