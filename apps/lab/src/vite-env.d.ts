/// <reference types="vite/client" />

declare module 'virtual:reito-docs' {
  import type { DocsData } from './site/docs-types';
  const data: DocsData;
  export default data;
}
