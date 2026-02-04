// @ts-check
/**
 * ESLint rule: no-tailwind-classes
 * 
 * Disallows usage of className prop which typically indicates Tailwind CSS usage.
 * This rule helps enforce the Zero-Local-CSS mandate in the Xala design system.
 * 
 * @type {import('eslint').Rule.RuleModule}
 */

const rule = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow className prop usage (Tailwind CSS) in favor of platform-ui styling',
            category: 'Best Practices',
            recommended: true,
        },
        messages: {
            noClassName: 'The className prop is not allowed. Use platform-ui component props (data-size, data-color, etc.) or design system tokens instead.',
            noTailwindClass: 'Tailwind class "{{className}}" detected. Use platform-ui components and design system tokens instead.',
        },
        schema: [
            {
                type: 'object',
                properties: {
                    allowedPatterns: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Regex patterns for allowed className values',
                    },
                },
                additionalProperties: false,
            },
        ],
    },
    create(context) {
        const options = context.options[0] || {};
        const allowedPatterns = (options.allowedPatterns || []).map(p => new RegExp(p));

        // Common Tailwind class patterns
        const TAILWIND_PATTERNS = [
            /^(flex|grid|block|inline|hidden)$/,
            /^(items|justify|self|place)-/,
            /^(w|h|min-w|min-h|max-w|max-h)-/,
            /^(p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml)-/,
            /^(text|font|leading|tracking)-/,
            /^(bg|border|rounded|shadow|opacity)-/,
            /^(hover|focus|active|disabled):/,
            /^(sm|md|lg|xl|2xl):/,
            /^(gap|space)-/,
            /^(absolute|relative|fixed|sticky)$/,
            /^(top|right|bottom|left|inset)-/,
            /^(z)-/,
            /^(overflow|cursor|pointer-events)-/,
            /^(transition|duration|ease|animate)-/,
        ];

        function isTailwindClass(className) {
            return TAILWIND_PATTERNS.some(pattern => pattern.test(className));
        }

        function isAllowedClassName(value) {
            return allowedPatterns.some(pattern => pattern.test(value));
        }

        return {
            JSXAttribute(node) {
                // Check for className attribute
                if (node.name.name !== 'className') {
                    return;
                }

                const value = node.value;

                // className with no value or spread
                if (!value) {
                    context.report({
                        node,
                        messageId: 'noClassName',
                    });
                    return;
                }

                // String literal className
                if (value.type === 'Literal' && typeof value.value === 'string') {
                    if (isAllowedClassName(value.value)) {
                        return;
                    }

                    // Check for Tailwind classes
                    const classes = value.value.split(/\s+/);
                    const tailwindClasses = classes.filter(isTailwindClass);

                    if (tailwindClasses.length > 0) {
                        context.report({
                            node,
                            messageId: 'noTailwindClass',
                            data: {
                                className: tailwindClasses.slice(0, 3).join(', ') + (tailwindClasses.length > 3 ? '...' : ''),
                            },
                        });
                    } else {
                        context.report({
                            node,
                            messageId: 'noClassName',
                        });
                    }
                    return;
                }

                // Dynamic className (expression)
                if (value.type === 'JSXExpressionContainer') {
                    // For dynamic classNames, we just warn generically
                    context.report({
                        node,
                        messageId: 'noClassName',
                    });
                }
            },
        };
    },
};

export default rule;
