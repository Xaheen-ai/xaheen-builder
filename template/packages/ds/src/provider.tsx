/**
 * React provider for managing Designsystemet theme and styling.
 *
 * This provider handles runtime theme switching by managing <link>
 * elements in the document head. It supports themes with multiple CSS
 * files (base + extensions) and sets data attributes for color scheme,
 * size, and typography preferences.
 *
 * @example
 * ```tsx
 * import { DesignsystemetProvider } from '@xaheen/ds';
 *
 * function App() {
 *   return (
 *     <DesignsystemetProvider theme="digdir" colorScheme="auto" size="auto">
 *       <YourApp />
 *     </DesignsystemetProvider>
 *   );
 * }
 * ```
 */
import React from 'react';
import { DEFAULT_THEME, getThemeUrls, type ThemeId } from '@xaheen/ds-themes';

/**
 * Available color scheme options for the design system.
 */
export type ColorScheme = 'light' | 'dark' | 'auto';

/**
 * Available size modes for component scaling.
 * 'auto' enables viewport-based responsive switching.
 */
export type DsSize = 'sm' | 'md' | 'lg' | 'auto';

/**
 * Available typography presets.
 */
export type Typography = 'primary' | 'secondary';

/**
 * Props for the DesignsystemetProvider component.
 */
export type DesignsystemetProviderProps = {
  /** Child components to be wrapped */
  children: React.ReactNode;
  /** Theme identifier for tenant branding */
  theme?: ThemeId;
  /** Color scheme preference */
  colorScheme?: ColorScheme;
  /** Component size mode */
  size?: DsSize;
  /** Typography preset */
  typography?: Typography;
  /**
   * Element type to render as the wrapper. Defaults to 'div'.
   * Use 'html' or 'body' to set attributes directly on document elements.
   */
  rootAs?: keyof JSX.IntrinsicElements;
};

const THEME_LINK_DATA_ATTR = 'data-xala-theme-link';

/**
 * Ensures theme CSS link elements exist in the document head.
 *
 * This function creates or updates <link> elements for the theme CSS.
 * It supports multiple CSS files per theme (base + extensions).
 * Old links are removed when switching themes to prevent conflicts.
 *
 * @param hrefs - Array of URLs for theme CSS files
 */
function ensureThemeLinks(hrefs: string[]): void {
  const head = document.head;

  // Remove existing theme links
  head.querySelectorAll(`link[${THEME_LINK_DATA_ATTR}]`).forEach((el) => {
    el.remove();
  });

  // Add new theme links in order (base first, then extensions)
  hrefs.forEach((href, index) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.setAttribute(THEME_LINK_DATA_ATTR, String(index));
    head.appendChild(link);
  });
}

/**
 * React provider component for Designsystemet theming.
 *
 * Manages theme loading through dynamic <link> elements and applies
 * data attributes for styling variations. Theme changes are applied
 * instantly without page reload. Supports themes with multiple CSS
 * files (e.g., CLI-generated base + app extensions).
 *
 * @param props - Provider configuration props
 * @returns JSX element with theme context
 */
export function DesignsystemetProvider({
  children,
  theme = DEFAULT_THEME,
  colorScheme = 'auto',
  size = 'auto',
  typography = 'primary',
  rootAs: Root = 'div',
}: DesignsystemetProviderProps) {
  React.useEffect(() => {
    const urls = getThemeUrls(theme);
    ensureThemeLinks(urls);

    // Also set attributes on html element for CSS targeting
    document.documentElement.setAttribute('data-color-scheme', colorScheme);
    document.documentElement.setAttribute('data-size', size);
    document.documentElement.setAttribute('data-typography', typography);
  }, [theme, colorScheme, size, typography]);

  return (
    <Root
      data-color-scheme={colorScheme}
      data-size={size}
      data-typography={typography}
    >
      {children}
    </Root>
  );
}
