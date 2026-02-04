/**
 * ShareButton Component
 *
 * Button that triggers share functionality.
 * Uses native share API when available, otherwise opens ShareSheet.
 */

import * as React from 'react';
import { Button } from '@xaheen/ds';

// =============================================================================
// Icons
// =============================================================================

function ShareIcon(): React.ReactElement {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

// =============================================================================
// Props
// =============================================================================

export interface ShareButtonProps {
  onShare: () => void;
  listingName: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function ShareButton({
  onShare,
  listingName,
  size = 'md',
  showLabel = true,
  className,
}: ShareButtonProps): React.ReactElement {
  const ariaLabel = `Del ${listingName}`;

  return (
    <Button
      type="button"
      variant="secondary"
      data-size={size}
      onClick={onShare}
      aria-label={ariaLabel}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--ds-spacing-2)',
      }}
    >
      <ShareIcon />
      {showLabel && <span>Del</span>}
    </Button>
  );
}

export default ShareButton;
