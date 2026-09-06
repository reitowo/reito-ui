import React from 'react';
import ReactDOM from 'react-dom/client';
import '@reito/tokens/css';
import '@reito/ui/styles.css';
import { App } from './App';
import './app.css';

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
