import { addons } from 'storybook/manager-api';

addons.setConfig({
  showPanel: true,
  selectedPanel: 'controls',
  // Translate the label, not defaultName: the latter changes existing --docs URLs.
  sidebar: { renderLabel: item => item.type === 'docs' ? '使用文档' : item.name },
});
