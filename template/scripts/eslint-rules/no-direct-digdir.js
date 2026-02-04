/**
 * ESLint Rule: No Direct Digdir Imports
 * 
 * Enforces UI Guardrails: Platform-UI is the only UI source of truth.
 * Apps must import from @xala-technologies/platform-ui, not directly from Digdir.
 */

const FORBIDDEN_PACKAGES = [
    '@digdir/designsystemet-react',
    '@digdir/designsystemet-css',
    '@digdir/designsystemet-theme',
    '@radix-ui/',
    '@headlessui/',
    'antd',
    '@mui/',
    'shadcn',
    'tailwindcss',
];

module.exports = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Prevent direct Digdir/UI kit imports in apps',
            category: 'UI Guardrails',
        },
        messages: {
            noDirectDigdir:
                "Direct UI kit import '{{package}}' forbidden. Import from @xala-technologies/platform-ui instead. (UI Guardrails: Platform-UI is the only source of truth)",
        },
        schema: [],
    },

    create(context) {
        const filename = context.getFilename();

        // Only enforce in apps/
        if (!filename.includes('/apps/')) {
            return {};
        }

        return {
            ImportDeclaration(node) {
                const source = node.source.value;

                for (const forbidden of FORBIDDEN_PACKAGES) {
                    if (source.startsWith(forbidden) || source.includes(forbidden)) {
                        context.report({
                            node,
                            messageId: 'noDirectDigdir',
                            data: { package: source },
                        });
                        return;
                    }
                }
            },
        };
    },
};
