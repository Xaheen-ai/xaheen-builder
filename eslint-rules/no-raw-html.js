// @ts-check
/**
 * ESLint rule: no-raw-html
 * 
 * Disallows usage of raw HTML elements in JSX that should use platform-ui components.
 * This rule helps enforce the Zero-Raw-HTML mandate in the Xala design system.
 * 
 * @type {import('eslint').Rule.RuleModule}
 */

const RAW_HTML_ELEMENTS = new Set([
    // Layout elements that should use Stack/Grid/Box
    'div',
    'section',
    'article',
    'aside',
    'main',
    'nav',
    'header',
    'footer',

    // Typography elements that should use Heading/Paragraph/Text
    'span',
    'p',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'strong', 'b', 'em', 'i',

    // Interactive elements that should use Button/Link
    'button',
    'a',

    // Form elements that should use Textfield/Checkbox/Select
    'input',
    'textarea',
    'select',
    'option',

    // List elements that should use List/List.Item
    'ul', 'ol', 'li',

    // Table elements that should use Table/DataTable
    'table', 'thead', 'tbody', 'tr', 'th', 'td',

    // Other elements
    'hr',
    'img',
    'pre',
    'code',
]);

const ELEMENT_REPLACEMENTS = {
    'div': 'Stack, Grid, or Box',
    'section': 'SectionCard',
    'article': 'Card',
    'aside': 'Sidebar or RightDrawer',
    'main': 'PageShell',
    'nav': 'NavigationMenu',
    'header': 'Stack with as="header"',
    'footer': 'Stack with as="footer"',
    'span': 'Text',
    'p': 'Paragraph',
    'h1': 'Heading level={1}',
    'h2': 'Heading level={2}',
    'h3': 'Heading level={3}',
    'h4': 'Heading level={4}',
    'h5': 'Heading level={5}',
    'h6': 'Heading level={6}',
    'strong': 'Text weight="medium"',
    'b': 'Text weight="medium"',
    'em': 'Text fontStyle="italic"',
    'i': 'Text fontStyle="italic"',
    'button': 'Button',
    'a': 'Link or Button variant="link"',
    'input': 'Textfield, Checkbox, or NumberInput',
    'textarea': 'Textarea',
    'select': 'Select or SearchableSelect',
    'ul': 'List',
    'ol': 'List ordered',
    'li': 'List.Item',
    'table': 'Table or DataTable',
    'hr': 'Divider',
    'img': 'Image (from platform-ui)',
    'pre': 'CodeBlock',
    'code': 'Code',
};

const rule = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow raw HTML elements that should use platform-ui components',
            category: 'Best Practices',
            recommended: true,
        },
        messages: {
            noRawHtml: 'Raw HTML element <{{element}}> is not allowed. Use {{replacement}} from @xala-technologies/platform-ui instead.',
            noRawHtmlGeneric: 'Raw HTML element <{{element}}> is not allowed. Use a platform-ui component instead.',
        },
        schema: [
            {
                type: 'object',
                properties: {
                    allow: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'List of HTML elements to allow (for escape hatches)',
                    },
                },
                additionalProperties: false,
            },
        ],
    },
    create(context) {
        const options = context.options[0] || {};
        const allowedElements = new Set(options.allow || []);

        return {
            JSXOpeningElement(node) {
                const elementName = node.name.name;

                // Skip if not a raw HTML element (e.g., custom components start with uppercase)
                if (!elementName || typeof elementName !== 'string') {
                    return;
                }

                // Skip if element starts with uppercase (React component)
                if (elementName[0] === elementName[0].toUpperCase()) {
                    return;
                }

                // Skip if explicitly allowed
                if (allowedElements.has(elementName)) {
                    return;
                }

                // Check if it's a forbidden raw HTML element
                if (RAW_HTML_ELEMENTS.has(elementName)) {
                    const replacement = ELEMENT_REPLACEMENTS[elementName];

                    context.report({
                        node,
                        messageId: replacement ? 'noRawHtml' : 'noRawHtmlGeneric',
                        data: {
                            element: elementName,
                            replacement: replacement || 'a platform-ui component',
                        },
                    });
                }
            },
        };
    },
};

export default rule;
