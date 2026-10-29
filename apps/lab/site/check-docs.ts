import assert from 'node:assert/strict';
import { llmsFull, llmsIndex, loadDocs } from './docs-pipeline.ts';

const urls = { site: 'https://reitowo.github.io/reito-ui', storybook: 'https://reitowo.github.io/reito-ui/storybook' };
const data = loadDocs();
const slugs = new Set(data.pages.map((page) => page.slug));
for (const slug of ['introduction', 'installation', 'getting-started', 'theming', 'ai', 'composition', 'components/button']) {
  assert.ok(slugs.has(slug), `missing docs page ${slug}`);
}
const index = llmsIndex(data, urls);
assert.match(index, /# Reito UI/);
assert.match(index, /\/docs\/installation\.md/);
assert.match(index, /\/docs\/components\/button\.md/);
const full = llmsFull(data, urls);
assert.match(full, /# 安装/);
assert.doesNotMatch(full, /127\.0\.0\.1:6006/);
console.log(`docs site: ${data.pages.length} pages, ${data.sections.length} sections`);
