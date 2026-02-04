/**
 * User Detail Page
 * Full-page view for viewing and managing a single backoffice user
 */

import { useState } from 'react';
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
  ArrowLeftIcon,
  EditIcon,
  XCircleIcon,
  CheckCircleIcon,
  UserIcon,
  MailIcon,
  PhoneIcon,
  CopyIcon,
  ShieldCheckIcon,
  ClockIcon,
} from '@xaheen/ds';
import {
  useUser,
  useDeactivateUser,
  useReactivateUser,
  type UserRole,
  type UserStatus,
} from '@xaheen/sdk';

const roleLabels: Record<UserRole, string> = {
  super_admin: 'Superadmin',
  admin: 'Administrator',
  saksbehandler: 'Saksbehandler',
  user: 'Bruker',
};

const roleColors: Record<UserRole, 'success' | 'info' | 'warning' | 'neutral'> = {
  super_admin: 'success',
  admin: 'info',
  saksbehandler: 'warning',
  user: 'neutral',
};

const statusColors: Record<UserStatus, 'success' | 'warning' | 'danger'> = {
  active: 'success',
  inactive: 'warning',
  suspended: 'danger',
};

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Queries
  const { data: userData, isLoading } = useUser(id!);
  const user = userData?.data;

  // Mutations
  const deactivateUserMutation = useDeactivateUser();
  const reactivateUserMutation = useReactivateUser();

  // Handlers
  const handleEdit = () => {
    navigate(`/users/${id}/edit`);
  };

  const handleDeactivate = async () => {
    if (user && confirm('Er du sikker på at du vil deaktivere denne brukeren?')) {
      await deactivateUserMutation.mutateAsync(user.id);
    }
  };

  const handleReactivate = async () => {
    if (user) {
      await reactivateUserMutation.mutateAsync(user.id);
    }
  };

  const handleCopyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
        <Spinner data-size="lg" aria-label="Laster..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
        <Heading level={3} data-size="sm">Bruker ikke funnet</Heading>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)' }}>
          Brukeren eksisterer ikke eller er slettet.
        </Paragraph>
        <Link to="/users">
          <Button variant="secondary" data-size="sm" style={{ marginTop: 'var(--ds-spacing-4)' }} type="button">
            <ArrowLeftIcon />
            Tilbake til oversikt
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-5)', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Breadcrumb */}
      <div>
        <Link to="/users">
          <Button variant="tertiary" data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)' }} type="button">
            <ArrowLeftIcon />
            Tilbake til brukere
          </Button>
        </Link>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Heading level={2} data-size="lg">
              {user.name}
            </Heading>
            <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', marginTop: 'var(--ds-spacing-2)' }}>
              <Badge color={roleColors[user.role]}>
                {roleLabels[user.role]}
              </Badge>
              <Badge color={statusColors[user.status]}>
                {user.status === 'active' ? 'Aktiv' : user.status === 'inactive' ? 'Inaktiv' : 'Suspendert'}
              </Badge>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
            <Button variant="secondary" data-size="sm" onClick={handleEdit} type="button">
              <EditIcon />
              Rediger
            </Button>
            {user.status === 'active' ? (
              <Button variant="secondary" data-size="sm" onClick={handleDeactivate} type="button">
                <XCircleIcon />
                Deaktiver
              </Button>
            ) : (
              <Button variant="secondary" data-size="sm" onClick={handleReactivate} type="button">
                <CheckCircleIcon />
                Reaktiver
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <Tabs defaultValue="info">
        <Tabs.List>
          <Tabs.Tab value="info">
            <UserIcon />
            Informasjon
          </Tabs.Tab>
          <Tabs.Tab value="activity">
            <ClockIcon />
            Aktivitet
          </Tabs.Tab>
          <Tabs.Tab value="security">
            <ShieldCheckIcon />
            Sikkerhet
          </Tabs.Tab>
        </Tabs.List>

        {/* Information Tab */}
        <Tabs.Panel value="info">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--ds-spacing-4)' }}>
            {/* Contact Information */}
            <Card>
              <Stack spacing={4}>
                <Heading level={3} data-size="sm">Kontaktinformasjon</Heading>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', marginBottom: 'var(--ds-spacing-1)' }}>
                    <MailIcon style={{ fontSize: 'var(--ds-font-size-body-md)', color: 'var(--ds-color-neutral-text-subtle)' }} />
                    <span style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                      E-post
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                    <a href={`mailto:${user.email}`} style={{ color: 'var(--ds-color-accent-text-default)', flex: 1 }}>
                      {user.email}
                    </a>
                    <Button
                      variant="tertiary"
                      data-size="sm"
                      onClick={() => handleCopyToClipboard(user.email, 'email')}
                      aria-label="Kopier e-post" type="button"
                    >
                      {copiedField === 'email' ? <CheckCircleIcon /> : <CopyIcon />}
                    </Button>
                  </div>
                </div>

                {user.phone && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', marginBottom: 'var(--ds-spacing-1)' }}>
                      <PhoneIcon style={{ fontSize: 'var(--ds-font-size-body-md)', color: 'var(--ds-color-neutral-text-subtle)' }} />
                      <span style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                        Telefon
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                      <a href={`tel:${user.phone}`} style={{ color: 'var(--ds-color-accent-text-default)', flex: 1 }}>
                        {user.phone}
                      </a>
                      <Button
                        variant="tertiary"
                        data-size="sm"
                        onClick={() => handleCopyToClipboard(user.phone!, 'phone')}
                        aria-label="Kopier telefon" type="button"
                      >
                        {copiedField === 'phone' ? <CheckCircleIcon /> : <CopyIcon />}
                      </Button>
                    </div>
                  </div>
                )}
              </Stack>
            </Card>

            {/* Role and Status */}
            <Card>
              <Stack spacing={4}>
                <Heading level={3} data-size="sm">Rolle og tilgang</Heading>

                <div>
                  <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                    Rolle
                  </div>
                  <Badge color={roleColors[user.role]} data-size="lg">
                    <ShieldCheckIcon />
                    {roleLabels[user.role]}
                  </Badge>
                </div>

                <div>
                  <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                    Status
                  </div>
                  <Badge color={statusColors[user.status]} data-size="lg">
                    {user.status === 'active' ? (
                      <>
                        <CheckCircleIcon />
                        Aktiv
                      </>
                    ) : user.status === 'inactive' ? (
                      'Inaktiv'
                    ) : (
                      'Suspendert'
                    )}
                  </Badge>
                </div>

                <div>
                  <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                    Tilgangsnivå
                  </div>
                  <Paragraph data-size="sm">
                    Denne brukeren har {user.role === 'super_admin' ? 'full' : user.role === 'admin' ? 'administrativ' : 'begrenset'} tilgang til systemet.
                  </Paragraph>
                </div>
              </Stack>
            </Card>

            {/* Account Information */}
            <Card>
              <Stack spacing={4}>
                <Heading level={3} data-size="sm">Kontoinformasjon</Heading>

                {user.lastLoginAt && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', marginBottom: 'var(--ds-spacing-1)' }}>
                      <ClockIcon style={{ fontSize: 'var(--ds-font-size-body-md)', color: 'var(--ds-color-neutral-text-subtle)' }} />
                      <span style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                        Sist innlogget
                      </span>
                    </div>
                    <div style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
                      {new Date(user.lastLoginAt).toLocaleString('nb-NO', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                    Opprettet
                  </div>
                  <div style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
                    {new Date(user.createdAt).toLocaleDateString('nb-NO', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                    Bruker-ID
                  </div>
                  <div style={{ fontFamily: 'var(--ds-font-family-monospace)', fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {user.id}
                  </div>
                </div>
              </Stack>
            </Card>
          </div>
        </Tabs.Panel>

        {/* Activity Tab */}
        <Tabs.Panel value="activity">
          <Card>
            <div style={{ padding: 'var(--ds-spacing-6)', textAlign: 'center' }}>
              <ClockIcon style={{ fontSize: 'var(--ds-font-size-heading-lg)', color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-3)' }} />
              <Heading level={4} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                Ingen aktivitet ennå
              </Heading>
              <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                Brukerens handlinger og aktiviteter vil vises her når de utføres.
              </Paragraph>
            </div>
          </Card>
        </Tabs.Panel>

        {/* Security Tab */}
        <Tabs.Panel value="security">
          <Card>
            <Stack spacing={4}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--ds-spacing-3)', padding: 'var(--ds-spacing-4)', backgroundColor: 'var(--ds-color-success-background-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
                <ShieldCheckIcon style={{ fontSize: 'var(--ds-font-size-heading-md)', color: 'var(--ds-color-success-text-default)' }} />
                <div>
                  <Heading level={4} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-1)' }}>
                    Tilgangsnivå: {roleLabels[user.role]}
                  </Heading>
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    Denne brukeren har {user.role === 'super_admin' ? 'full' : user.role === 'admin' ? 'administrativ' : 'begrenset'} tilgang til systemet.
                  </Paragraph>
                </div>
              </div>

              <div>
                <Heading level={4} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
                  Tilgangshistorikk
                </Heading>
                <Card>
                  <div style={{ padding: 'var(--ds-spacing-4)', textAlign: 'center' }}>
                    <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                      Påloggingshistorikk og sikkerhetshendelser vil vises her.
                    </Paragraph>
                  </div>
                </Card>
              </div>

              <div>
                <Heading level={4} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
                  Sikkerhetsinnstillinger
                </Heading>
                <Card>
                  <div style={{ padding: 'var(--ds-spacing-4)', textAlign: 'center' }}>
                    <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                      Tofaktorautentisering, passordreset og andre sikkerhetsinnstillinger vil være tilgjengelig her.
                    </Paragraph>
                  </div>
                </Card>
              </div>
            </Stack>
          </Card>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
