/**
 * Season Form Page
 * Full-page form for creating and editing seasonal lease seasons
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Spinner,
  ArrowLeftIcon,
  Stack,
  FormField,
  Textfield,
  Alert,
} from '@xaheen/ds';
import {
  useSeason,
  useCreateSeason,
  useUpdateSeason,
  type CreateSeasonDTO,
} from '@xaheen/sdk';
import { FormSection, FormActions } from '../../components/shared';

export function SeasonFormPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  // Queries
  const { data: seasonData, isLoading } = useSeason(id!, {
    enabled: isEditing,
  });
  const season = seasonData?.data;

  // Mutations
  const createSeasonMutation = useCreateSeason();
  const updateSeasonMutation = useUpdateSeason();

  // Form state
  const [formData, setFormData] = useState<CreateSeasonDTO>({
    name: '',
    startDate: '',
    endDate: '',
    applicationDeadline: '',
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form from season data
  useEffect(() => {
    if (season) {
      setFormData({
        name: season.name,
        startDate: season.startDate.split('T')[0],
        endDate: season.endDate.split('T')[0],
        applicationDeadline: season.applicationDeadline.split('T')[0],
        description: season.description || '',
      });
    }
  }, [season]);

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Navn er påkrevd';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Startdato er påkrevd';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Sluttdato er påkrevd';
    }

    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      newErrors.endDate = 'Sluttdato må være etter startdato';
    }

    if (!formData.applicationDeadline) {
      newErrors.applicationDeadline = 'Søknadsfrist er påkrevd';
    }

    if (formData.applicationDeadline && formData.startDate && formData.applicationDeadline >= formData.startDate) {
      newErrors.applicationDeadline = 'Søknadsfrist må være før startdato';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanData: CreateSeasonDTO = {
        ...formData,
        description: formData.description?.trim() || undefined,
      };

      if (isEditing && id) {
        await updateSeasonMutation.mutateAsync({ id, data: cleanData });
        navigate(`/seasons/${id}`);
      } else {
        const result = await createSeasonMutation.mutateAsync(cleanData);
        navigate(`/seasons/${result.data.id}`);
      }
    } catch (error) {
      console.error('Failed to save season:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isEditing && id) {
      navigate(`/seasons/${id}`);
    } else {
      navigate('/seasons');
    }
  };

  const handleChange = (field: keyof CreateSeasonDTO) => (value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (isEditing && isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
        <Spinner data-size="lg" aria-label="Laster..." />
      </div>
    );
  }

  if (isEditing && !season) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-8)' }}>
        <Heading level={3} data-size="sm">Sesong ikke funnet</Heading>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)' }}>
          Sesongen eksisterer ikke eller er slettet.
        </Paragraph>
        <Link to="/seasons">
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
        <Link to={isEditing && id ? `/seasons/${id}` : '/seasons'}>
          <Button variant="tertiary" data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)' }} type="button">
            <ArrowLeftIcon />
            {isEditing ? 'Tilbake til sesong' : 'Tilbake til oversikt'}
          </Button>
        </Link>

        <Heading level={2} data-size="lg">
          {isEditing ? 'Rediger sesong' : 'Ny sesong'}
        </Heading>
        <Paragraph
          data-size="sm"
          style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-1)' }}
        >
          {isEditing
            ? 'Oppdater informasjon om sesongen'
            : 'Opprett en ny sesong for sesongleie'}
        </Paragraph>
      </div>

      {/* Info Alert */}
      {!isEditing && (
        <Alert>
          Sesongen opprettes som <strong>Utkast</strong>. Du må legge til lokaler før du kan åpne den for søknader.
        </Alert>
      )}

      {/* Form */}
      <Card>
        <form onSubmit={handleSubmit}>
          <Stack spacing={5}>
            {/* Basic Information */}
            <FormSection title="Grunnleggende informasjon">
              <Stack spacing={4}>
                <FormField
                  label="Navn"
                  required
                  error={errors.name || undefined}
                  description="F.eks. 'Vårsesong 2026' eller 'Høstsesong 2025'"
                >
                  <Textfield aria-label="Navn"
                    value={formData.name}
                    onChange={(e) => handleChange('name')(e.target.value)}
                    placeholder="Vårsesong 2026"
                    
                  />
                </FormField>

                <FormField
                  label="Beskrivelse"
                  description="Retningslinjer og informasjon til søkere (valgfritt)"
                >
                  <Textfield aria-label="Beskrivelse"
                    value={formData.description || ''}
                    onChange={(e) => handleChange('description')(e.target.value)}
                    placeholder="Legg til beskrivelse og retningslinjer..."
                    multiline
                    rows={4}
                  />
                </FormField>
              </Stack>
            </FormSection>

            {/* Period */}
            <FormSection title="Periode og frister">
              <Stack spacing={4}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ds-spacing-3)' }}>
                  <FormField
                    label="Startdato"
                    required
                    error={errors.startDate || undefined}
                    description="Når sesongen starter"
                  >
                    <Textfield aria-label="Startdato"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleChange('startDate')(e.target.value)}
                      
                    />
                  </FormField>

                  <FormField
                    label="Sluttdato"
                    required
                    error={errors.endDate || undefined}
                    description="Når sesongen slutter"
                  >
                    <Textfield aria-label="Sluttdato"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleChange('endDate')(e.target.value)}
                      
                      min={formData.startDate}
                    />
                  </FormField>
                </div>

                <FormField
                  label="Søknadsfrist"
                  required
                  error={errors.applicationDeadline || undefined}
                  description="Siste dag for å sende inn søknader"
                >
                  <Textfield aria-label="Søknadsfrist"
                    type="date"
                    value={formData.applicationDeadline}
                    onChange={(e) => handleChange('applicationDeadline')(e.target.value)}
                    
                    max={formData.startDate}
                  />
                </FormField>
              </Stack>
            </FormSection>

            {/* Actions */}
            <FormActions
              submitText={isEditing ? 'Lagre endringer' : 'Opprett sesong'}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
            />
          </Stack>
        </form>
      </Card>
    </div>
  );
}
