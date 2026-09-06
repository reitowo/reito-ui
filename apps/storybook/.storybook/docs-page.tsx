import { useContext, useEffect, useState } from 'react';
import { ArgTypes, Controls, Description, DocsContext, Primary, Source, Subtitle, Title, useOf } from '@storybook/addon-docs/blocks';
import { GLOBALS_UPDATED } from 'storybook/internal/core-events';
import type { Globals } from 'storybook/internal/types';

function IsolatedExample() {
  const { story } = useOf('story', ['story']);
  const context = useContext(DocsContext);
  const [globals, setGlobals] = useState(() => context.getStoryContext(story).globals);
  useEffect(() => {
    setGlobals(context.getStoryContext(story).globals);
    const update = ({ globals: next }: { globals: Globals }) => setGlobals(next);
    context.channel.on(GLOBALS_UPDATED, update);
    return () => { context.channel.off(GLOBALS_UPDATED, update); };
  }, [context, story]);
  // Storybook's built-in docs iframe omits globals from its URL. Pass the two
  // visual globals explicitly so portaled examples follow the docs toolbar.
  const theme = globals.theme === 'light' ? 'light' : 'dark';
  const density = globals.density === 'comfortable' ? 'comfortable' : 'compact';
  const query = new URLSearchParams({ id: story.id, viewMode: 'story', globals: `theme:${theme};density:${density}` });
  return <>
    <div className="sbdocs-preview"><iframe className="sb-isolated-preview" title={story.name} src={`iframe.html?${query}`} /></div>
    <Source />
  </>;
}

export function ComponentDocs() {
  const { story } = useOf('story', ['story']);
  const isolated = story.parameters.docs?.story?.inline === false;
  return <>
    <Title />
    <Subtitle />
    <Description />
    <p>打开“参数调试”，在 Controls 中直接调整 props，预览会实时更新。左侧变体是预设，便于对照和分享。</p>
    {isolated ? <><IsolatedExample /><ArgTypes /></> : <><Primary /><Controls /></>}
  </>;
}
