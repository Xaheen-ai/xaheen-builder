/**
 * Organization Form Page
 * Full-page form for creating and editing organizations
 */

import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Spinner,
  ArrowLeftIcon,
} from '@xaheen/ds';
import {
  useOrganization,
  useCreateOrganization,
  useUpdateOrganization,
  type CreateOrganizationDTO,
} from '@xaheen/sdk';
import { OrganizationForm } from '../../components/organizations/OrganizationForm';

export function OrganizationFormPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  // Queries
  const { data: orgData, isLoading } = useOrganization(id!, {
    enabled: isEditing,
  });
  const organization = orgData?.data;

  // Mutations
  const createOrgMutation = useCreateOrganization();
  const updateOrgMutation = useUpdateOrganization();

  // Handlers
  const handleSubmit = async (data: CreateOrganizationDTO) => {
    if (isEditing && id) {
      await updateOrgMutation.mutateAsync({ id, data });
      navigate(`/organizations/${id}`);
    } else {
      const result = await createOrgMutation.mutateAsync(data);
      navigate(`/organizations/${result.data.id}`);
    }
  };

  const handleCancel = () => {
    if (isEditing && id) {
      navigate(`/organizations/${id}`);
    } else {
      navigate('/organizations');
    }
  };

  if (isEditing && isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
        <Spinner data-size="lg" aria-label="Laster..." />
      </div>
    );
  }

  if (isEditing && !organization) {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-5)', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div>
        <Link to={isEditing && id ? `/organizations/${id}` : '/organizations'}>
          <Button variant="tertiary" data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)' }} type="button">
            <ArrowLeftIcon />
            {isEditing ? 'Tilbake til organisasjon' : 'Tilbake til oversikt'}
          </Button>
        </Link>

        <Heading level={2} data-size="lg">
          {isEditing ? 'Rediger organisasjon' : 'Ny organisasjon'}
        </Heading>
        <Paragraph
          data-size="sm"
          style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-1)' }}
        >
          {isEditing
            ? 'Oppdater informasjon om organisasjonen'
            : 'Legg til en ny organisasjon i systemet'}
        </Paragraph>
      </div>

      {/* Form */}
      <Card>
        <OrganizationForm
          organization={organization ?? null}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </Card>
    </div>
  );
}
