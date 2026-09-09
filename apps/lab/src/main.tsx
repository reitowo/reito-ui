import React from 'react';
import ReactDOM from 'react-dom/client';
import '@reito/tokens/css';
import '@reito/ui/styles.css';
import { Home } from './Home';
import './app.css';

const Lab = React.lazy(() => import('./App').then(module => ({ default: module.App })));
const showLab = new URLSearchParams(location.search).has('layer') || new URLSearchParams(location.search).has('component');
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><React.Suspense fallback={<p role="status">正在打开组件目录…</p>}>{showLab ? <Lab /> : <Home />}</React.Suspense></React.StrictMode>);
