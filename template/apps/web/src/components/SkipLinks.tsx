/**
 * SkipLinks Component
 *
 * Provides skip navigation links for keyboard users to bypass repetitive content.
 * WCAG 2.4.1 Bypass Blocks (Level A)
 *
 * Features:
 * - Hidden until focused (keyboard navigation)
 * - Jumps to main content, skipping header navigation
 * - Uses design tokens for styling
 * - Accessible with proper focus indicators
 * - Tracks usage for accessibility metrics
 */

import React from 'react';
import { useAccessibilityMonitoringContext } from '../providers/AccessibilityMonitoringProvider';

export function SkipLinks(): React.ReactElement {
  // Optional: Track skip link usage if monitoring is enabled
  const tracking = React.useMemo(() => {
    try {
      return useAccessibilityMonitoringContext();
    } catch {
      return null; // Monitoring not available
    }
  }, []);

  const handleSkipLinkClick = (target: string) => {
    tracking?.trackSkipLinkUsage(target);
  };

  return (
    <div className="skip-links">
      <a
        href="#main-content"
        className="skip-link"
        onClick={() => handleSkipLinkClick('main-content')}
      >
        Hopp til hovedinnhold
      </a>
      <a
        href="#main-navigation"
        className="skip-link"
        onClick={() => handleSkipLinkClick('main-navigation')}
      >
        Hopp til navigasjon
      </a>
      <style>{`
        .skip-links {
          position: relative;
          z-index: 10000;
        }

        .skip-link {
          position: absolute;
          left: -9999px;
          top: 0;
          z-index: 10000;
          padding: var(--ds-spacing-3) var(--ds-spacing-4);
          background-color: var(--ds-color-accent-surface-default);
          color: var(--ds-color-accent-text-default);
          text-decoration: none;
          font-size: var(--ds-font-size-md);
          font-weight: var(--ds-font-weight-medium);
          border-radius: var(--ds-border-radius-md);
          box-shadow: var(--ds-shadow-lg);
          white-space: nowrap;
        }

        .skip-link:focus {
          left: var(--ds-spacing-4);
          top: var(--ds-spacing-4);
          outline: 3px solid var(--ds-color-focus-outer);
          outline-offset: 2px;
        }

        .skip-link:focus-visible {
          outline: 3px solid var(--ds-color-focus-outer);
          outline-offset: 2px;
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .skip-link:focus {
            outline-width: 4px;
          }
        }
      `}</style>
    </div>
  );
}

export default SkipLinks;
