/**
 * Theme registry for runtime tenant branding switching.
 *
 * This module provides theme URLs that allow applications to swap themes
 * by loading CSS files. Themes can be a single file or an array of files
 * (base + extensions). This approach respects Designsystemet's requirement
 * that theme CSS should only be loaded once per application.
 *
 * @example
 * ```typescript
 * import { THEMES, DEFAULT_THEME, getThemeUrls } from '@xaheen/ds-themes';
 *
 * // Get theme URLs (always returns array)
 * const urls = getThemeUrls(DEFAULT_THEME);
 * ```
 */

// Official Digdir themes - using public folder path
const OFFICIAL_THEMES = {
  digdir: '/themes/digdir.css',
  altinn: '/themes/altinn.css',
  uutilsynet: '/themes/uutilsynet.css',
  portal: '/themes/portal.css',
};

// Custom DIGILIST theme: CLI-generated base + app extensions
const DIGILIST_THEME = [
  '/themes/digilist.css',            // CLI-generated base
  '/themes/digilist-extensions.css', // App-specific tokens
];

// Xala Navy theme: CLI-generated base + navy color scheme extensions
const XALA_NAVY_THEME = [
  '/themes/digilist.css',            // CLI-generated base (shared)
  '/themes/xala-navy-extensions.css', // Navy color scheme tokens
];

export type ThemeId = 'digdir' | 'altinn' | 'uutilsynet' | 'portal' | 'digilist' | 'xala-navy';

/**
 * Theme CSS files. Can be single file (string) or multiple files (array).
 * Multiple files are loaded in order: base theme first, then extensions.
 */
export const THEMES: Record<ThemeId, string | string[]> = {
  digdir: OFFICIAL_THEMES.digdir,
  altinn: OFFICIAL_THEMES.altinn,
  uutilsynet: OFFICIAL_THEMES.uutilsynet,
  portal: OFFICIAL_THEMES.portal,
  digilist: DIGILIST_THEME,
  'xala-navy': XALA_NAVY_THEME,
};

/**
 * Get theme URLs as an array (for consistent handling).
 */
export function getThemeUrls(themeId: ThemeId): string[] {
  const theme = THEMES[themeId];
  return Array.isArray(theme) ? theme : [theme];
}

// Xala Navy is the default theme
export const DEFAULT_THEME: ThemeId = 'xala-navy';
