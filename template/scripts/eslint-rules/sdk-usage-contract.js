/**
 * ESLint Rule: SDK Usage Contract Enforcement
 * 
 * Enforces the App Architecture Contract's SDK namespace restrictions.
 * Each app type can only import from allowed SDK namespaces.
 * 
 * Run: eslint --rulesdir scripts/eslint-rules
 */

const path = require('path');

// SDK Usage Contract from APP_ARCHITECTURE_CONTRACT.md
const SDK_ALLOWED = {
    backoffice: ['tenant', 'modules', 'billing', 'governance', 'ops', 'auth'],
    dashboard: ['digilist', 'tenant', 'audit', 'auth'], // <domain>.* resolves to known domains
    web: ['digilist', 'auth'], // <domain>.public.* + auth
    docs: ['docs', 'audit'],
    monitoring: ['ops', 'audit', 'events'],
};

// Known domain modules (expand as domains are added)
const KNOWN_DOMAINS = ['digilist', 'monitoring', 'docs'];

module.exports = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Enforce SDK Usage Contract per app type',
            category: 'Architecture',
        },
        messages: {
            forbiddenImport:
                "App '{{app}}' cannot import from SDK namespace '{{namespace}}'. Allowed: {{allowed}}",
        },
        schema: [],
    },

    create(context) {
        const filename = context.getFilename();

        // Determine which app we're in
        const appMatch = filename.match(/apps\/(backoffice|dashboard|web|docs|monitoring)\//);
        if (!appMatch) {
            return {}; // Not in an app, skip
        }

        const appType = appMatch[1];
        const allowed = SDK_ALLOWED[appType] || [];

        return {
            ImportDeclaration(node) {
                const source = node.source.value;

                // Only check @xaheen/sdk imports
                if (!source.startsWith('@xaheen/sdk')) {
                    return;
                }

                // Extract namespace from import path
                // e.g., '@xaheen/sdk/tenant' -> 'tenant'
                // e.g., '@xaheen/sdk/digilist/bookings' -> 'digilist'
                const parts = source.replace('@xaheen/sdk/', '').split('/');
                const namespace = parts[0];

                if (!namespace) {
                    return; // Root import, allow
                }

                // Check if namespace is allowed for this app
                const isAllowed = allowed.some((allowedNs) => {
                    if (allowedNs === namespace) return true;
                    // Handle domain wildcards
                    if (KNOWN_DOMAINS.includes(namespace) && allowed.includes(namespace)) return true;
                    return false;
                });

                if (!isAllowed) {
                    context.report({
                        node,
                        messageId: 'forbiddenImport',
                        data: {
                            app: appType,
                            namespace,
                            allowed: allowed.join(', '),
                        },
                    });
                }
            },
        };
    },
};
