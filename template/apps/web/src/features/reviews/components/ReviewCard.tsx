/**
 * ReviewCard
 *
 * A reusable card component for displaying individual reviews.
 * Displays star rating, review text, author name, date, and helpful count.
 */
import * as React from 'react';
import { Card, Stack, Heading, Paragraph, Badge, StarIcon } from '@xaheen/ds';
import { cn } from '@xaheen/ds';
import type { Review } from '@xaheen/sdk';

export interface ReviewCardProps {
  /** Review data */
  review: Review;
  /** Show helpful count badge */
  showHelpfulCount?: boolean;
  /** Show moderation status badge */
  showStatus?: boolean;
  /** Click handler for helpful button */
  onMarkHelpful?: (reviewId: string) => void;
  /** Custom class name */
  className?: string;
  /** Variant for different display contexts */
  variant?: 'default' | 'compact';
}

/**
 * Formats a date string to a human-readable format
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return 'I dag';
  } else if (diffInDays === 1) {
    return 'I går';
  } else if (diffInDays < 7) {
    return `${diffInDays} dager siden`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} ${weeks === 1 ? 'uke' : 'uker'} siden`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `${months} ${months === 1 ? 'måned' : 'måneder'} siden`;
  } else {
    return date.toLocaleDateString('nb-NO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
};

/**
 * Renders star rating display (1-5 stars)
 */
const StarRating = ({ rating }: { rating: number }): React.ReactElement => {
  return (
    <div
      style={{
        display: 'flex',
        gap: '4px',
        alignItems: 'center',
      }}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <div
          key={star}
          style={{
            color:
              star <= rating
                ? 'var(--ds-color-warning-base-default)'
                : 'var(--ds-color-neutral-border-default)',
          }}
        >
          <StarIcon />
        </div>
      ))}
      <span
        style={{
          marginLeft: '8px',
          fontSize: '14px',
          fontWeight: 600,
          color: 'var(--ds-color-neutral-text-default)',
        }}
      >
        {rating}/5
      </span>
    </div>
  );
};

/**
 * Returns badge color based on review status
 */
const getStatusColor = (status: Review['status']): 'success' | 'warning' | 'danger' => {
  switch (status) {
    case 'approved':
      return 'success';
    case 'pending':
      return 'warning';
    case 'rejected':
      return 'danger';
    default:
      return 'warning';
  }
};

/**
 * Returns badge label based on review status
 */
const getStatusLabel = (status: Review['status']): string => {
  switch (status) {
    case 'approved':
      return 'Godkjent';
    case 'pending':
      return 'Venter';
    case 'rejected':
      return 'Avvist';
    default:
      return status;
  }
};

export function ReviewCard({
  review,
  showHelpfulCount = true,
  showStatus = false,
  onMarkHelpful,
  className,
  variant = 'default',
}: ReviewCardProps): React.ReactElement {
  const handleHelpful = () => {
    onMarkHelpful?.(review.id);
  };

  const isCompact = variant === 'compact';

  return (
    <Card
      className={cn(className)}
      style={{
        padding: isCompact ? '16px' : '24px',
        borderRadius: 'var(--ds-border-radius-md)',
        border: '1px solid var(--ds-color-neutral-border-subtle)',
        backgroundColor: 'var(--ds-color-neutral-surface-default)',
        transition: 'box-shadow 0.2s ease',
      }}
    >
      <Stack gap="16px">
        {/* Header: Author, Date, and Status */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ flex: 1 }}>
            <Heading
              level={isCompact ? 4 : 3}
              size={isCompact ? 'xs' : 'sm'}
              style={{
                marginBottom: '4px',
                color: 'var(--ds-color-neutral-text-default)',
              }}
            >
              {review.userName || 'Anonym bruker'}
            </Heading>
            <Paragraph
              size="sm"
              style={{
                color: 'var(--ds-color-neutral-text-subtle)',
                margin: 0,
              }}
            >
              {formatDate(review.createdAt)}
            </Paragraph>
          </div>

          {/* Status Badge (for moderation) */}
          {showStatus && (
            <Badge color={getStatusColor(review.status)} size="sm">
              {getStatusLabel(review.status)}
            </Badge>
          )}
        </div>

        {/* Star Rating */}
        <StarRating rating={review.rating} />

        {/* Review Comment/Text */}
        {review.comment && (
          <Paragraph
            size={isCompact ? 'sm' : 'md'}
            style={{
              color: 'var(--ds-color-neutral-text-default)',
              lineHeight: 1.6,
              margin: 0,
              whiteSpace: 'pre-wrap',
            }}
          >
            {review.comment}
          </Paragraph>
        )}

        {/* Footer: Helpful Count and Action */}
        {showHelpfulCount && review.metadata?.helpfulCount !== undefined && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              paddingTop: '8px',
              borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
            }}
          >
            {/* Helpful Count Display */}
            {review.metadata.helpfulCount > 0 && (
              <Paragraph
                size="sm"
                style={{
                  color: 'var(--ds-color-neutral-text-subtle)',
                  margin: 0,
                }}
              >
                {review.metadata.helpfulCount}{' '}
                {review.metadata.helpfulCount === 1 ? 'person' : 'personer'} fant
                dette nyttig
              </Paragraph>
            )}

            {/* Mark as Helpful Button */}
            {onMarkHelpful && (
              <button
                onClick={handleHelpful}
                style={{
                  marginLeft: 'auto',
                  padding: '6px 12px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'var(--ds-color-accent-text-default)',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--ds-color-accent-border-default)',
                  borderRadius: 'var(--ds-border-radius-sm)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    'var(--ds-color-accent-surface-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                Nyttig
              </button>
            )}
          </div>
        )}

        {/* Moderator Notes (if present) */}
        {review.metadata?.moderatorNotes && showStatus && (
          <div
            style={{
              padding: '12px',
              backgroundColor: 'var(--ds-color-info-surface-subtle)',
              borderRadius: 'var(--ds-border-radius-sm)',
              borderLeft: '3px solid var(--ds-color-info-border-default)',
            }}
          >
            <Paragraph
              size="sm"
              style={{
                fontWeight: 600,
                marginBottom: '4px',
                color: 'var(--ds-color-info-text-default)',
              }}
            >
              Moderatornotat:
            </Paragraph>
            <Paragraph
              size="sm"
              style={{
                color: 'var(--ds-color-neutral-text-default)',
                margin: 0,
              }}
            >
              {review.metadata.moderatorNotes}
            </Paragraph>
          </div>
        )}
      </Stack>
    </Card>
  );
}
