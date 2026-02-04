/**
 * OrganizationDashboardPage
 *
 * Organization overview dashboard for Minside app
 * - KPI cards (total bookings, members, pending invoices)
 * - Upcoming bookings list
 * - Recent activity feed
 * - Quick action buttons
 */

import { useState, useEffect } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Spinner,
  Badge,
} from '@xaheen/ds';
import {
  useOrganization,
  useOrganizationMembers,
  useOrgBillingSummary,
} from '@xaheen/sdk';
import { useT, useLocale } from '@xaheen/i18n';
import { NavLink } from 'react-router-dom';

// Mobile breakpoint
const MOBILE_BREAKPOINT = 768;

// Mock org ID - in production would come from context/route
const ORG_ID = 'demo-org'; 

// Stats Icon components
function UsersIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function CalendarCheckIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <path d="M9 16l2 2 4-4" />
    </svg>
  );
}

function InvoiceIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

export function OrganizationDashboardPage() {
  const t = useT();
  const { locale } = useLocale();
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch org data
  const { data: orgData, isLoading: orgLoading } = useOrganization(ORG_ID);
  const { data: membersData } = useOrganizationMembers(ORG_ID);
  const { data: billingData } = useOrgBillingSummary(ORG_ID);

  const org = orgData?.data;
  const members = membersData?.data ?? [];
  const billing = billingData?.data;

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString(locale === 'en' ? 'en-US' : 'nb-NO') + ' kr';
  };

  if (orgLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spinner aria-label={t('common.loading')} data-size="lg" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        gap: 'var(--ds-spacing-4)',
      }}>
        <div>
          <Heading level={1} data-size="lg" style={{ margin: 0 }}>
            {org?.name || t('org.dashboard')}
          </Heading>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
            {t('org.dashboardDesc')}
          </Paragraph>
        </div>
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
          <NavLink to="/org/settings">
            <Button type="button" variant="secondary" data-size="md">
              {t('org.settings')}
            </Button>
          </NavLink>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
        gap: 'var(--ds-spacing-4)'
      }}>
        {/* Members Card */}
        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-4)' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--ds-border-radius-md)',
              backgroundColor: 'var(--ds-color-info-surface-default)',
              color: 'var(--ds-color-info-text-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <UsersIcon />
            </div>
            <div>
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                {t('org.members')}
              </Paragraph>
              <Heading level={2} data-size="xl" style={{ margin: 0 }}>
                {members.length}
              </Heading>
            </div>
          </div>
        </Card>

        {/* Bookings Card */}
        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-4)' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--ds-border-radius-md)',
              backgroundColor: 'var(--ds-color-success-surface-default)',
              color: 'var(--ds-color-success-text-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <CalendarCheckIcon />
            </div>
            <div>
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                {t('org.activeBookings')}
              </Paragraph>
              <Heading level={2} data-size="xl" style={{ margin: 0 }}>
                12
              </Heading>
            </div>
          </div>
        </Card>

        {/* Outstanding Invoices Card */}
        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-4)' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--ds-border-radius-md)',
              backgroundColor: (billing?.totalOutstanding ?? 0) > 0 
                ? 'var(--ds-color-warning-surface-default)' 
                : 'var(--ds-color-neutral-surface-hover)',
              color: (billing?.totalOutstanding ?? 0) > 0
                ? 'var(--ds-color-warning-text-default)'
                : 'var(--ds-color-neutral-text-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <InvoiceIcon />
            </div>
            <div>
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                {t('org.outstanding')}
              </Paragraph>
              <Heading level={2} data-size="xl" style={{ margin: 0, color: (billing?.totalOutstanding ?? 0) > 0 ? 'var(--ds-color-warning-text-default)' : undefined }}>
                {formatCurrency(billing?.totalOutstanding ?? 0)}
              </Heading>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          {t('org.quickActions')}
        </Heading>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
          gap: 'var(--ds-spacing-3)',
        }}>
          <NavLink to="/org/bookings" style={{ textDecoration: 'none' }}>
            <Button type="button" variant="secondary" data-size="md" style={{ width: '100%', minHeight: '44px' }}>
              {t('org.viewBookings')}
            </Button>
          </NavLink>
          <NavLink to="/org/invoices" style={{ textDecoration: 'none' }}>
            <Button type="button" variant="secondary" data-size="md" style={{ width: '100%', minHeight: '44px' }}>
              {t('org.viewInvoices')}
            </Button>
          </NavLink>
          <NavLink to="/org/season-rental" style={{ textDecoration: 'none' }}>
            <Button type="button" variant="secondary" data-size="md" style={{ width: '100%', minHeight: '44px' }}>
              {t('org.seasonRental')}
            </Button>
          </NavLink>
          <NavLink to="/org/members" style={{ textDecoration: 'none' }}>
            <Button type="button" variant="secondary" data-size="md" style={{ width: '100%', minHeight: '44px' }}>
              {t('org.manageMembers')}
            </Button>
          </NavLink>
        </div>
      </Card>

      {/* Members Preview */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          padding: 'var(--ds-spacing-4) var(--ds-spacing-5)',
          borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Heading level={2} data-size="sm" style={{ margin: 0 }}>
            {t('org.members')}
          </Heading>
          <NavLink to="/org/members">
            <Button type="button" variant="tertiary" data-size="sm">
              {t('common.viewAll')}
            </Button>
          </NavLink>
        </div>
        <div style={{ padding: 'var(--ds-spacing-4)' }}>
          {members.length === 0 ? (
            <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0, textAlign: 'center', padding: 'var(--ds-spacing-4)' }}>
              {t('org.noMembers')}
            </Paragraph>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
              {members.slice(0, 5).map((member: { id: string; name: string; role: string; email?: string }) => (
                <div
                  key={member.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--ds-spacing-3)',
                    borderRadius: 'var(--ds-border-radius-md)',
                    backgroundColor: 'var(--ds-color-neutral-surface-hover)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--ds-border-radius-full)',
                      backgroundColor: 'var(--ds-color-accent-surface-default)',
                      color: 'var(--ds-color-accent-text-default)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'var(--ds-font-weight-semibold)',
                    }}>
                      {member.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                        {member.name || member.email}
                      </Paragraph>
                      <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                        {member.email}
                      </Paragraph>
                    </div>
                  </div>
                  <Badge>{member.role || 'member'}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
