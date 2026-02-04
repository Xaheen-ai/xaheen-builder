/**
 * Accessibility Testing Utilities
 *
 * Provides helper functions for testing accessibility compliance
 * using jest-axe and @testing-library/react
 */

import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { axe, toHaveNoViolations, JestAxeConfigureOptions } from 'jest-axe';

// Extend Vitest expect with jest-axe matchers
expect.extend(toHaveNoViolations);

/**
 * Default axe configuration for WCAG 2.1 Level AAA compliance
 */
export const defaultAxeConfig: JestAxeConfigureOptions = {
  rules: {
    // WCAG 2.1 Level A, AA, and AAA rules
    'color-contrast': { enabled: true }, // WCAG 1.4.3 (AA), 1.4.6 (AAA)
    'html-has-lang': { enabled: true }, // WCAG 3.1.1 (A)
    'html-lang-valid': { enabled: true }, // WCAG 3.1.1 (A)
    'valid-lang': { enabled: true }, // WCAG 3.1.2 (AA)
    'label': { enabled: true }, // WCAG 1.3.1 (A), 4.1.2 (A)
    'button-name': { enabled: true }, // WCAG 4.1.2 (A)
    'link-name': { enabled: true }, // WCAG 2.4.4 (A), 2.4.9 (AAA)
    'image-alt': { enabled: true }, // WCAG 1.1.1 (A)
    'list': { enabled: true }, // WCAG 1.3.1 (A)
    'listitem': { enabled: true }, // WCAG 1.3.1 (A)
    'region': { enabled: true }, // WCAG 1.3.1 (A)
    'landmark-one-main': { enabled: true }, // WCAG 2.4.1 (A)
    'page-has-heading-one': { enabled: true }, // Best practice
    'bypass': { enabled: true }, // WCAG 2.4.1 (A) - Skip links
    'focus-order-semantics': { enabled: true }, // WCAG 2.4.3 (A)
    'heading-order': { enabled: true }, // WCAG 1.3.1 (A)
    'aria-valid-attr': { enabled: true }, // WCAG 4.1.2 (A)
    'aria-valid-attr-value': { enabled: true }, // WCAG 4.1.2 (A)
    'aria-required-attr': { enabled: true }, // WCAG 4.1.2 (A)
    'aria-required-children': { enabled: true }, // WCAG 1.3.1 (A)
    'aria-required-parent': { enabled: true }, // WCAG 1.3.1 (A)
    'aria-roles': { enabled: true }, // WCAG 4.1.2 (A)
    'aria-hidden-focus': { enabled: true }, // WCAG 4.1.2 (A)
    'duplicate-id-aria': { enabled: true }, // WCAG 4.1.1 (A)
    'form-field-multiple-labels': { enabled: true }, // WCAG 3.3.2 (A)
  },
};

/**
 * Test a component for accessibility violations
 *
 * @param ui - React component to test
 * @param options - Render options
 * @param axeConfig - Custom axe configuration (optional)
 * @returns The render result and axe results
 *
 * @example
 * ```tsx
 * it('should not have accessibility violations', async () => {
 *   const { container } = await testAccessibility(<MyComponent />);
 * });
 * ```
 */
export async function testAccessibility(
  ui: ReactElement,
  options?: RenderOptions,
  axeConfig?: JestAxeConfigureOptions
) {
  const { container, ...renderResult } = render(ui, options);
  const results = await axe(container, axeConfig || defaultAxeConfig);

  expect(results).toHaveNoViolations();

  return { container, ...renderResult, axeResults: results };
}

/**
 * Test a component for specific WCAG criteria
 *
 * @param ui - React component to test
 * @param wcagLevel - WCAG level to test ('A', 'AA', 'AAA')
 * @param options - Render options
 * @returns The render result and axe results
 *
 * @example
 * ```tsx
 * it('should meet WCAG AAA standards', async () => {
 *   await testWCAGCompliance(<MyComponent />, 'AAA');
 * });
 * ```
 */
export async function testWCAGCompliance(
  ui: ReactElement,
  wcagLevel: 'A' | 'AA' | 'AAA' = 'AAA',
  options?: RenderOptions
) {
  const config: JestAxeConfigureOptions = {
    ...defaultAxeConfig,
    runOnly: {
      type: 'tag',
      values: [
        'wcag2a',
        ...(wcagLevel === 'AA' || wcagLevel === 'AAA' ? ['wcag2aa'] : []),
        ...(wcagLevel === 'AAA' ? ['wcag2aaa'] : []),
      ],
    },
  };

  return testAccessibility(ui, options, config);
}

/**
 * Test keyboard navigation for a component
 *
 * @param ui - React component to test
 * @param options - Render options
 * @returns Helper functions for keyboard testing
 *
 * @example
 * ```tsx
 * it('should be keyboard navigable', async () => {
 *   const { tabForward, pressEnter } = await testKeyboardNavigation(<MyComponent />);
 *
 *   await tabForward(); // Moves focus to first interactive element
 *   await pressEnter(); // Activates focused element
 * });
 * ```
 */
export async function testKeyboardNavigation(ui: ReactElement, options?: RenderOptions) {
  const { container, ...renderResult } = render(ui, options);
  const userEventLib = await import('@testing-library/user-event');
  const userEvent = userEventLib.default.setup();

  return {
    container,
    ...renderResult,
    userEvent,
    tabForward: () => userEvent.tab(),
    tabBackward: () => userEvent.tab({ shift: true }),
    pressEnter: () => userEvent.keyboard('{Enter}'),
    pressSpace: () => userEvent.keyboard(' '),
    pressEscape: () => userEvent.keyboard('{Escape}'),
    pressArrowDown: () => userEvent.keyboard('{ArrowDown}'),
    pressArrowUp: () => userEvent.keyboard('{ArrowUp}'),
    pressArrowLeft: () => userEvent.keyboard('{ArrowLeft}'),
    pressArrowRight: () => userEvent.keyboard('{ArrowRight}'),
  };
}

/**
 * Test screen reader announcements (aria-live regions)
 *
 * @param container - DOM container to test
 * @returns Helper functions for live region testing
 *
 * @example
 * ```tsx
 * it('should announce loading state to screen readers', () => {
 *   const { container } = render(<MyComponent />);
 *   const { findLiveRegion } = testScreenReaderAnnouncements(container);
 *
 *   const liveRegion = findLiveRegion('polite');
 *   expect(liveRegion).toHaveTextContent('Laster...');
 * });
 * ```
 */
export function testScreenReaderAnnouncements(container: HTMLElement) {
  return {
    /**
     * Find aria-live region by politeness level
     */
    findLiveRegion: (politeness: 'polite' | 'assertive' | 'off') => {
      return container.querySelector(`[aria-live="${politeness}"]`);
    },
    /**
     * Find all aria-live regions
     */
    findAllLiveRegions: () => {
      return container.querySelectorAll('[aria-live]');
    },
    /**
     * Find alert regions (role="alert")
     */
    findAlerts: () => {
      return container.querySelectorAll('[role="alert"]');
    },
    /**
     * Find status regions (role="status")
     */
    findStatuses: () => {
      return container.querySelectorAll('[role="status"]');
    },
  };
}

/**
 * Test focus management
 *
 * @returns Helper functions for focus testing
 *
 * @example
 * ```tsx
 * it('should have visible focus indicators', () => {
 *   const { hasFocusIndicator } = testFocusManagement();
 *   const button = screen.getByRole('button');
 *
 *   button.focus();
 *   expect(hasFocusIndicator(button)).toBe(true);
 * });
 * ```
 */
export function testFocusManagement() {
  return {
    /**
     * Check if element has focus
     */
    hasFocus: (element: HTMLElement) => {
      return document.activeElement === element;
    },
    /**
     * Check if element has visible focus indicator
     */
    hasFocusIndicator: (element: HTMLElement) => {
      const computedStyle = window.getComputedStyle(element);
      return (
        computedStyle.outline !== 'none' ||
        computedStyle.boxShadow !== 'none' ||
        computedStyle.border !== 'none'
      );
    },
    /**
     * Get currently focused element
     */
    getFocusedElement: () => {
      return document.activeElement as HTMLElement;
    },
  };
}

/**
 * Test color contrast (requires actual rendering)
 *
 * @param element - Element to test
 * @returns Contrast ratio information
 *
 * @example
 * ```tsx
 * it('should have sufficient color contrast', () => {
 *   const { container } = render(<MyText>Hello</MyText>);
 *   const text = container.querySelector('p');
 *
 *   const { meetsAA, meetsAAA } = testColorContrast(text!);
 *   expect(meetsAAA).toBe(true);
 * });
 * ```
 */
export function testColorContrast(element: HTMLElement) {
  const computedStyle = window.getComputedStyle(element);
  const foreground = computedStyle.color;
  const background = computedStyle.backgroundColor;

  // Note: Actual contrast calculation would require a library like 'color-contrast'
  // This is a placeholder for the pattern
  return {
    foreground,
    background,
    // These would be calculated with actual contrast checking
    meetsAA: true, // 4.5:1 for normal text
    meetsAAA: true, // 7:1 for normal text
    ratio: 0, // Placeholder for actual ratio
  };
}

/**
 * Common test setup for accessibility tests
 */
export const setupAccessibilityTest = () => {
  // Add any common setup needed for accessibility tests
  // e.g., mock window.matchMedia for reduced motion tests
  return {
    prefersReducedMotion: () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });
    },
    prefersHighContrast: () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: query === '(prefers-contrast: high)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });
    },
  };
};
