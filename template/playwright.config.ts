import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests/e2e',
    testMatch: '**/*.spec.ts',
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: 1,
    reporter: 'list',

    use: {
        baseURL: process.env.VITE_CONVEX_URL ?? 'https://localhost.convex.cloud',
        trace: 'on-first-retry',
    },

    projects: [
        {
            name: 'api-tests',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});
