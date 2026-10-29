import React from 'react';
import ReactDOM from 'react-dom/client';
import '@reito/tokens/css';
import '@reito/ui/styles.css';
import './app.css';
import { adoptLocation } from './routes';

const Home = React.lazy(() => import('./Home').then((module) => ({ default: module.Home })));
const Docs = React.lazy(() => import('./site/Docs').then((module) => ({ default: module.Docs })));
const Gallery = React.lazy(() => import('./site/Gallery').then((module) => ({ default: module.Gallery })));
const Lab = React.lazy(() => import('./App').then((module) => ({ default: module.App })));
const Overview = React.lazy(() => import('./Overview').then((module) => ({ default: module.Overview })));
const ThemeGuide = React.lazy(() => import('./ThemeGuide').then((module) => ({ default: module.ThemeGuide })));
const TemplatesIndex = React.lazy(() => import('./templates/TemplatesIndex').then((module) => ({ default: module.TemplatesIndex })));
const DenseExamples = React.lazy(() => import('./examples/nanchuang').then((module) => ({ default: module.DenseExamples })));
const NanchuangGallery = React.lazy(() => import('./examples/nanchuang').then((module) => ({ default: module.Gallery })));
const Dashboard = React.lazy(() => import('./templates/dashboard/Dashboard').then((module) => ({ default: module.Dashboard })));
const Chat = React.lazy(() => import('./templates/chat/Chat').then((module) => ({ default: module.Chat })));
const Landing = React.lazy(() => import('./templates/landing/Landing').then((module) => ({ default: module.Landing })));
const Preview = React.lazy(() => import('./OverviewPreview').then((module) => ({ default: module.OverviewPreview })));

const route = adoptLocation();

function Site() {
  if (route.name === 'preview') return <Preview />;
  if (route.name === 'docs') return <Docs slug={route.slug} />;
  if (route.name === 'gallery') return <Gallery id={route.id} />;
  if (route.name === 'theme-guide') return <ThemeGuide />;
  if (route.name === 'overview') return <Overview />;
  if (route.name === 'component') return <Lab />;
  if (route.name === 'templates') return <TemplatesIndex />;
  if (route.name === 'template' && route.id === 'dashboard') {
    const page = route.page === 'inbox' || route.page === 'customers' || route.page === 'settings' ? route.page : 'home';
    return <Dashboard page={page} />;
  }
  if (route.name === 'template' && route.id === 'chat') return <Chat />;
  if (route.name === 'template' && route.id === 'landing') return <Landing />;
  if (route.name === 'template' && route.id === 'nanchuang') {
    return route.lockedDensity === 'dense' ? <DenseExamples /> : <NanchuangGallery />;
  }
  return <Home />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <React.Suspense fallback={null}>
      <Site />
    </React.Suspense>
  </React.StrictMode>,
);
