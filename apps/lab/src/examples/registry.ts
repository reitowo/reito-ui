import { sitePath, templates } from '../routes';

export type ExampleMeta = {
  id: string;
  title: string;
  description: string;
  href: string;
};

/** Full-screen apps. Paths are canonical; old `?view=` links rewrite on load. */
export const examples: ExampleMeta[] = templates.map((item) => ({
  id: item.id,
  title: item.title,
  description: item.description,
  href: item.pages.length > 1 ? sitePath(`templates/${item.id}/${item.defaultPage}`) : sitePath(`templates/${item.id}`),
}));
