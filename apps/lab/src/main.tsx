import React from 'react';
import ReactDOM from 'react-dom/client';
import '@reito/tokens/css';
import '@reito/ui/styles.css';
const Home = React.lazy(() => import('./Home').then(module => ({ default: module.Home })));
import './app.css';

const Lab = React.lazy(() => import('./App').then(module => ({ default: module.App })));
const Overview = React.lazy(() => import('./Overview').then(module => ({ default: module.Overview })));
const ThemeGuide = React.lazy(() => import('./ThemeGuide').then(module => ({ default: module.ThemeGuide })));
const DenseExamples = React.lazy(() => import('./DenseExamples').then(module => ({ default: module.DenseExamples })));
const Gallery = React.lazy(() => import('./Gallery').then(module => ({ default: module.Gallery })));
const Preview = React.lazy(() => import('./OverviewPreview').then(module => ({ default: module.OverviewPreview })));
const params = new URLSearchParams(location.search);
const showLab = new URLSearchParams(location.search).has('layer') || new URLSearchParams(location.search).has('component');
const view = params.get('view');
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <React.Suspense fallback={null}>
      {params.has('preview') ? <Preview /> : view === 'theme-guide' ? <ThemeGuide /> : view === 'gallery' ? <Gallery /> : view === 'dense' ? <DenseExamples /> : view === 'overview' ? <Overview /> : showLab ? <Lab /> : <Home />}
    </React.Suspense>
  </React.StrictMode>,
);
