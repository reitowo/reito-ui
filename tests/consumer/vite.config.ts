import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// Public built package exports only. No Tailwind plugin, source alias or application stylesheet.
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [react()],
  build: { outDir: '../../.dev/consumer-dist', emptyOutDir: true },
});
