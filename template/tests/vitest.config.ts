import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['convex/**/*.test.ts'],
        exclude: ['node_modules', 'e2e/**'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: ['node_modules', 'e2e/**', '**/*.d.ts'],
        },
    },
});
