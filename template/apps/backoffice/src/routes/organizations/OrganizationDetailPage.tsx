/**
 * Organization Detail Page
 * Full-page view for viewing and managing a single organization
 */

import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Badge,
  Spinner,
  Stack,
  Tabs,
  EditIcon,
  ArrowLeftIcon,
  TrashIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  UsersIcon,
  CalendarIcon,
  ClockIcon,
  TrendUpIcon,
  GlobeIcon,
  StatCard,
  Table,
  BookingStatusBadge,
  PaymentStatusBadge,
  formatTimeAgo,
} from '@xaheen/ds';
import {
  useOrganization,
  useOrganizationMembers,
  useDeleteOrganization,
  useVerifyOrganization,
  useBookings,
  useSeasonalLeases,
  useResourceAudit,
  formatDate,
  formatTime,
  type ActorType,
  type OrganizationStatus,
  type Booking,
} from '@xaheen/sdk';
import { MemberManagement } from '../../components/organizations/MemberManagement';
import { FormSection } from '../../components/shared';
import { useMemo } from 'react';

const actorTypeLabels: Record<ActorType, string> = {
  private: 'Privatperson',
  business: 'Bedrift',
  sports_club: 'Idrettslag',
  youth_organization: 'Ungdomsorganisasjon',
  school: 'Skole',
  municipality: 'Kommune',
};

const actorTypeColors: Record<ActorType, 'neutral' | 'info' | 'success' | 'warning'> = {
  private: 'neutral',
  business: 'info',
  sports_club: 'success',
  youth_organization: 'warning',
  school: 'info',
  municipality: 'success',
};

const statusColors: Record<OrganizationStatus, 'success' | 'warning' | 'danger'> = {
  active: 'success',
  inactive: 'warning',
  suspended: 'danger',
};

export function OrganizationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Queries
  const { data: orgData, isLoading } = useOrganization(id!);
  const organization = orgData?.data;

  const { data: membersData } = useOrganizationMembers(id!);
  const members = membersData?.data ?? [];

  const { data: bookingsData, isLoading: loadingBookings } = useBookings({ organizationId: id, limit: 100 });
  const bookings = bookingsData?.data ?? [];

  const { data: seasonalLeasesData, isLoading: loadingSeasons } = useSeasonalLeases({ organizationId: id, limit: 50 });
  const seasonalLeases = seasonalLeasesData?.data ?? [];

  const { data: auditData } = useResourceAudit('organization', id!, { limit: 10 });
  const auditEvents = auditData?.data ?? [];

  // Mutations
  const deleteOrgMutation = useDeleteOrganization();
  const verifyOrgMutation = useVerifyOrganization();

  // Calculate statistics
  const stats = useMemo(() => {
    const totalBookings = bookings.length;
    const activeBookings = bookings.filter(b => b.status === 'confirmed').length;
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const totalRevenue = bookings
      .filter(b => b.status === 'confirmed' || b.status === 'completed')
      .reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);

    return {
      totalBookings,
      activeBookings,
      pendingBookings,
      totalRevenue,
      totalSeasons: seasonalLeases.length,
      activeSeasons: seasonalLeases.filter(s => s.status === 'active').length,
    };
  }, [bookings, seasonalLeases]);

  // Extract metadata
  const metadata = organization?.metadata as Record<string, string> | undefined;
  const logo = metadata?.logo || metadata?.logoUrl;
  const description = metadata?.description || metadata?.about;
  const website = metadata?.website || metadata?.websiteUrl;

  // Handlers
  const handleDelete = async () => {
    if (confirm('Er du sikker på at du vil slette denne organisasjonen?')) {
      await deleteOrgMutation.mutateAsync(id!);
      navigate('/organizations');
    }
  };

  const handleVerify = async () => {
    await verifyOrgMutation.mutateAsync(id!);
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
        <Spinner data-size="lg" aria-label="Laster..." />
      </div>
    );
  }

  if (!organization) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
        <Heading level={3} data-size="sm">Organisasjon ikke funnet</Heading>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)' }}>
          Organisasjonen eksisterer ikke eller er slettet.
        </Paragraph>
        <Link to="/organizations">
          <Button variant="secondary" data-size="sm" style={{ marginTop: 'var(--ds-spacing-4)' }} type="button">
            <ArrowLeftIcon />
            Tilbake til oversikt
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-5)', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div>
        <Link to="/organizations">
          <Button variant="tertiary" data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)' }} type="button">
            <ArrowLeftIcon />
            Tilbake til oversikt
          </Button>
        </Link>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--ds-spacing-4)' }}>
          <div style={{ display: 'flex', gap: 'var(--ds-spacing-4)', alignItems: 'flex-start' }}>
            {/* Logo */}
            {logo && (
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: 'var(--ds-border-radius-md)',
                overflow: 'hidden',
                border: '1px solid var(--ds-color-neutral-border-subtle)',
                flexShrink: 0,
              }}>
                <img
                  src={logo}
                  alt={`${organization.name} logo`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            )}

            <div>
              <Heading level={2} data-size="lg" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                {organization.name}
              </Heading>
              <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', flexWrap: 'wrap', marginBottom: 'var(--ds-spacing-2)' }}>
                <Badge color={actorTypeColors[organization.actorType]}>
                  {actorTypeLabels[organization.actorType]}
                </Badge>
                <Badge color={statusColors[organization.status]}>
                  {organization.status === 'active' ? 'Aktiv' : organization.status === 'inactive' ? 'Inaktiv' : 'Suspendert'}
                </Badge>
                {organization.verified && (
                  <Badge color="success">
                    <CheckCircleIcon /> Verifisert
                  </Badge>
                )}
              </div>
              {description && (
                <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-default)', maxWidth: '600px', marginTop: 'var(--ds-spacing-2)' }}>
                  {description}
                </Paragraph>
              )}
              {website && (
                <div style={{ marginTop: 'var(--ds-spacing-2)' }}>
                  <a
                    href={website.startsWith('http') ? website : `https://${website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 'var(--ds-spacing-1)',
                      color: 'var(--ds-color-accent-text-default)',
                      fontSize: 'var(--ds-font-size-sm)',
                    }}
                  >
                    <GlobeIcon size={16} />
                    {website}
                  </a>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
            <Link to={`/organizations/${id}/edit`}>
              <Button variant="secondary" data-size="sm" type="button">
                <EditIcon />
                Rediger
              </Button>
            </Link>
            {!organization.verified && (
              <Button variant="secondary" data-size="sm" onClick={handleVerify} type="button">
                <ShieldCheckIcon />
                Verifiser
              </Button>
            )}
            <Button variant="danger" data-size="sm" onClick={handleDelete} type="button">
              <TrashIcon />
              Slett
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--ds-spacing-3)',
        }}
      >
        <StatCard
          title="Totale bookinger"
          value={stats.totalBookings}
          description="Alle tider"
          color="var(--ds-color-info-text-default)"
          icon={<CalendarIcon />}
        />
        <StatCard
          title="Aktive bookinger"
          value={stats.activeBookings}
          description="Bekreftet"
          color="var(--ds-color-success-text-default)"
          icon={<CheckCircleIcon />}
        />
        <StatCard
          title="Ventende"
          value={stats.pendingBookings}
          description="Krever godkjenning"
          color="var(--ds-color-warning-text-default)"
          icon={<ClockIcon />}
        />
        <StatCard
          title="Total omsetning"
          value={`${stats.totalRevenue.toLocaleString('nb-NO')} kr`}
          description="Totalt betalt"
          color="var(--ds-color-accent-text-default)"
          icon={<TrendUpIcon />}
        />
        <StatCard
          title="Sesongleie"
          value={stats.totalSeasons}
          description={`${stats.activeSeasons} aktive`}
          color="var(--ds-color-info-text-default)"
          icon={<CalendarIcon />}
        />
        <StatCard
          title="Medlemmer"
          value={members.length}
          description="Aktive brukere"
          color="var(--ds-color-neutral-text-default)"
          icon={<UsersIcon />}
        />
      </div>

      {/* Content */}
      <Tabs defaultValue="info">
        <Tabs.List>
          <Tabs.Tab value="info">Informasjon</Tabs.Tab>
          <Tabs.Tab value="members">
            <UsersIcon />
            Medlemmer ({members.length})
          </Tabs.Tab>
          <Tabs.Tab value="bookings">
            <CalendarIcon />
            Bookinger ({stats.totalBookings})
          </Tabs.Tab>
          <Tabs.Tab value="seasons">Sesongleie ({stats.totalSeasons})</Tabs.Tab>
          <Tabs.Tab value="activity">Aktivitet</Tabs.Tab>
        </Tabs.List>

        {/* Information Tab */}
        <Tabs.Panel value="info">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--ds-spacing-4)' }}>
            <Card>
              <FormSection title="Grunnleggende informasjon">
                <Stack spacing={3}>
                  <div>
                    <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                      Type organisasjon
                    </div>
                    <Badge color={actorTypeColors[organization.actorType]}>
                      {actorTypeLabels[organization.actorType]}
                    </Badge>
                  </div>

                  {organization.organizationNumber && (
                    <div>
                      <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                        Organisasjonsnummer
                      </div>
                      <div style={{ fontFamily: 'var(--ds-font-family-monospace)', fontSize: 'var(--ds-font-size-md)' }}>
                        {organization.organizationNumber}
                      </div>
                    </div>
                  )}

                  <div>
                    <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                      Status
                    </div>
                    <Badge color={statusColors[organization.status]}>
                      {organization.status === 'active' ? 'Aktiv' : organization.status === 'inactive' ? 'Inaktiv' : 'Suspendert'}
                    </Badge>
                  </div>

                  <div>
                    <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                      Verifisert
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-1)' }}>
                      {organization.verified ? (
                        <>
                          <CheckCircleIcon style={{ color: 'var(--ds-color-success-text-default)' }} />
                          <span>Ja</span>
                        </>
                      ) : (
                        <>
                          <XCircleIcon style={{ color: 'var(--ds-color-neutral-text-subtle)' }} />
                          <span>Nei</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                      Opprettet
                    </div>
                    <div>{formatDate(organization.createdAt)}</div>
                    <div style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                      ({formatTimeAgo(organization.createdAt)})
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                      Sist oppdatert
                    </div>
                    <div>{formatDate(organization.updatedAt)}</div>
                    <div style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                      ({formatTimeAgo(organization.updatedAt)})
                    </div>
                  </div>
                </Stack>
              </FormSection>
            </Card>

            <Card>
              <FormSection title="Kontaktinformasjon">
                <Stack spacing={3}>
                  {organization.email ? (
                    <div>
                      <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                        E-post
                      </div>
                      <a href={`mailto:${organization.email}`} style={{ color: 'var(--ds-color-accent-text-default)' }}>
                        {organization.email}
                      </a>
                    </div>
                  ) : (
                    <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                      Ingen e-postadresse registrert
                    </Paragraph>
                  )}

                  {organization.phone && (
                    <div>
                      <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                        Telefon
                      </div>
                      <a href={`tel:${organization.phone}`} style={{ color: 'var(--ds-color-accent-text-default)' }}>
                        {organization.phone}
                      </a>
                    </div>
                  )}

                  {(organization.address || organization.city || organization.postalCode) ? (
                    <div>
                      <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                        Adresse
                      </div>
                      <div>
                        {organization.address && <div>{organization.address}</div>}
                        {(organization.postalCode || organization.city) && (
                          <div>{[organization.postalCode, organization.city].filter(Boolean).join(' ')}</div>
                        )}
                      </div>
                    </div>
                  ) : (
                    !organization.email && !organization.phone && (
                      <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                        Ingen adresse registrert
                      </Paragraph>
                    )
                  )}
                </Stack>
              </FormSection>
            </Card>
          </div>
        </Tabs.Panel>

        {/* Members Tab */}
        <Tabs.Panel value="members">
          <Card>
            <MemberManagement organizationId={organization.id} members={members} />
          </Card>
        </Tabs.Panel>

        {/* Bookings Tab */}
        <Tabs.Panel value="bookings">
          <Card>
            {loadingBookings ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-6)' }}>
                <Spinner aria-label="Laster bookinger..." />
              </div>
            ) : bookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
                <CalendarIcon size={48} style={{ color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-3)' }} />
                <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                  Ingen bookinger ennå
                </Heading>
                <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Denne organisasjonen har ikke gjort noen bookinger.
                </Paragraph>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 'var(--ds-spacing-4)' }}>
                  <Heading level={3} data-size="sm">
                    Bookinger ({bookings.length})
                  </Heading>
                </div>
                <div style={{ overflow: 'auto' }}>
                  <Table>
                    <Table.Head>
                      <Table.Row>
                        <Table.HeaderCell>Booking</Table.HeaderCell>
                        <Table.HeaderCell>Ressurs</Table.HeaderCell>
                        <Table.HeaderCell>Tidspunkt</Table.HeaderCell>
                        <Table.HeaderCell>Status</Table.HeaderCell>
                        <Table.HeaderCell>Betaling</Table.HeaderCell>
                        <Table.HeaderCell style={{ textAlign: 'right' }}>Pris</Table.HeaderCell>
                      </Table.Row>
                    </Table.Head>
                    <Table.Body>
                      {bookings.map((booking: Booking) => (
                        <Table.Row
                          key={booking.id}
                          style={{ cursor: 'pointer' }}
                          onClick={() => navigate(`/bookings/${booking.id}`)}
                        >
                          <Table.Cell>
                            <span style={{ fontFamily: 'var(--ds-font-family-monospace)', fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-accent-text-default)' }}>
                              #{booking.id.split('-')[0]?.toUpperCase()}
                            </span>
                          </Table.Cell>
                          <Table.Cell>
                            <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                              {booking.listingName || booking.listingId}
                            </Paragraph>
                          </Table.Cell>
                          <Table.Cell>
                            <div>
                              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                                {formatDate(booking.startTime)}
                              </Paragraph>
                              <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                                {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
                              </Paragraph>
                            </div>
                          </Table.Cell>
                          <Table.Cell>
                            <BookingStatusBadge status={booking.status} />
                          </Table.Cell>
                          <Table.Cell>
                            <PaymentStatusBadge status={booking.paymentStatus || 'unpaid'} />
                          </Table.Cell>
                          <Table.Cell style={{ textAlign: 'right' }}>
                            <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                              {(Number(booking.totalPrice) || 0).toLocaleString('nb-NO')} kr
                            </Paragraph>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                </div>
              </>
            )}
          </Card>
        </Tabs.Panel>

        {/* Seasons Tab */}
        <Tabs.Panel value="seasons">
          <Card>
            {loadingSeasons ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-6)' }}>
                <Spinner aria-label="Laster sesongleie..." />
              </div>
            ) : seasonalLeases.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
                <CalendarIcon size={48} style={{ color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-3)' }} />
                <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                  Ingen sesongleie-avtaler
                </Heading>
                <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Denne organisasjonen har ingen sesongleie-avtaler.
                </Paragraph>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 'var(--ds-spacing-4)' }}>
                  <Heading level={3} data-size="sm">
                    Sesongleie-avtaler ({seasonalLeases.length})
                  </Heading>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
                  {seasonalLeases.map((lease: any) => (
                    <div
                      key={lease.id}
                      style={{
                        padding: 'var(--ds-spacing-4)',
                        border: '1px solid var(--ds-color-neutral-border-subtle)',
                        borderRadius: 'var(--ds-border-radius-md)',
                        cursor: 'pointer',
                      }}
                      onClick={() => navigate(`/seasonal-leases/${lease.id}`)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <Heading level={4} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-1)' }}>
                            {lease.listingName || lease.listingId}
                          </Heading>
                          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                            {formatDate(lease.startDate)} - {formatDate(lease.endDate)}
                          </Paragraph>
                        </div>
                        <Badge color={lease.status === 'active' ? 'success' : lease.status === 'approved' ? 'info' : 'neutral'}>
                          {lease.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>
        </Tabs.Panel>

        {/* Activity Tab */}
        <Tabs.Panel value="activity">
          <Card>
            {auditEvents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
                <ClockIcon size={48} style={{ color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-3)' }} />
                <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                  Ingen aktivitet
                </Heading>
                <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Ingen hendelser er registrert for denne organisasjonen.
                </Paragraph>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 'var(--ds-spacing-4)' }}>
                  <Heading level={3} data-size="sm">
                    Siste aktivitet
                  </Heading>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
                  {auditEvents.map((event: any) => (
                    <div
                      key={event.id}
                      style={{
                        padding: 'var(--ds-spacing-3)',
                        border: '1px solid var(--ds-color-neutral-border-subtle)',
                        borderRadius: 'var(--ds-border-radius-sm)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--ds-spacing-1)' }}>
                        <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                          {event.action}
                        </Paragraph>
                        <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                          {formatTimeAgo(event.timestamp)}
                        </Paragraph>
                      </div>
                      {event.description && (
                        <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                          {event.description}
                        </Paragraph>
                      )}
                      {event.userId && (
                        <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                          Av: {event.userName || event.userId}
                        </Paragraph>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
