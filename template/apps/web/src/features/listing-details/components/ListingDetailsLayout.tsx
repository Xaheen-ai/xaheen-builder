/**
 * ListingDetailsLayout Component
 *
 * Thin composition layer that assembles all listing detail components
 * into the full page layout. Follows the structure:
 * - Header block (under slideshow)
 * - Pill-style tabs
 * - Tab content with sidebar widgets in Overview
 * - Full-width booking section
 */

import * as React from 'react';
import { RequireAuthModal, ShareSheet } from '@xaheen/ds';
import type { Listing } from '../types';
import { createPresenter } from '../presenters/listingTypePresenter';
import {
  isNativeShareAvailable,
  shareNative,
  shareWithAudit,
  type ShareMedium,
  type ShareData,
} from '../adapters/shareTracker';
import { logAuditEvent } from '../adapters/auditProvider';
import { useRealtimeUpdates } from '../adapters/realtimeClient';

import { ListingHeader } from './ListingHeader';
import { OverviewTab } from './OverviewTab';
import { ActivityTab } from './ActivityTab';
import { RulesTab } from './RulesTab';
import { FaqTab } from './FaqTab';
import { ContactWidget } from './Sidebar/ContactWidget';
import { MapWidget } from './Sidebar/MapWidget';
import { OpeningHoursWidget } from './Sidebar/OpeningHoursWidget';
import { BookingWidgetPlacement } from './Sidebar/BookingWidgetPlacement';

// =============================================================================
// Props
// =============================================================================

export interface ListingDetailsLayoutProps {
  listing: Listing;
  isAuthenticated: boolean;
  userId?: string;
  isFavorited: boolean;
  isFavoriteLoading?: boolean;
  onFavoriteToggle: () => void;
  onBookingClick?: () => void;
  mapboxToken?: string;
  className?: string;
}

// =============================================================================
// Tab Button Component
// =============================================================================

interface TabButtonProps {
  id: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function TabButton({ id, label, isActive, onClick }: TabButtonProps): React.ReactElement {
  return (
    <button
      type="button"
      role="tab"
      id={`tab-${id}`}
      aria-selected={isActive}
      aria-controls={`panel-${id}`}
      onClick={onClick}
      className="listing-tab-button"
      style={{
        flex: 1,
        minWidth: '80px',
        padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
        borderRadius: 'var(--ds-border-radius-md)',
        border: 'none',
        cursor: 'pointer',
        fontSize: 'var(--ds-font-size-sm)',
        fontWeight: isActive ? 'var(--ds-font-weight-semibold)' : 'var(--ds-font-weight-medium)',
        transition: 'all 0.2s ease',
        backgroundColor: isActive ? '#1E3A5F' : 'transparent',
        color: isActive ? 'white' : '#64748B',
        textAlign: 'center',
        boxShadow: isActive ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}

// =============================================================================
// Component
// =============================================================================

export function ListingDetailsLayout({
  listing,
  isAuthenticated,
  userId,
  isFavorited,
  isFavoriteLoading = false,
  onFavoriteToggle,
  onBookingClick,
  mapboxToken,
  className,
}: ListingDetailsLayoutProps): React.ReactElement {
  const [activeTab, setActiveTab] = React.useState('overview');
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [showShareSheet, setShowShareSheet] = React.useState(false);

  const presenter = React.useMemo(() => createPresenter(listing.type, listing.categoryKey), [listing.type, listing.categoryKey]);

  // Subscribe to real-time updates
  useRealtimeUpdates(listing.id, (_event) => {
    // Real-time listing updates handled by React Query invalidation
  });

  // Share data
  const shareData = React.useMemo((): ShareData => ({
    url: typeof window !== 'undefined' ? window.location.href : '',
    title: listing.name,
    description: listing.metadata.shortDescription || listing.metadata.description?.slice(0, 150) || '',
  }), [listing]);

  // Handle share action
  const handleShare = React.useCallback(async () => {
    await logAuditEvent('LISTING_SHARED', listing.tenantId, listing.id, userId);

    if (isNativeShareAvailable()) {
      const result = await shareNative(shareData);
      if (result.success) {
        await shareWithAudit(shareData, 'native', listing.tenantId, listing.id, userId);
      }
    } else {
      setShowShareSheet(true);
    }
  }, [listing, shareData, userId]);

  // Handle share from sheet
  const handleShareFromSheet = React.useCallback(async (medium: ShareMedium) => {
    await shareWithAudit(shareData, medium, listing.tenantId, listing.id, userId);
  }, [shareData, listing.tenantId, listing.id, userId]);

  // Handle auth requirement
  const handleAuthRequired = React.useCallback(() => {
    setShowAuthModal(true);
  }, []);

  // Handle favorite toggle with auth check
  const handleFavoriteToggle = React.useCallback(() => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    onFavoriteToggle();
  }, [isAuthenticated, onFavoriteToggle]);

  // Tab configuration (category-aware via presenter)
  const tabs = presenter.tabs;

  return (
    <div className={className}>
      {/* Header Block */}
      <ListingHeader
        listing={listing}
        isFavorited={isFavorited}
        isFavoriteLoading={isFavoriteLoading}
        isAuthenticated={isAuthenticated}
        onFavoriteToggle={handleFavoriteToggle}
        onShare={handleShare}
        onAuthRequired={handleAuthRequired}
      />

      {/* Pill-style Tabs */}
      <div
        className="listing-tabs-container"
        style={{
          marginTop: 'var(--ds-spacing-4)',
          backgroundColor: 'var(--ds-color-neutral-surface-default)',
          borderRadius: 'var(--ds-border-radius-lg)',
          padding: 'var(--ds-spacing-1)',
          border: '1px solid var(--ds-color-neutral-border-subtle)',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div
          role="tablist"
          aria-label="Listing tabs"
          className="listing-tabs"
          style={{
            display: 'flex',
            gap: 'var(--ds-spacing-1)',
            minWidth: 'max-content',
          }}
        >
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              id={tab.id}
              label={tab.label}
              isActive={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </div>
      </div>

      {/* Tab Panels */}
      <div
        style={{
          marginTop: 'var(--ds-spacing-6)',
          padding: 'var(--ds-spacing-6)',
          backgroundColor: 'var(--ds-color-neutral-background-default)',
          borderRadius: 'var(--ds-border-radius-lg)',
          border: '1px solid var(--ds-color-neutral-border-subtle)',
        }}
      >
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div
            id="panel-overview"
            role="tabpanel"
            aria-labelledby="tab-overview"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 400px',
              gap: 'var(--ds-spacing-8)',
            }}
            className="listing-content-grid"
          >
            {/* Main content */}
            <div>
              <OverviewTab
                metadata={listing.metadata}
                listingType={listing.type}
                {...(listing.keyFacts.capacity !== undefined ? { capacity: listing.keyFacts.capacity } : {})}
              />
            </div>

            {/* Sidebar */}
            <aside
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--ds-spacing-4)',
              }}
            >
              {/* Contact */}
              {listing.contact && (
                <ContactWidget contact={listing.contact} />
              )}

              {/* Map */}
              {listing.address && (
                <MapWidget
                  address={listing.address}
                  {...(mapboxToken ? { mapboxToken } : {})}
                />
              )}

              {/* Opening Hours */}
              {presenter.showOpeningHours && listing.openingHours && (
                <OpeningHoursWidget openingHours={listing.openingHours} />
              )}
            </aside>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div
            id="panel-activity"
            role="tabpanel"
            aria-labelledby="tab-activity"
          >
            <ActivityTab
              {...(listing.activityData ? { activityData: listing.activityData } : {})}
              listingType={listing.type}
            />
          </div>
        )}

        {/* Rules Tab */}
        {activeTab === 'rules' && (
          <div
            id="panel-rules"
            role="tabpanel"
            aria-labelledby="tab-rules"
          >
            <RulesTab
              rules={listing.metadata.rules}
              listingType={listing.type}
            />
          </div>
        )}

        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <div
            id="panel-faq"
            role="tabpanel"
            aria-labelledby="tab-faq"
          >
            <FaqTab
              faq={listing.metadata.faq}
              listingType={listing.type}
            />
          </div>
        )}
      </div>

      {/* Full-width Booking Section */}
      <div
        id="booking-section"
        style={{
          marginTop: 'var(--ds-spacing-8)',
          minHeight: '600px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <BookingWidgetPlacement
          listingId={listing.id}
          tenantId={listing.tenantId}
          {...(listing.bookingConfig ? { bookingConfig: listing.bookingConfig } : {})}
          {...(listing.pricing ? { pricing: listing.pricing } : {})}
          {...(onBookingClick ? { onBookClick: onBookingClick } : {})}
          allowSeasonRental={listing.allowSeasonRental}
          allowRecurringBooking={listing.allowRecurringBooking}
          onSeasonRentalClick={() => {
            // TODO: Open season rental modal/flow
            console.log('Season rental clicked');
          }}
          onRecurringBookingClick={() => {
            // TODO: Open recurring booking modal/flow
            console.log('Recurring booking clicked');
          }}
          className="booking-widget-expanded"
        />
      </div>

      {/* Auth Modal */}
      <RequireAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={() => {
          setShowAuthModal(false);
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        }}
        onRegister={() => {
          setShowAuthModal(false);
          window.location.href = `/register?redirect=${encodeURIComponent(window.location.pathname)}`;
        }}
        actionContext="favorite"
      />

      {/* Share Sheet */}
      <ShareSheet
        isOpen={showShareSheet}
        onClose={() => setShowShareSheet(false)}
        shareData={{
          url: shareData.url,
          title: shareData.title,
          ...(shareData.description ? { description: shareData.description } : {}),
        }}
        onShare={(platform) => {
          handleShareFromSheet(platform as ShareMedium);
        }}
      />

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 991px) {
          .listing-content-grid {
            grid-template-columns: 1fr !important;
          }
        }
        .booking-widget-expanded {
          flex: 1;
          min-height: 0;
        }
      `}</style>
    </div>
  );
}

export default ListingDetailsLayout;
