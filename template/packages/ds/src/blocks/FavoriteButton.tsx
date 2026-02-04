/**
 * FavoriteButton
 *
 * Interactive button for favoriting/unfavoriting listings.
 * Supports auth gating with callback for unauthenticated users.
 */
import * as React from 'react';
import { Button } from '@digdir/designsystemet-react';
import { cn } from '../utils';
import { HeartIcon } from '../primitives/icons';

export interface FavoriteButtonProps {
  /** Whether the item is currently favorited */
  isFavorited?: boolean;
  /** Whether the user is authenticated */
  isAuthenticated?: boolean;
  /** Number of favorites (optional badge) */
  favoriteCount?: number;
  /** Show favorite count */
  showCount?: boolean;
  /** Callback when favorite is toggled (authenticated user) */
  onToggle?: () => void;
  /** Callback when unauthenticated user tries to favorite */
  onAuthRequired?: () => void;
  /** Loading state */
  isLoading?: boolean;
  /** Visual variant */
  variant?: 'icon' | 'button' | 'compact';
  /** Size */
  size?: 'sm' | 'md' | 'lg';
  /** Custom class name */
  className?: string;
  /** Disable the button */
  disabled?: boolean;
}

// Filled heart icon
function HeartFilledIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export function FavoriteButton({
  isFavorited = false,
  isAuthenticated = true,
  favoriteCount,
  showCount = false,
  onToggle,
  onAuthRequired,
  isLoading = false,
  variant = 'icon',
  size = 'md',
  className,
  disabled = false,
}: FavoriteButtonProps): React.ReactElement {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled || isLoading) return;

    if (!isAuthenticated && onAuthRequired) {
      onAuthRequired();
      return;
    }

    onToggle?.();
  };

  // Size mappings
  const sizeMap = {
    sm: { button: '32px', icon: 14 },
    md: { button: '40px', icon: 18 },
    lg: { button: '48px', icon: 22 },
  };

  const currentSize = sizeMap[size];
  const label = isFavorited ? 'Fjern fra favoritter' : 'Legg til favoritter';

  // Icon-only variant
  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={label}
        aria-pressed={isFavorited}
        disabled={disabled || isLoading}
        className={cn('favorite-button', className)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: currentSize.button,
          height: currentSize.button,
          border: '1px solid var(--ds-color-neutral-border-default)',
          borderRadius: 'var(--ds-border-radius-full)',
          backgroundColor: isFavorited
            ? 'var(--ds-color-danger-surface-default)'
            : 'var(--ds-color-neutral-background-default)',
          color: isFavorited
            ? 'var(--ds-color-danger-base-default)'
            : 'var(--ds-color-neutral-text-subtle)',
          cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          opacity: disabled || isLoading ? 0.5 : 1,
        }}
      >
        {isLoading ? (
          <span
            style={{
              width: currentSize.icon,
              height: currentSize.icon,
              border: '2px solid currentColor',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
        ) : isFavorited ? (
          <HeartFilledIcon size={currentSize.icon} />
        ) : (
          <HeartIcon size={currentSize.icon} />
        )}
      </button>
    );
  }

  // Compact variant (small with optional count)
  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={label}
        aria-pressed={isFavorited}
        disabled={disabled || isLoading}
        className={cn('favorite-button-compact', className)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--ds-spacing-1)',
          padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
          border: '1px solid var(--ds-color-neutral-border-default)',
          borderRadius: 'var(--ds-border-radius-full)',
          backgroundColor: isFavorited
            ? 'var(--ds-color-danger-surface-default)'
            : 'var(--ds-color-neutral-background-default)',
          color: isFavorited
            ? 'var(--ds-color-danger-base-default)'
            : 'var(--ds-color-neutral-text-subtle)',
          cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          fontSize: 'var(--ds-font-size-xs)',
          fontWeight: 'var(--ds-font-weight-medium)',
          opacity: disabled || isLoading ? 0.5 : 1,
        }}
      >
        {isFavorited ? (
          <HeartFilledIcon size={12} />
        ) : (
          <HeartIcon size={12} />
        )}
        {showCount && favoriteCount !== undefined && (
          <span>{favoriteCount}</span>
        )}
      </button>
    );
  }

  // Full button variant
  return (
    <Button
      type="button"
      onClick={handleClick}
      data-size={size}
      variant={isFavorited ? 'primary' : 'secondary'}
      data-color={isFavorited ? 'danger' : 'neutral'}
      disabled={disabled || isLoading}
      className={cn('favorite-button-full', className)}
      aria-pressed={isFavorited}
    >
      {isLoading ? (
        <span
          style={{
            width: 16,
            height: 16,
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
      ) : isFavorited ? (
        <HeartFilledIcon size={16} />
      ) : (
        <HeartIcon size={16} />
      )}
      <span>{isFavorited ? 'Fjern favoritt' : 'Legg til favoritter'}</span>
      {showCount && favoriteCount !== undefined && (
        <span
          style={{
            marginLeft: 'var(--ds-spacing-1)',
            opacity: 0.8,
          }}
        >
          ({favoriteCount})
        </span>
      )}
    </Button>
  );
}

export default FavoriteButton;
