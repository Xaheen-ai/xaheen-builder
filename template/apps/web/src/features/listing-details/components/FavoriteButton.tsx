/**
 * FavoriteButton Component
 *
 * Toggle button for adding/removing listings from favorites.
 * Requires authentication - triggers auth modal if not logged in.
 */

import * as React from 'react';
import { Button, Spinner } from '@xaheen/ds';

// =============================================================================
// Icons
// =============================================================================

function HeartIcon({ filled = false }: { filled?: boolean }): React.ReactElement {
  if (filled) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

// =============================================================================
// Props
// =============================================================================

export interface FavoriteButtonProps {
  isFavorited: boolean;
  isLoading?: boolean;
  isAuthenticated: boolean;
  onToggle: () => void;
  onAuthRequired: () => void;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function FavoriteButton({
  isFavorited,
  isLoading = false,
  isAuthenticated,
  onToggle,
  onAuthRequired,
  size = 'md',
  showLabel = true,
  className,
}: FavoriteButtonProps): React.ReactElement {
  const handleClick = React.useCallback(() => {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
    onToggle();
  }, [isAuthenticated, onAuthRequired, onToggle]);

  const label = isFavorited ? 'Fjern favoritt' : 'Legg til favoritt';
  const ariaLabel = isLoading ? 'Oppdaterer...' : label;

  return (
    <Button
      type="button"
      variant="secondary"
      data-size={size}
      onClick={handleClick}
      disabled={isLoading}
      aria-label={ariaLabel}
      aria-pressed={isFavorited}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--ds-spacing-2)',
        color: isFavorited ? 'var(--ds-color-danger-text-default)' : undefined,
      }}
    >
      {isLoading ? (
        <Spinner data-size="sm" aria-hidden="true" />
      ) : (
        <HeartIcon filled={isFavorited} />
      )}
      {showLabel && <span>{isFavorited ? 'Favoritt' : 'Favoritt'}</span>}
    </Button>
  );
}

export default FavoriteButton;
