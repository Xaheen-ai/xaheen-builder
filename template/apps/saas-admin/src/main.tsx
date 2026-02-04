/**
 * Backoffice App - Entry Point
 *
 * THIN APP PATTERN:
 * - Platform admin portal
 * - Provider composition only
 * - Routes defined in App.tsx
 */
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { XalaProviders } from '@xaheen/app-shell';
import { XalaConvexProvider } from '@xaheen/sdk';
import '@xala-technologies/platform-ui/styles';
import { App } from './App';

const APP_ID = 'backoffice';

createRoot(document.getElementById('root')!).render(
    <XalaConvexProvider>
        <XalaProviders
            appId={APP_ID}
            defaultLocale="nb"
        >
            <BrowserRouter
                future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true,
                }}
            >
                <App />
            </BrowserRouter>
        </XalaProviders>
    </XalaConvexProvider>
);
