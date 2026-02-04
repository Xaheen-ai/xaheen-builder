import { defineConfig } from 'vitepress';

export default defineConfig({
    title: 'Xaheen',
    description: 'Multi-tenant Backend-as-a-Service on Convex',

    head: [
        ['link', { rel: 'icon', href: '/favicon.ico' }],
    ],

    themeConfig: {
        logo: '/logo.svg',

        nav: [
            { text: 'Guide', link: '/guide/' },
            { text: 'API', link: '/api/' },
            { text: 'SDK', link: '/sdk/' },
            { text: 'Schema', link: '/database/' },
        ],

        sidebar: {
            '/guide/': [
                {
                    text: 'Getting Started',
                    items: [
                        { text: 'Introduction', link: '/guide/' },
                        { text: 'Quick Start', link: '/guide/quick-start' },
                        { text: 'Architecture', link: '/guide/architecture' },
                    ],
                },
                {
                    text: 'Core Concepts',
                    items: [
                        { text: 'Multi-Tenancy', link: '/guide/multi-tenancy' },
                        { text: 'Authentication', link: '/guide/authentication' },
                        { text: 'Authorization (RBAC)', link: '/guide/authorization' },
                        { text: 'Feature Flags', link: '/guide/feature-flags' },
                    ],
                },
                {
                    text: 'Advanced',
                    items: [
                        { text: 'Billing & Entitlements', link: '/guide/billing' },
                        { text: 'Governance', link: '/guide/governance' },
                        { text: 'Realtime Events', link: '/guide/realtime' },
                    ],
                },
            ],
            '/api/': [
                {
                    text: 'Functions',
                    items: [
                        { text: 'Overview', link: '/api/' },
                        { text: 'Functions Reference', link: '/CONVEX_FUNCTIONS' },
                        { text: 'RBAC', link: '/api/rbac' },
                        { text: 'Auth', link: '/api/auth' },
                        { text: 'Feature Flags', link: '/api/flags' },
                        { text: 'Billing', link: '/api/billing' },
                        { text: 'GraphQL', link: '/api/graphql' },
                        { text: 'Governance', link: '/api/governance' },
                    ],
                },
            ],
            '/sdk/': [
                {
                    text: 'SDK Reference',
                    items: [
                        { text: 'Installation', link: '/sdk/' },
                        { text: 'XalaClient', link: '/sdk/client' },
                        { text: 'Queries', link: '/sdk/queries' },
                        { text: 'Mutations', link: '/sdk/mutations' },
                        { text: 'Realtime', link: '/sdk/realtime' },
                        { text: 'Error Handling', link: '/sdk/errors' },
                    ],
                },
            ],
            '/database/': [
                {
                    text: 'Database',
                    items: [
                        { text: 'Schema Overview', link: '/database/' },
                    ],
                },
            ],
        },

        socialLinks: [
            { icon: 'github', link: 'https://github.com/xala/xalabase' },
        ],

        footer: {
            message: 'MIT License',
            copyright: 'Copyright © 2024-2026 Xala Technologies',
        },

        search: {
            provider: 'local',
        },
    },
});
