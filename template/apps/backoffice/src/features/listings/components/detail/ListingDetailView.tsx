/**
 * Listing Detail View
 * Main container for the listing detail page with tabs for overview, bookings, availability, and audit
 * Admin interface for comprehensive facility management
 */

import { Component, useCallback, type ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Button,
  Card,
  Heading,
  Paragraph,
  Skeleton,
  ChevronLeftIcon,
  AlertTriangleIcon,
} from '@xaheen/ds';
import { useListingBySlug, useListing } from '@xaheen/sdk';
import { DetailHeader } from './DetailHeader';
import { OverviewTab } from './OverviewTab';
import { BookingsTab } from './BookingsTab';
import { AvailabilityTab } from './AvailabilityTab';
import { AuditTab } from './AuditTab';

/**
 * Error Boundary to catch JavaScript runtime errors
 * Prevents entire page crash when component rendering fails
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    // Log error to console for debugging (in development)
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught error:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

interface ListingDetailViewProps {
  slug: string;
}

export function ListingDetailView({ slug }: ListingDetailViewProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Check if the param looks like a UUID (ID) or a slug
  const isUuid = slug?.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

  // Fetch listing data by slug or ID
  const slugQuery = useListingBySlug(slug || '', {
    enabled: !!slug && !isUuid,
  });

  const idQuery = useListing(slug || '', {
    enabled: !!slug && !!isUuid,
  });

  const data = isUuid ? idQuery.data : slugQuery.data;
  const isLoading = isUuid ? idQuery.isLoading : slugQuery.isLoading;
  const error = isUuid ? idQuery.error : slugQuery.error;
  const listing = data?.data;
  const refetch = isUuid ? idQuery.refetch : slugQuery.refetch;

  // Active tab from URL query params
  const activeTab = searchParams.get('tab') || 'overview';

  const handleTabChange = useCallback((tab: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', tab);
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  const handleEditSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  // Loading state - Skeleton screen
  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
        {/* Header Skeleton */}
        <Card style={{ padding: 'var(--ds-spacing-6)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
            {/* Title and status */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ flex: 1 }}>
                <Skeleton width="60%" height={32} style={{ marginBottom: 'var(--ds-spacing-2)' }} />
                <Skeleton width="40%" height={20} />
              </div>
              <Skeleton width={100} height={40} />
            </div>
            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
              <Skeleton width={120} height={40} />
              <Skeleton width={120} height={40} />
            </div>
          </div>
        </Card>

        {/* Tabs Skeleton */}
        <div>
          <div
            style={{
              display: 'flex',
              gap: 'var(--ds-spacing-2)',
              borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
              marginBottom: 'var(--ds-spacing-6)',
            }}
          >
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} width={100} height={40} style={{ marginBottom: '-1px' }} />
            ))}
          </div>

          {/* Tab Content Skeleton */}
          <Card style={{ padding: 'var(--ds-spacing-6)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
              {/* Image gallery skeleton */}
              <Skeleton width="100%" height={400} />

              {/* Key facts skeleton */}
              <div style={{ display: 'flex', gap: 'var(--ds-spacing-4)' }}>
                <Skeleton width="30%" height={80} />
                <Skeleton width="30%" height={80} />
                <Skeleton width="30%" height={80} />
              </div>

              {/* Description skeleton */}
              <div>
                <Skeleton width="30%" height={24} style={{ marginBottom: 'var(--ds-spacing-3)' }} />
                <Skeleton count={3} />
              </div>

              {/* Facilities skeleton */}
              <div>
                <Skeleton width="25%" height={24} style={{ marginBottom: 'var(--ds-spacing-3)' }} />
                <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', flexWrap: 'wrap' }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} width={100} height={32} />
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Error state - RFC 7807 compliant
  if (error) {
    return (
      <Card style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center' }}>
        <Heading level={2} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          Kunne ikke laste utleieobjekt
        </Heading>
        <Paragraph
          data-size="sm"
          style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0, marginBottom: 'var(--ds-spacing-4)' }}
        >
          Det oppstod en feil ved lasting av objektet. Vennligst prøv igjen senere.
        </Paragraph>
        <Button type="button" variant="primary" onClick={() => navigate('/listings')}>
          <ChevronLeftIcon size={16} />
          Tilbake til liste
        </Button>
      </Card>
    );
  }

  // Not found state
  if (!listing) {
    return (
      <Card style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center' }}>
        <Heading level={2} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          Utleieobjekt ikke funnet
        </Heading>
        <Paragraph
          data-size="sm"
          style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0, marginBottom: 'var(--ds-spacing-4)' }}
        >
          Objektet du leter etter finnes ikke eller du har ikke tilgang.
        </Paragraph>
        <Button type="button" variant="primary" onClick={() => navigate('/listings')}>
          <ChevronLeftIcon size={16} />
          Tilbake til liste
        </Button>
      </Card>
    );
  }

  return (
    <ErrorBoundary
      fallback={
        <Card style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--ds-spacing-4)' }}>
            <AlertTriangleIcon
              size={48}
              style={{ color: 'var(--ds-color-danger-border-default)' }}
            />
          </div>
          <Heading level={2} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
            Noe gikk galt
          </Heading>
          <Paragraph
            data-size="sm"
            style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0, marginBottom: 'var(--ds-spacing-4)' }}
          >
            Det oppstod en uventet feil ved visning av objektet. Vennligst prøv igjen.
          </Paragraph>
          <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', justifyContent: 'center' }}>
            <Button type="button" variant="secondary" onClick={() => window.location.reload()}>
              Last inn på nytt
            </Button>
            <Button type="button" variant="primary" onClick={() => navigate('/listings')}>
              <ChevronLeftIcon size={16} />
              Tilbake til liste
            </Button>
          </div>
        </Card>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
        {/* Header Section - Integrated with EditModal and RBAC */}
        <DetailHeader listing={listing} onEditSuccess={handleEditSuccess} />

        {/* Tabs Section */}
        <div>
          <div
            style={{
              display: 'flex',
              gap: 'var(--ds-spacing-2)',
              borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
              marginBottom: 'var(--ds-spacing-6)',
            }}
          >
            {[
              { id: 'overview', label: 'Oversikt' },
              { id: 'bookings', label: 'Bookinger' },
              { id: 'availability', label: 'Tilgjengelighet' },
              { id: 'audit', label: 'Endringslogg' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                style={{
                  padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
                  background: 'none',
                  border: 'none',
                  borderBottom:
                    activeTab === tab.id
                      ? '2px solid var(--ds-color-accent-border-default)'
                      : '2px solid transparent',
                  color:
                    activeTab === tab.id
                      ? 'var(--ds-color-accent-text-default)'
                      : 'var(--ds-color-neutral-text-subtle)',
                  fontWeight: activeTab === tab.id ? 600 : 400,
                  cursor: 'pointer',
                  fontSize: 'var(--ds-font-size-md)',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s ease',
                }}
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <Card style={{ padding: 'var(--ds-spacing-6)' }}>
            {activeTab === 'overview' && <OverviewTab listing={listing} />}
            {activeTab === 'bookings' && <BookingsTab listingId={listing.id} />}
            {activeTab === 'availability' && (
              <AvailabilityTab listingId={listing.id} listingName={listing.name} />
            )}
            {activeTab === 'audit' && <AuditTab listingId={listing.id} />}
          </Card>
        </div>
      </div>
    </ErrorBoundary>
  );
}
