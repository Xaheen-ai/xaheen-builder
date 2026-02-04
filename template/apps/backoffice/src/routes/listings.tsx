/**
 * Listings Routes
 * Page components for the listings module
 */

import { useParams } from 'react-router-dom';
import { ListingsListView } from '../features/listings/components/list/ListingsListView';
import { ListingWizard } from '../features/listings/components/wizard';
import { ListingDetailView } from '../features/listings/components/detail';

/**
 * Listings Page - Main list view with filtering and search
 */
export function ListingsPage() {
  return <ListingsListView />;
}

/**
 * Listing Edit Page - Multi-step wizard for create/edit
 */
export function ListingEditPage() {
  const { slug } = useParams<{ slug: string }>();

  return <ListingWizard slug={slug} />;
}

/**
 * Listing Detail Page - Comprehensive view with tabs for overview, bookings, availability, and audit
 */
export function ListingDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) {
    return null;
  }

  return <ListingDetailView slug={slug} />;
}
