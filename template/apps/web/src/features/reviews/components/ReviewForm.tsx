/**
 * ReviewForm
 *
 * A form component for submitting reviews.
 * Allows users to rate (1-5 stars) and write a text review for a listing.
 * Uses the useCreateReview hook from SDK.
 */

import * as React from 'react';
import { Button, Stack, Heading, Paragraph, StarIcon } from '@xaheen/ds';
import { useCreateReview, auditService } from '@xaheen/sdk';
import type { CreateReviewDTO } from '@xaheen/sdk/types';

// =============================================================================
// Types
// =============================================================================

export interface ReviewFormProps {
  /** Listing ID to review */
  listingId: string;
  /** Booking ID associated with the review */
  bookingId: string;
  /** Callback when review is successfully submitted */
  onSuccess?: () => void;
  /** Callback when form is cancelled */
  onCancel?: () => void;
  /** Custom class name */
  className?: string;
}

// =============================================================================
// Star Rating Selector Component
// =============================================================================

interface StarRatingSelectorProps {
  value: number;
  onChange: (rating: number) => void;
  disabled?: boolean;
}

function StarRatingSelector({ value, onChange, disabled = false }: StarRatingSelectorProps) {
  const [hoveredRating, setHoveredRating] = React.useState<number | null>(null);

  const displayRating = hoveredRating ?? value;

  return (
    <div
      role="radiogroup"
      aria-label="Velg vurdering"
      style={{
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
      }}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const isActive = star <= displayRating;
        const isSelected = star <= value;

        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={`${star} ${star === 1 ? 'stjerne' : 'stjerner'}`}
            onClick={() => onChange(star)}
            onMouseEnter={() => !disabled && setHoveredRating(star)}
            onMouseLeave={() => !disabled && setHoveredRating(null)}
            disabled={disabled}
            style={{
              background: 'none',
              border: 'none',
              padding: '4px',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.5 : 1,
              transition: 'transform 0.2s ease',
              color: isActive
                ? 'var(--ds-color-warning-base-default)'
                : 'var(--ds-color-neutral-border-default)',
              transform: hoveredRating === star ? 'scale(1.2)' : 'scale(1)',
            }}
          >
            <StarIcon style={{ width: '32px', height: '32px' }} />
          </button>
        );
      })}
      <span
        style={{
          marginLeft: '12px',
          fontSize: '16px',
          fontWeight: 600,
          color: 'var(--ds-color-neutral-text-default)',
        }}
      >
        {value > 0 ? `${value}/5` : 'Velg vurdering'}
      </span>
    </div>
  );
}

// =============================================================================
// ReviewForm Component
// =============================================================================

/**
 * Form for submitting a review with star rating and optional text comment.
 *
 * @example
 * ```tsx
 * <ReviewForm
 *   listingId="listing-123"
 *   bookingId="booking-456"
 *   onSuccess={() => console.log('Review submitted')}
 *   onCancel={() => console.log('Form cancelled')}
 * />
 * ```
 */
export function ReviewForm({
  listingId,
  bookingId,
  onSuccess,
  onCancel,
  className,
}: ReviewFormProps): React.ReactElement {
  // Form state
  const [rating, setRating] = React.useState<number>(0);
  const [comment, setComment] = React.useState<string>('');
  const [validationError, setValidationError] = React.useState<string>('');

  // SDK mutation hook
  const createReviewMutation = useCreateReview();

  // Reset validation error when rating changes
  React.useEffect(() => {
    if (rating > 0) {
      setValidationError('');
    }
  }, [rating]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate rating
    if (rating < 1 || rating > 5) {
      setValidationError('Vennligst velg en vurdering mellom 1 og 5 stjerner');
      return;
    }

    // Prepare DTO
    const reviewData: CreateReviewDTO = {
      listingId,
      bookingId,
      rating,
      comment: comment.trim() || undefined,
    };

    try {
      await createReviewMutation.mutateAsync(reviewData);
      // Reset form on success
      setRating(0);
      setComment('');
      setValidationError('');
      // Call success callback
      onSuccess?.();
    } catch (error) {
      // Error is handled by mutation error state
      auditService.logError('review_submission_failed', 'review', error instanceof Error ? error : String(error), { listingId, bookingId, rating });
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setRating(0);
    setComment('');
    setValidationError('');
    onCancel?.();
  };

  const isSubmitting = createReviewMutation.isPending;
  const hasError = !!createReviewMutation.error;

  return (
    <form
      onSubmit={handleSubmit}
      className={className}
      style={{
        padding: 'var(--ds-spacing-6)',
        backgroundColor: 'var(--ds-color-neutral-surface-default)',
        borderRadius: 'var(--ds-border-radius-md)',
        border: '1px solid var(--ds-color-neutral-border-default)',
      }}
    >
      <Stack gap="24px">
        {/* Form Header */}
        <div>
          <Heading
            level={2}
            size="md"
            style={{
              marginBottom: 'var(--ds-spacing-2)',
              color: 'var(--ds-color-neutral-text-default)',
            }}
          >
            Skriv en anmeldelse
          </Heading>
          <Paragraph
            size="md"
            style={{
              color: 'var(--ds-color-neutral-text-subtle)',
              margin: 0,
            }}
          >
            Del din opplevelse med andre brukere
          </Paragraph>
        </div>

        {/* Star Rating Selector */}
        <div>
          <label
            htmlFor="review-rating"
            style={{
              display: 'block',
              marginBottom: 'var(--ds-spacing-3)',
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--ds-color-neutral-text-default)',
            }}
          >
            Vurdering <span style={{ color: 'var(--ds-color-danger-text-default)' }}>*</span>
          </label>
          <StarRatingSelector
            value={rating}
            onChange={setRating}
            disabled={isSubmitting}
          />
          {validationError && (
            <div
              role="alert"
              style={{
                marginTop: 'var(--ds-spacing-2)',
                padding: 'var(--ds-spacing-2)',
                fontSize: '14px',
                color: 'var(--ds-color-danger-text-default)',
                backgroundColor: 'var(--ds-color-danger-surface-subtle)',
                borderRadius: 'var(--ds-border-radius-sm)',
              }}
            >
              {validationError}
            </div>
          )}
        </div>

        {/* Comment Textarea */}
        <div>
          <label
            htmlFor="review-comment"
            style={{
              display: 'block',
              marginBottom: 'var(--ds-spacing-2)',
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--ds-color-neutral-text-default)',
            }}
          >
            Din anmeldelse (valgfritt)
          </label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Del dine tanker om dette lokalet..."
            disabled={isSubmitting}
            rows={5}
            maxLength={1000}
            style={{
              width: '100%',
              padding: 'var(--ds-spacing-3)',
              fontSize: '14px',
              lineHeight: 1.6,
              color: 'var(--ds-color-neutral-text-default)',
              backgroundColor: 'var(--ds-color-neutral-surface-default)',
              border: '1px solid var(--ds-color-neutral-border-default)',
              borderRadius: 'var(--ds-border-radius-sm)',
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
          />
          <Paragraph
            size="sm"
            style={{
              marginTop: 'var(--ds-spacing-2)',
              color: 'var(--ds-color-neutral-text-subtle)',
            }}
          >
            {comment.length}/1000 tegn
          </Paragraph>
        </div>

        {/* Error Message */}
        {hasError && (
          <div
            role="alert"
            style={{
              padding: 'var(--ds-spacing-4)',
              backgroundColor: 'var(--ds-color-danger-surface-subtle)',
              borderRadius: 'var(--ds-border-radius-sm)',
              border: '1px solid var(--ds-color-danger-border-default)',
            }}
          >
            <Paragraph
              size="md"
              style={{
                color: 'var(--ds-color-danger-text-default)',
                margin: 0,
              }}
            >
              Kunne ikke sende inn anmeldelsen. Vennligst prøv igjen.
            </Paragraph>
          </div>
        )}

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--ds-spacing-3)',
            justifyContent: 'flex-end',
            paddingTop: 'var(--ds-spacing-2)',
            borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
          }}
        >
          {onCancel && (
            <Button
              type="button"
              variant="tertiary"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Avbryt
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || rating === 0}
          >
            {isSubmitting ? 'Sender inn...' : 'Send inn anmeldelse'}
          </Button>
        </div>
      </Stack>
    </form>
  );
}
