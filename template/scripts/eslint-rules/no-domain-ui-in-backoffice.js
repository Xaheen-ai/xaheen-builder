/**
 * ESLint Rule: No Domain UI in Backoffice
 * 
 * Enforces the Domain App Rule: backoffice never contains domain-specific UI.
 */

// Known domain UI packages (expand as domains are added)
const DOMAIN_UI_PACKAGES = [
    '@xaheen/digilist-ui',
    'digilist-ui',
    // Add future domain UI packages here
];

module.exports = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Prevent domain UI imports in backoffice',
            category: 'Architecture',
        },
        messages: {
            noDomainUiInBackoffice:
                "Backoffice cannot import domain UI '{{package}}'. Domain UI belongs in dashboard/web. (Domain App Rule)",
        },
        schema: [],
    },

    create(context) {
        const filename = context.getFilename();

        // Only enforce in backoffice app
        if (!filename.includes('/apps/backoffice/')) {
            return {};
        }

        return {
            ImportDeclaration(node) {
                const source = node.source.value;

                for (const pkg of DOMAIN_UI_PACKAGES) {
                    if (source.includes(pkg)) {
                        context.report({
                            node,
                            messageId: 'noDomainUiInBackoffice',
                            data: { package: source },
                        });
                    }
                }
            },
        };
    },
};
