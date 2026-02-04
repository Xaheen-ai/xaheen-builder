import React from 'react';
import ReactDOM from 'react-dom/client';
import { XalaConvexProvider } from '@xaheen/sdk';

import '@xaheen/ds/styles';
import './root.css';
import { App } from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <XalaConvexProvider>
      <App />
    </XalaConvexProvider>
  </React.StrictMode>,
);
