import React from 'react';
import ReactDOM from 'react-dom/client';
import { XalaConvexProvider } from '@xaheen/sdk';

// ✅ Single import point for Designsystemet CSS (required).
import '@xaheen/ds/styles';

// Minimal global font settings (recommended by Designsystemet).
import './root.css';

import { App } from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <XalaConvexProvider>
      <App />
    </XalaConvexProvider>
  </React.StrictMode>,
);
