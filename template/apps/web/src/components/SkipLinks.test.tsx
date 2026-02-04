/**
 * SkipLinks Accessibility Tests
 *
 * Tests for WCAG 2.4.1 Bypass Blocks (Level A) compliance
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { SkipLinks } from './SkipLinks';
import { testAccessibility, testKeyboardNavigation } from '../test-utils/accessibility';

describe('SkipLinks', () => {
  beforeEach(() => {
    // Add target elements for skip links
    document.body.innerHTML = `
      <div id="main-content">Main Content</div>
      <div id="main-navigation">Navigation</div>
    `;
  });

  describe('Accessibility Compliance', () => {
    it('should not have any accessibility violations', async () => {
      await testAccessibility(<SkipLinks />);
    });

    it('should meet WCAG 2.4.1 Level A (Bypass Blocks)', async () => {
      const { container } = await testAccessibility(<SkipLinks />);

      // Verify skip links exist
      const skipToContent = screen.getByText('Hopp til hovedinnhold');
      const skipToNav = screen.getByText('Hopp til navigasjon');

      expect(skipToContent).toBeInTheDocument();
      expect(skipToNav).toBeInTheDocument();

      // Verify they are links
      expect(skipToContent.tagName).toBe('A');
      expect(skipToNav.tagName).toBe('A');

      // Verify they have correct href attributes
      expect(skipToContent).toHaveAttribute('href', '#main-content');
      expect(skipToNav).toHaveAttribute('href', '#main-navigation');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should be keyboard accessible', async () => {
      const { tabForward, getFocusedElement } = await testKeyboardNavigation(<SkipLinks />);

      // Tab to first skip link
      await tabForward();
      const focused = screen.getByText('Hopp til hovedinnhold');

      expect(focused).toHaveFocus();
    });

    it('should navigate through both skip links with Tab', async () => {
      const { tabForward } = await testKeyboardNavigation(<SkipLinks />);

      // Tab to first link
      await tabForward();
      expect(screen.getByText('Hopp til hovedinnhold')).toHaveFocus();

      // Tab to second link
      await tabForward();
      expect(screen.getByText('Hopp til navigasjon')).toHaveFocus();
    });

    it('should activate links with Enter key', async () => {
      const { tabForward, pressEnter } = await testKeyboardNavigation(<SkipLinks />);

      // Tab to skip link
      await tabForward();

      // Press Enter (browser handles navigation)
      await pressEnter();

      // Link should still be focused after press (browser handles actual navigation)
      expect(screen.getByText('Hopp til hovedinnhold')).toHaveFocus();
    });
  });

  describe('Visual Behavior', () => {
    it('should be visually hidden by default', async () => {
      const { container } = await testAccessibility(<SkipLinks />);
      const skipLink = screen.getByText('Hopp til hovedinnhold');

      // Should have position absolute and be off-screen
      expect(skipLink).toHaveStyle({
        position: 'absolute',
        left: '-9999px',
      });
    });

    it('should become visible when focused (CSS tested via style attribute)', async () => {
      const { container } = await testAccessibility(<SkipLinks />);
      const skipLink = screen.getByText('Hopp til hovedinnhold');

      // The :focus styles in CSS will make it visible
      // We can test that the base styles are correct
      expect(skipLink).toHaveStyle({
        position: 'absolute',
      });

      // Has proper styling attributes
      expect(skipLink.className).toContain('skip-link');
    });
  });

  describe('High Contrast Mode Support', () => {
    it('should have contrast mode CSS defined', async () => {
      const { container } = await testAccessibility(<SkipLinks />);
      const style = container.querySelector('style');

      expect(style).toBeInTheDocument();
      expect(style?.textContent).toContain('@media (prefers-contrast: high)');
    });
  });

  describe('Norwegian Language', () => {
    it('should use correct Norwegian labels', async () => {
      await testAccessibility(<SkipLinks />);

      expect(screen.getByText('Hopp til hovedinnhold')).toBeInTheDocument();
      expect(screen.getByText('Hopp til navigasjon')).toBeInTheDocument();
    });
  });

  describe('Semantic HTML', () => {
    it('should use proper anchor elements', async () => {
      await testAccessibility(<SkipLinks />);

      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(2);

      links.forEach(link => {
        expect(link.tagName).toBe('A');
        expect(link).toHaveAttribute('href');
      });
    });

    it('should have descriptive link text (not "click here")', async () => {
      await testAccessibility(<SkipLinks />);

      const skipToContent = screen.getByText('Hopp til hovedinnhold');
      const skipToNav = screen.getByText('Hopp til navigasjon');

      // Text should be descriptive
      expect(skipToContent.textContent).not.toMatch(/klikk|click/i);
      expect(skipToNav.textContent).not.toMatch(/klikk|click/i);
    });
  });

  describe('Design Token Compliance', () => {
    it('should use design tokens for styling', async () => {
      const { container } = await testAccessibility(<SkipLinks />);
      const style = container.querySelector('style');

      // Verify design tokens are used in CSS
      expect(style?.textContent).toContain('var(--ds-spacing-');
      expect(style?.textContent).toContain('var(--ds-color-');
      expect(style?.textContent).toContain('var(--ds-border-radius-');
      expect(style?.textContent).toContain('var(--ds-font-');
      expect(style?.textContent).toContain('var(--ds-shadow-');
    });

    it('should not have hardcoded color values', async () => {
      const { container } = await testAccessibility(<SkipLinks />);
      const style = container.querySelector('style');
      const cssText = style?.textContent || '';

      // Should not contain hex colors, rgb(), or named colors (except 'transparent')
      expect(cssText).not.toMatch(/#[0-9a-f]{3,6}/i);
      expect(cssText).not.toMatch(/rgb\(/i);
      expect(cssText).not.toMatch(/: ?(white|black|blue|red|green);/i);
    });
  });

  describe('Z-Index Layering', () => {
    it('should have high z-index to appear above all content', async () => {
      const { container } = await testAccessibility(<SkipLinks />);
      const skipLinksContainer = container.querySelector('.skip-links');
      const style = container.querySelector('style');

      expect(skipLinksContainer).toBeInTheDocument();
      expect(style?.textContent).toContain('z-index: 10000');
    });
  });
});
