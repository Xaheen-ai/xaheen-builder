/**
 * Monitoring App - Entry Point
 *
 * THIN APP PATTERN:
 * - Ops engineers
 * - System health and metrics
 */
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { XalaProviders } from '@xaheen/app-shell';
import '@xala-technologies/platform-ui/styles';
import { App } from './App';

const APP_ID = 'monitoring';

createRoot(document.getElementById('root')!).render(
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
);
