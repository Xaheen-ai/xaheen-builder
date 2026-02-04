/**
 * SeasonApplicationsReviewPage
 *
 * Saksbehandler page for reviewing seasonal lease applications
 * - Applications list with org info
 * - Status filter (pending, approved, rejected)
 * - Detail view with allocation suggestions
 * - Approve/reject with comments
 */

import { useState, useEffect } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Spinner,
  Badge,
  Table,
  useDialog,
  Drawer,
} from '@xaheen/ds';
import { useLocale } from '@xaheen/i18n';

const MOBILE_BREAKPOINT = 768;

type ApplicationStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'waitlist';

// Mock applications data
const mockApplications = [
  {
    id: 'app-001',
    seasonName: 'Vår 2026',
    seasonId: 'season-001',
    organization: 'Skien IL',
    orgId: 'org-001',
    requestedSlots: [
      { day: 'Monday', time: '18:00-20:00', resource: 'Idrettshall A' },
      { day: 'Wednesday', time: '18:00-20:00', resource: 'Idrettshall A' },
    ],
    totalHours: 48,
    priorityScore: 85,
    status: 'pending',
    submittedAt: '2026-01-10T14:30:00Z',
    notes: 'Vi trenger hallplass for ungdomsgruppen vår.',
  },
  {
    id: 'app-002',
    seasonName: 'Vår 2026',
    seasonId: 'season-001',
    organization: 'Telemark FK',
    orgId: 'org-002',
    requestedSlots: [
      { day: 'Tuesday', time: '16:00-18:00', resource: 'Fotballbane 1' },
      { day: 'Thursday', time: '16:00-18:00', resource: 'Fotballbane 1' },
      { day: 'Saturday', time: '10:00-12:00', resource: 'Fotballbane 1' },
    ],
    totalHours: 72,
    priorityScore: 92,
    status: 'under_review',
    submittedAt: '2026-01-08T09:00:00Z',
    notes: 'Juniorlag trenger fast treningstid.',
  },
];

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const colors: Record<ApplicationStatus, { bg: string; text: string }> = {
    pending: { bg: 'var(--ds-color-warning-surface-default)', text: 'var(--ds-color-warning-text-default)' },
    under_review: { bg: 'var(--ds-color-info-surface-default)', text: 'var(--ds-color-info-text-default)' },
    approved: { bg: 'var(--ds-color-success-surface-default)', text: 'var(--ds-color-success-text-default)' },
    rejected: { bg: 'var(--ds-color-danger-surface-default)', text: 'var(--ds-color-danger-text-default)' },
    waitlist: { bg: 'var(--ds-color-neutral-surface-default)', text: 'var(--ds-color-neutral-text-default)' },
  };
  const labels: Record<ApplicationStatus, string> = {
    pending: 'Venter',
    under_review: 'Under behandling',
    approved: 'Godkjent',
    rejected: 'Avslått',
    waitlist: 'Venteliste',
  };
  const color = colors[status] || colors.pending;
  return <Badge style={{ backgroundColor: color.bg, color: color.text }}>{labels[status]}</Badge>;
}

export function SeasonApplicationsReviewPage() {
  const { locale } = useLocale();
  const { confirm } = useDialog();
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | undefined>(undefined);
  const [selectedApp, setSelectedApp] = useState<typeof mockApplications[0] | null>(null);
  const [isLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const applications = statusFilter 
    ? mockApplications.filter(a => a.status === statusFilter)
    : mockApplications;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(locale === 'en' ? 'en-US' : 'nb-NO');
  };

  const handleApprove = async (id: string) => {
    const confirmed = await confirm({
      title: 'Godkjenn søknad',
      description: 'Er du sikker på at du vil godkjenne denne sesongsøknaden?',
      confirmText: 'Godkjenn',
      cancelText: 'Avbryt',
      variant: 'success',
    });
    if (confirmed) {
      console.log('Approved:', id);
      setSelectedApp(null);
    }
  };

  const handleReject = async (id: string) => {
    const confirmed = await confirm({
      title: 'Avslå søknad',
      description: 'Er du sikker på at du vil avslå denne sesongsøknaden?',
      confirmText: 'Avslå',
      cancelText: 'Avbryt',
      variant: 'danger',
    });
    if (confirmed) {
      console.log('Rejected:', id);
      setSelectedApp(null);
    }
  };

  // Stats
  const stats = {
    total: mockApplications.length,
    pending: mockApplications.filter(a => a.status === 'pending').length,
    underReview: mockApplications.filter(a => a.status === 'under_review').length,
    approved: mockApplications.filter(a => a.status === 'approved').length,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header */}
      <div>
        <Heading level={1} data-size="lg" style={{ margin: 0 }}>
          Sesongsøknader
        </Heading>
        <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
          Behandle søknader om faste tider for sesongen
        </Paragraph>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: 'var(--ds-spacing-4)',
      }}>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>Totalt</Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0 }}>{stats.total}</Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>Ventende</Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0, color: stats.pending > 0 ? 'var(--ds-color-warning-text-default)' : undefined }}>
            {stats.pending}
          </Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>Under behandling</Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0 }}>{stats.underReview}</Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>Godkjent</Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0, color: 'var(--ds-color-success-text-default)' }}>{stats.approved}</Heading>
        </Card>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', flexWrap: 'wrap' }}>
        {(['all', 'pending', 'under_review', 'approved', 'rejected'] as const).map((filter) => (
          <Button
            key={filter}
            type="button"
            variant={(filter === 'all' && !statusFilter) || statusFilter === filter ? 'primary' : 'tertiary'}
            data-size="sm"
            onClick={() => setStatusFilter(filter === 'all' ? undefined : filter as ApplicationStatus)}
            style={{ minHeight: '44px' }}
          >
            {filter === 'all' ? 'Alle' : filter === 'pending' ? 'Ventende' : filter === 'under_review' ? 'Under behandling' : filter === 'approved' ? 'Godkjent' : 'Avslått'}
          </Button>
        ))}
      </div>

      {/* Applications Table */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
            <Spinner aria-label="Laster..." data-size="lg" />
          </div>
        ) : applications.length === 0 ? (
          <div style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center' }}>
            <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
              Ingen søknader å vise
            </Paragraph>
          </div>
        ) : (
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>Organisasjon</Table.HeaderCell>
                <Table.HeaderCell>Sesong</Table.HeaderCell>
                <Table.HeaderCell>Timer</Table.HeaderCell>
                <Table.HeaderCell>Prioritet</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Mottatt</Table.HeaderCell>
                <Table.HeaderCell style={{ width: '180px' }}>Handlinger</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {applications.map((app) => (
                <Table.Row key={app.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedApp(app)}>
                  <Table.Cell>
                    <span style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>{app.organization}</span>
                  </Table.Cell>
                  <Table.Cell>{app.seasonName}</Table.Cell>
                  <Table.Cell>{app.totalHours} t</Table.Cell>
                  <Table.Cell>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--ds-border-radius-full)',
                      backgroundColor: app.priorityScore >= 90 ? 'var(--ds-color-success-surface-default)' :
                                       app.priorityScore >= 70 ? 'var(--ds-color-warning-surface-default)' :
                                       'var(--ds-color-neutral-surface-default)',
                      color: app.priorityScore >= 90 ? 'var(--ds-color-success-text-default)' :
                             app.priorityScore >= 70 ? 'var(--ds-color-warning-text-default)' :
                             'var(--ds-color-neutral-text-default)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'var(--ds-font-weight-semibold)',
                      fontSize: 'var(--ds-font-size-sm)',
                    }}>
                      {app.priorityScore}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <StatusBadge status={app.status as ApplicationStatus} />
                  </Table.Cell>
                  <Table.Cell>{formatDate(app.submittedAt)}</Table.Cell>
                  <Table.Cell onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
                      <Button type="button" variant="primary" data-size="sm" onClick={() => handleApprove(app.id)}>
                        Godkjenn
                      </Button>
                      <Button type="button" variant="secondary" data-size="sm" onClick={() => handleReject(app.id)}>
                        Avslå
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </Card>

      {/* Detail Drawer */}
      <Drawer
        isOpen={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        position="right"
        size="lg"
        aria-label="Søknadsdetaljer"
      >
        {selectedApp && (
          <div style={{ padding: 'var(--ds-spacing-6)', display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-5)' }}>
            <div>
              <Heading level={2} data-size="md" style={{ margin: 0 }}>
                {selectedApp.organization}
              </Heading>
              <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
                Søknad til {selectedApp.seasonName}
              </Paragraph>
            </div>

            <Card style={{ padding: 'var(--ds-spacing-4)' }}>
              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)', marginBottom: 'var(--ds-spacing-3)' }}>
                Ønskede tider
              </Paragraph>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
                {selectedApp.requestedSlots.map((slot, i) => (
                  <div key={i} style={{
                    padding: 'var(--ds-spacing-3)',
                    borderRadius: 'var(--ds-border-radius-md)',
                    backgroundColor: 'var(--ds-color-neutral-surface-hover)',
                  }}>
                    <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                      {slot.day} {slot.time}
                    </Paragraph>
                    <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                      {slot.resource}
                    </Paragraph>
                  </div>
                ))}
              </div>
            </Card>

            {selectedApp.notes && (
              <Card style={{ padding: 'var(--ds-spacing-4)' }}>
                <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)', marginBottom: 'var(--ds-spacing-2)' }}>
                  Merknad fra søker
                </Paragraph>
                <Paragraph data-size="sm" style={{ margin: 0 }}>
                  {selectedApp.notes}
                </Paragraph>
              </Card>
            )}

            <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', marginTop: 'auto' }}>
              <Button type="button" variant="primary" onClick={() => handleApprove(selectedApp.id)} style={{ flex: 1, minHeight: '44px' }}>
                Godkjenn søknad
              </Button>
              <Button type="button" variant="secondary" onClick={() => handleReject(selectedApp.id)} style={{ flex: 1, minHeight: '44px' }}>
                Avslå søknad
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
