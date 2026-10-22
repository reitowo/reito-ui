export type ExampleMeta = {
  id: string;
  title: string;
  description: string;
  /** Full-screen app. 南窗 keeps `?view=gallery` so existing links stay valid. */
  href: string;
};

const siteBase = import.meta.env.BASE_URL;

/**
 * Apps built with Reito UI. Add a folder under `examples/`, export its screen,
 * append a row here, and register the lazy view in `main.tsx`.
 */
export const examples: ExampleMeta[] = [
  {
    id: 'nanchuang',
    title: '南窗',
    description: '一本虚构城市杂志的编辑室。选题、稿件、审稿、作者和校样共用这一期的数据。',
    href: `${siteBase}?view=gallery`,
  },
];
