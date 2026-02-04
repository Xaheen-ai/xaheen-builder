/**
 * ESLint Rule: No Hardcoded Strings
 * 
 * Enforces Localization Guardrails: No hardcoded user-facing strings.
 * All user-facing strings must use t() or Trans component.
 */

// Attributes that require localization
const LOCALIZED_ATTRIBUTES = [
    'aria-label',
    'aria-describedby',
    'title',
    'placeholder',
    'alt',
];

// Attributes that are NOT user-facing (allow hardcoded)
const ALLOWED_ATTRIBUTES = [
    'data-testid',
    'data-cy',
    'id',
    'className',
    'name',
    'type',
    'href',
    'src',
    'role',
    'key',
];

module.exports = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Prevent hardcoded user-facing strings',
            category: 'Localization Guardrails',
        },
        messages: {
            noHardcodedString:
                "Hardcoded string forbidden. Use t('key') for localization. (Localization Guardrails: No Hardcoded Strings Rule)",
            noHardcodedAttribute:
                "Hardcoded '{{attr}}' forbidden. Use t('key') for localization. (Localization Guardrails)",
        },
        schema: [],
    },

    create(context) {
        const filename = context.getFilename();

        // Skip test files
        if (
            filename.includes('.test.') ||
            filename.includes('.spec.') ||
            filename.includes('__tests__')
        ) {
            return {};
        }

        // Only enforce in apps/
        if (!filename.includes('/apps/')) {
            return {};
        }

        return {
            // Check JSX text content
            JSXText(node) {
                const text = node.value.trim();

                // Skip whitespace-only or empty
                if (!text || /^[\s\n]*$/.test(text)) {
                    return;
                }

                // Skip if it's just punctuation or special chars
                if (/^[.,;:!?()[\]{}<>\/\\|@#$%^&*+=~`'"_-]+$/.test(text)) {
                    return;
                }

                // Skip numbers only
                if (/^\d+$/.test(text)) {
                    return;
                }

                context.report({
                    node,
                    messageId: 'noHardcodedString',
                });
            },

            // Check attributes that need localization
            JSXAttribute(node) {
                if (!node.name || !node.name.name) return;

                const attrName = node.name.name;

                // Check if this attribute needs localization
                if (!LOCALIZED_ATTRIBUTES.includes(attrName)) {
                    return;
                }

                // Check if value is a string literal
                if (node.value && node.value.type === 'Literal' && typeof node.value.value === 'string') {
                    context.report({
                        node,
                        messageId: 'noHardcodedAttribute',
                        data: { attr: attrName },
                    });
                }
            },
        };
    },
};
