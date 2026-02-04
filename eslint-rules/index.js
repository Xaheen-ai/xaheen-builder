// @ts-check
/**
 * Xaheen Builder ESLint Rules
 * 
 * Custom ESLint rules to enforce platform-ui patterns in generated code.
 * These rules help maintain design system compliance and prevent
 * raw HTML/Tailwind usage that bypasses the platform-ui abstraction.
 */

import noGlobalFetch from './no-global-fetch.js';
import noRawHtml from './no-raw-html.js';
import noTailwindClasses from './no-tailwind-classes.js';

export const rules = {
    'no-global-fetch': noGlobalFetch,
    'no-raw-html': noRawHtml,
    'no-tailwind-classes': noTailwindClasses,
};

/**
 * Recommended configuration for generated apps
 */
export const configs = {
    recommended: {
        plugins: ['xaheen'],
        rules: {
            'xaheen/no-global-fetch': 'error',
            'xaheen/no-raw-html': 'error',
            'xaheen/no-tailwind-classes': 'error',
        },
    },

    /**
     * Strict configuration - no escape hatches
     */
    strict: {
        plugins: ['xaheen'],
        rules: {
            'xaheen/no-global-fetch': 'error',
            'xaheen/no-raw-html': 'error',
            'xaheen/no-tailwind-classes': 'error',
        },
    },

    /**
     * Lenient configuration - allows some HTML for migration
     */
    lenient: {
        plugins: ['xaheen'],
        rules: {
            'xaheen/no-global-fetch': 'error',
            'xaheen/no-raw-html': ['warn', { allow: ['div', 'span'] }],
            'xaheen/no-tailwind-classes': 'warn',
        },
    },
};

export default {
    rules,
    configs,
};
