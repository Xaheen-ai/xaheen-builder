/**
 * ReviewList
 *
 * A component for displaying a paginated list of reviews.
 * Uses the useListingReviews hook from SDK and renders ReviewCard components.
 */
import * as React from 'react';
import { Button, Stack, Text, Spinner } from '@xaheen/ds';
import { useListingReviews } from '@xaheen/sdk';
import { ReviewCard } from './ReviewCard';
import type { ReviewQueryParams } from '@xaheen/sdk/types';

export interface ReviewListProps {
  /** Listing ID to fetch reviews for */
  listingId: string;
  /** Additional query parameters (e.g., status filter) */
  queryParams?: Omit<ReviewQueryParams, 'listingId'>;
  /** Show helpful count on cards */
  showHelpfulCount?: boolean;
  /** Show moderation status badges */
  showStatus?: boolean;
  /** Handler for marking review as helpful */
  onMarkHelpful?: (reviewId: string) => void;
  /** Custom class name */
  className?: string;
  /** Reviews per page */
  reviewsPerPage?: number;
  /** Variant to use for review cards */
  variant?: 'default' | 'compact';
}

export function ReviewList({
  listingId,
  queryParams,
  showHelpfulCount = true,
  showStatus = false,
  onMarkHelpful,
  className,
  reviewsPerPage = 5,
  variant = 'default',
}: ReviewListProps): React.ReactElement {
  // Pagination state
  const [visibleCount, setVisibleCount] = React.useState(reviewsPerPage);

  // Fetch reviews from SDK
  const { data: reviewsResponse, isLoading, error } = useListingReviews(
    listingId,
    {
      ...queryParams,
      status: queryParams?.status || 'approved', // Default to approved reviews
      limit: 100, // Fetch a reasonable batch for client-side pagination
    },
    { enabled: !!listingId }
  );

  // Extract reviews from response
  const reviews = React.useMemo(() => {
    return reviewsResponse?.data || [];
  }, [reviewsResponse]);

  // Client-side pagination
  const visibleReviews = React.useMemo(() => {
    return reviews.slice(0, visibleCount);
  }, [reviews, visibleCount]);

  const hasMore = visibleCount < reviews.length;

  // Reset visible count when queryParams change
  React.useEffect(() => {
    setVisibleCount(reviewsPerPage);
  }, [queryParams, reviewsPerPage]);

  // Loading State
  if (isLoading) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 'var(--ds-spacing-8)',
        }}
      >
        <Spinner aria-label="Laster anmeldelser..." />
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div
        role="alert"
        aria-live="assertive"
        className={className}
        style={{
          padding: 'var(--ds-spacing-6)',
          backgroundColor: 'var(--ds-color-danger-surface-subtle)',
          borderRadius: 'var(--ds-border-radius-md)',
          border: '1px solid var(--ds-color-danger-border-default)',
          textAlign: 'center',
        }}
      >
        <Text size="md" color="var(--ds-color-danger-text-default)">
          Kunne ikke laste anmeldelser. Prøv igjen senere.
        </Text>
      </div>
    );
  }

  // Empty State
  if (reviews.length === 0) {
    return (
      <div
        className={className}
        style={{
          padding: 'var(--ds-spacing-8)',
          textAlign: 'center',
          backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
          borderRadius: 'var(--ds-border-radius-md)',
          border: '1px solid var(--ds-color-neutral-border-subtle)',
        }}
      >
        <Text
          size="lg"
          color="var(--ds-color-neutral-text-default)"
          style={{ marginBottom: 'var(--ds-spacing-2)', display: 'block' }}
        >
          Ingen anmeldelser ennå
        </Text>
        <Text size="md" color="var(--ds-color-neutral-text-subtle)">
          Bli den første til å anmelde dette lokalet.
        </Text>
      </div>
    );
  }

  // Reviews List
  return (
    <div className={className}>
      <Stack gap="16px">
        {/* Review Cards */}
        {visibleReviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            showHelpfulCount={showHelpfulCount}
            showStatus={showStatus}
            onMarkHelpful={onMarkHelpful}
            variant={variant}
          />
        ))}

        {/* Load More Button */}
        {hasMore && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: 'var(--ds-spacing-4)',
            }}
          >
            <Button
              type="button"
              variant="secondary"
              onClick={() => setVisibleCount((prev) => prev + reviewsPerPage)}
              style={{ paddingInline: 'var(--ds-spacing-8)' }}
            >
              Vis flere anmeldelser ({reviews.length - visibleCount} gjenstår)
            </Button>
          </div>
        )}
      </Stack>

      {/* Total Count Display */}
      <div
        style={{
          marginTop: 'var(--ds-spacing-4)',
          textAlign: 'center',
        }}
      >
        <Text size="sm" color="var(--ds-color-neutral-text-subtle)">
          Viser {visibleReviews.length} av {reviews.length} anmeldelser
        </Text>
      </div>
    </div>
  );
}
