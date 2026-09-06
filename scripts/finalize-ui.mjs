import { readFile, writeFile } from 'node:fs/promises';
const path = new URL('../packages/ui/dist/index.d.ts', import.meta.url);
const declaration = await readFile(path, 'utf8');
// Vite emits styles.css; consumers explicitly import the public CSS export.
// Type declarations should not require a framework's wildcard CSS module declaration.
await writeFile(path, declaration.replace(/^import ['"]\.\/styles\.css['"];?\r?\n/gm, ''));
