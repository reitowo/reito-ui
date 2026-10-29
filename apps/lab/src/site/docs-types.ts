export interface DocComponent {
  id: string;
  layer: 'basic' | 'complex' | 'ai';
  layerName: string;
  importPath: string;
  name: string;
  description: string;
  storyId?: string;
  stories: number;
  sourceFile: string;
}

export interface DocPage {
  /** Route under `/docs/`, e.g. `installation` or `components/button`. */
  slug: string;
  title: string;
  description: string;
  section: string;
  /** Repository path of the main source file. */
  source: string;
  /** Markdown without the page title. Links are site-relative (`/docs/...`). */
  body: string;
  component?: DocComponent;
}

export interface DocSection {
  title: string;
  slugs: string[];
}

export interface DocsData {
  pages: DocPage[];
  sections: DocSection[];
}
