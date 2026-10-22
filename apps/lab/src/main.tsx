import React from 'react';
import ReactDOM from 'react-dom/client';
import '@reito/tokens/css';
import '@reito/ui/styles.css';
const Home = React.lazy(() => import('./Home').then(module => ({ default: module.Home })));
import './app.css';

const Lab = React.lazy(() => import('./App').then(module => ({ default: module.App })));
const Overview = React.lazy(() => import('./Overview').then(module => ({ default: module.Overview })));
const ThemeGuide = React.lazy(() => import('./ThemeGuide').then(module => ({ default: module.ThemeGuide })));
const ExamplesIndex = React.lazy(() => import('./examples/ExamplesIndex').then(module => ({ default: module.ExamplesIndex })));
const DenseExamples = React.lazy(() => import('./examples/nanchuang').then(module => ({ default: module.DenseExamples })));
const Gallery = React.lazy(() => import('./examples/nanchuang').then(module => ({ default: module.Gallery })));
const Preview = React.lazy(() => import('./OverviewPreview').then(module => ({ default: module.OverviewPreview })));
const params = new URLSearchParams(location.search);
const showLab = new URLSearchParams(location.search).has('layer') || new URLSearchParams(location.search).has('component');
const view = params.get('view');
const example = params.get('example');
/** Full-screen example apps. `?view=gallery` stays the stable address for 南窗. */
const exampleApps: Record<string, typeof Gallery> = { nanchuang: Gallery };
const ExampleApp = example ? exampleApps[example] : undefined;

function Site() {
  if (params.has('preview')) return <Preview />;
  if (view === 'theme-guide') return <ThemeGuide />;
  if (view === 'dense') return <DenseExamples />;
  if (view === 'gallery') return <Gallery />;
  if (view === 'examples' && ExampleApp) return <ExampleApp />;
  if (view === 'examples') return <ExamplesIndex />;
  if (view === 'overview') return <Overview />;
  if (showLab) return <Lab />;
  return <Home />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <React.Suspense fallback={null}>
      <Site />
    </React.Suspense>
  </React.StrictMode>,
);
