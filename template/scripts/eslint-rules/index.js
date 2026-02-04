/**
 * Architecture Contract ESLint Rules
 *
 * These rules enforce the XalaBaaS Architecture Contracts:
 * - APP_ARCHITECTURE_CONTRACT.md
 * - UI_GUARDRAILS_CONTRACT.md (including RTL + Localization)
 *
 * Rules:
 * - sdk-usage-contract: Enforce SDK namespace restrictions per app
 * - no-domain-ui-in-backoffice: Prevent domain UI in backoffice
 * - no-css-in-apps: Prevent CSS file imports in apps
 * - no-direct-digdir: Prevent direct Digdir/UI kit imports
 * - no-hardcoded-strings: Prevent hardcoded user-facing strings
 */

module.exports = {
    rules: {
        'sdk-usage-contract': require('./sdk-usage-contract'),
        'no-domain-ui-in-backoffice': require('./no-domain-ui-in-backoffice'),
        'no-css-in-apps': require('./no-css-in-apps'),
        'no-direct-digdir': require('./no-direct-digdir'),
        'no-hardcoded-strings': require('./no-hardcoded-strings'),
    },
};
