import React from 'react';
import { DesignsystemetProvider } from '@xaheen/ds';
/**
 * Example showing correct usage of DesignsystemetProvider.
 *
 * The provider should be placed at the root of your application to manage
 * theme, color scheme, and size settings for all child components.
 */
export function AppLayout({ children }) {
    const [theme, setTheme] = React.useState('digdir');
    const [colorScheme, setColorScheme] = React.useState('auto');
    const [size, setSize] = React.useState('md');
    return (<DesignsystemetProvider theme={theme} colorScheme={colorScheme} size={size}>
      {children}
    </DesignsystemetProvider>);
}
/**
 * Alternative approach: Setting data attributes directly on the HTML root.
 *
 * This achieves the same effect as the provider but gives you direct
 * control over the DOM attributes. Useful for integration with
 * non-React parts of your application.
 */
export function RootAttributes() {
    React.useEffect(() => {
        // You can also set these directly on document.documentElement
        document.documentElement.setAttribute('data-color-scheme', 'auto');
        document.documentElement.setAttribute('data-size', 'md');
        document.documentElement.setAttribute('data-typography', 'primary');
    }, []);
    return null;
}
/**
 * Import guidelines:
 *
 * - WRONG: Importing Designsystemet CSS directly in app components
 * - WRONG: Importing theme CSS files in components
 * - CORRECT: Import styles once in your application's entry point (main.tsx)
 *
 * @example
 * ```typescript
 * // In main.tsx - import once
 * import '@xaheen/ds/styles';
 * ```
 */
