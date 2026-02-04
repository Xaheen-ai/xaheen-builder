import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Container, Heading, Paragraph, Card, Button, Spinner } from '@xaheen/ds';
import { useSeasons } from '@xaheen/sdk/hooks';
import { useAccountContext } from '../providers/AccountContextProvider';
import { SeasonStatusBadge } from '../features/seasons/components/SeasonStatusBadge';
import { SeasonApplicationDrawer, type SeasonApplicationFormData } from '../features/seasons/components/SeasonApplicationDrawer';

/**
 * Season Detail Page
 *
 * Displays detailed information about a specific season with tabs for:
 * - Overview: General information and description
 * - Available Venues: Listings that support this season
 * - My Applications: User's submitted applications for this season
 * - Rules: Terms and conditions
 */

// Icons
function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="9 12 12 15 16 10" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function FileTextIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );
}

type TabId = 'overview' | 'venues' | 'applications' | 'rules';

export function SeasonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { accountType, selectedOrganization } = useAccountContext();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Fetch all seasons and find the one we need
  // TODO: Replace with useSeason(id) when available in SDK
  const { data: seasonsResponse, isLoading, error } = useSeasons();
  const season = seasonsResponse?.data?.find((s) => s.id === id);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('no-NO', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Open drawer if ?apply=true is in URL
  useEffect(() => {
    if (searchParams.get('apply') === 'true') {
      setIsDrawerOpen(true);
      // Remove the query param
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const handleApply = () => {
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleSubmitApplication = async (data: SeasonApplicationFormData) => {
    // TODO: Use SDK's useCreateSeasonApplication() hook
    // For now, just simulate a successful submission
    console.log('Submitting season application:', data);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Show success message (could use a toast notification)
    alert('Søknad sendt! Du vil motta en bekreftelse når søknaden er behandlet.');

    // Refresh the page or update state to show the new application
    // navigate(`/seasons/${id}?tab=applications`);
  };

  if (isLoading) {
    return (
      <Container style={{ padding: 'var(--ds-spacing-8)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-10)' }}>
          <Spinner aria-label="Laster..." />
        </div>
      </Container>
    );
  }

  if (error || !season) {
    return (
      <Container style={{ padding: 'var(--ds-spacing-8)' }}>
        <Card style={{ padding: 'var(--ds-spacing-6)', textAlign: 'center' }}>
          <Paragraph style={{ margin: 0, color: 'var(--ds-color-danger-text-default)' }}>
            Kunne ikke laste sesong. Vennligst prøv igjen senere.
          </Paragraph>
          <Button
            type="button"
            variant="secondary"
            data-size="sm"
            onClick={() => navigate('/seasons')}
            style={{ marginTop: 'var(--ds-spacing-4)' }}
          >
            Tilbake til oversikt
          </Button>
        </Card>
      </Container>
    );
  }

  const isOpen = season.status === 'open';
  const tabs = [
    { id: 'overview' as TabId, label: 'Oversikt', icon: <InfoIcon /> },
    { id: 'venues' as TabId, label: 'Tilgjengelige lokaler', icon: <MapPinIcon /> },
    { id: 'applications' as TabId, label: 'Mine søknader', icon: <FileTextIcon /> },
    { id: 'rules' as TabId, label: 'Regler og vilkår', icon: <CheckCircleIcon /> },
  ];

  return (
    <Container style={{ padding: 'var(--ds-spacing-8)' }}>
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--ds-spacing-2)',
          marginBottom: 'var(--ds-spacing-6)',
          fontSize: 'var(--ds-font-size-sm)',
        }}
      >
        <Link
          to="/seasons"
          style={{
            color: 'var(--ds-color-accent-text-default)',
            textDecoration: 'none',
          }}
        >
          Sesongbooking
        </Link>
        <ChevronRightIcon />
        <span style={{ color: 'var(--ds-color-neutral-text-default)' }}>{season.name}</span>
      </nav>

      {/* Account Context Banner */}
      {accountType === 'organization' && selectedOrganization && (
        <Card
          style={{
            marginBottom: 'var(--ds-spacing-6)',
            padding: 'var(--ds-spacing-4)',
            backgroundColor: 'var(--ds-color-success-surface-default)',
            border: '1px solid var(--ds-color-success-border-default)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--ds-border-radius-md)',
                backgroundColor: 'var(--ds-color-success-base-default)',
                color: 'var(--ds-color-neutral-contrast-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <BuildingIcon />
            </div>
            <div>
              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)' }}>
                Du søker på vegne av: {selectedOrganization.name}
              </Paragraph>
              <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                Søknader sendes inn som organisasjon
              </Paragraph>
            </div>
          </div>
        </Card>
      )}

      {/* Season Header */}
      <Card style={{ padding: 'var(--ds-spacing-6)', marginBottom: 'var(--ds-spacing-6)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--ds-spacing-4)', marginBottom: 'var(--ds-spacing-4)' }}>
          <div>
            <Heading level={1} data-size="lg" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
              {season.name}
            </Heading>
            <SeasonStatusBadge status={season.status} size="md" />
          </div>
          {isOpen && (
            <Button type="button" variant="primary" onClick={handleApply}>
              Søk nå
            </Button>
          )}
        </div>

        {season.description && (
          <Paragraph style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
            {season.description}
          </Paragraph>
        )}
      </Card>

      {/* Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'var(--ds-spacing-4)',
          marginBottom: 'var(--ds-spacing-8)',
        }}
      >
        {/* Period */}
        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--ds-border-radius-md)',
                backgroundColor: 'var(--ds-color-accent-surface-default)',
                color: 'var(--ds-color-accent-base-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <CalendarIcon />
            </div>
            <div>
              <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                Periode
              </Paragraph>
              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)' }}>
                {formatDate(season.startDate)} - {formatDate(season.endDate)}
              </Paragraph>
            </div>
          </div>
        </Card>

        {/* Deadline */}
        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--ds-border-radius-md)',
                backgroundColor: 'var(--ds-color-warning-surface-default)',
                color: 'var(--ds-color-warning-base-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ClockIcon />
            </div>
            <div>
              <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                Søknadsfrist
              </Paragraph>
              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)' }}>
                {formatDate(season.applicationDeadline)}
              </Paragraph>
            </div>
          </div>
        </Card>

        {/* Applications */}
        {season.totalApplications !== undefined && (
          <Card style={{ padding: 'var(--ds-spacing-5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--ds-border-radius-md)',
                  backgroundColor: 'var(--ds-color-success-surface-default)',
                  color: 'var(--ds-color-success-base-default)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <BuildingIcon />
              </div>
              <div>
                <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                  Søknader
                </Paragraph>
                <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)' }}>
                  {season.totalApplications} totalt
                  {season.approvedApplications !== undefined && ` • ${season.approvedApplications} godkjent`}
                </Paragraph>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Tabs */}
      <div
        style={{
          borderBottom: '2px solid var(--ds-color-neutral-border-default)',
          marginBottom: 'var(--ds-spacing-6)',
          display: 'flex',
          gap: 'var(--ds-spacing-2)',
          overflowX: 'auto',
        }}
      >
        {tabs.map((tab) => (
          // eslint-disable-next-line digdir/prefer-ds-components -- Custom styled tab button
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            style={{
              all: 'unset',
              cursor: 'pointer',
              padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-2)',
              borderBottom: activeTab === tab.id ? '2px solid var(--ds-color-accent-base-default)' : '2px solid transparent',
              color: activeTab === tab.id ? 'var(--ds-color-accent-text-default)' : 'var(--ds-color-neutral-text-default)',
              fontWeight: activeTab === tab.id ? 'var(--ds-font-weight-semibold)' : 'var(--ds-font-weight-regular)',
              marginBottom: '-2px',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <Card style={{ padding: 'var(--ds-spacing-6)' }}>
            <Heading level={2} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
              Om sesongen
            </Heading>
            <Paragraph style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
              {season.description || 'Ingen beskrivelse tilgjengelig.'}
            </Paragraph>

            <Heading level={3} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-3)', marginTop: 'var(--ds-spacing-6)' }}>
              Viktig informasjon
            </Heading>
            <div style={{ display: 'grid', gap: 'var(--ds-spacing-3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--ds-spacing-3)', backgroundColor: 'var(--ds-color-neutral-background-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
                <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                  Sesongperiode
                </Paragraph>
                <Paragraph data-size="sm" style={{ margin: 0 }}>
                  {formatDate(season.startDate)} - {formatDate(season.endDate)}
                </Paragraph>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--ds-spacing-3)', backgroundColor: 'var(--ds-color-neutral-background-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
                <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                  Søknadsfrist
                </Paragraph>
                <Paragraph data-size="sm" style={{ margin: 0 }}>
                  {formatDate(season.applicationDeadline)}
                </Paragraph>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--ds-spacing-3)', backgroundColor: 'var(--ds-color-neutral-background-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
                <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                  Status
                </Paragraph>
                <SeasonStatusBadge status={season.status} size="sm" />
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'venues' && (
          <>
            {/* TODO: Replace with useListings({ seasonId: id }) from SDK */}
            {/* For now, show empty state */}
            {[].length === 0 ? (
              <Card style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center' }}>
                <Heading level={2} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
                  Tilgjengelige lokaler
                </Heading>
                <Paragraph style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-4)' }}>
                  Ingen lokaler er tilgjengelige for denne sesongen for øyeblikket.
                </Paragraph>
                <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Lokaler vil vises her når de er lagt til for denne sesongen.
                </Paragraph>
              </Card>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: 'var(--ds-spacing-6)',
                }}
              >
                {/* Venue cards will be mapped here */}
              </div>
            )}
          </>
        )}

        {activeTab === 'applications' && (
          <>
            {/* TODO: Replace with useSeasonApplications({ seasonId: id }) from SDK */}
            {/* For now, show empty state */}
            {[].length === 0 ? (
              <Card style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center' }}>
                <Heading level={2} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
                  Mine søknader
                </Heading>
                <Paragraph style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-4)' }}>
                  Du har ikke sendt inn noen søknader for denne sesongen ennå.
                </Paragraph>
                {isOpen && (
                  <Button
                    type="button"
                    variant="primary"
                    data-size="sm"
                    onClick={handleApply}
                  >
                    Send søknad
                  </Button>
                )}
              </Card>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: 'var(--ds-spacing-6)',
                }}
              >
                {/* Application cards will be mapped here */}
              </div>
            )}
          </>
        )}

        {activeTab === 'rules' && (
          <Card style={{ padding: 'var(--ds-spacing-6)' }}>
            <Heading level={2} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
              Regler og vilkår
            </Heading>
            <Paragraph style={{ margin: 0, marginBottom: 'var(--ds-spacing-3)' }}>
              Ved å søke om sesongbooking aksepterer du følgende vilkår:
            </Paragraph>
            {/* eslint-disable-next-line digdir/prefer-ds-components -- Simple list of terms and conditions */}
            <ul style={{ margin: 0, paddingLeft: 'var(--ds-spacing-6)', display: 'grid', gap: 'var(--ds-spacing-2)' }}>
              <li>
                <Paragraph data-size="sm" style={{ margin: 0 }}>
                  Søknaden er bindende ved godkjenning
                </Paragraph>
              </li>
              <li>
                <Paragraph data-size="sm" style={{ margin: 0 }}>
                  Du må møte opp til alle reserverte tider
                </Paragraph>
              </li>
              <li>
                <Paragraph data-size="sm" style={{ margin: 0 }}>
                  Avbestillinger må gjøres minst 24 timer i forveien
                </Paragraph>
              </li>
              <li>
                <Paragraph data-size="sm" style={{ margin: 0 }}>
                  Ved gjentatte uteblivelser kan sesongbookingen trekkes tilbake
                </Paragraph>
              </li>
              <li>
                <Paragraph data-size="sm" style={{ margin: 0 }}>
                  Du er ansvarlig for lokalene under bruk
                </Paragraph>
              </li>
            </ul>
          </Card>
        )}
      </div>

      {/* Floating Action Button (mobile) */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: 'var(--ds-spacing-6)',
            right: 'var(--ds-spacing-6)',
            zIndex: 100,
            display: 'none',
          }}
          className="mobile-fab"
        >
          <Button
            type="button"
            variant="primary"
            onClick={handleApply}
            style={{
              borderRadius: 'var(--ds-border-radius-full)',
              padding: 'var(--ds-spacing-4) var(--ds-spacing-6)',
              boxShadow: 'var(--ds-shadow-large)',
            }}
          >
            Søk nå
          </Button>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .mobile-fab {
            display: block !important;
          }
        }
      `}</style>

      {/* Application Drawer */}
      {season && (
        <SeasonApplicationDrawer
          season={season}
          isOpen={isDrawerOpen}
          onClose={handleCloseDrawer}
          onSubmit={handleSubmitApplication}
        />
      )}
    </Container>
  );
}
