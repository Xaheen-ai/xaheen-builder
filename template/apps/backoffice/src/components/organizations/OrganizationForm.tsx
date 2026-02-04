/**
 * Organization Form Component
 * Create and edit organization with validation
 */

import { useState, useEffect } from 'react';
import {
  Stack,
  FormField,
  Textfield,
  Select,
} from '@xaheen/ds';
import type {
  Organization,
  CreateOrganizationDTO,
  ActorType,
} from '@xaheen/sdk';
import { FormSection, FormActions } from '../shared';

interface OrganizationFormProps {
  organization?: Organization | null;
  onSubmit: (data: CreateOrganizationDTO) => Promise<void>;
  onCancel: () => void;
}

const actorTypeOptions = [
  { value: 'private', label: 'Privatperson' },
  { value: 'business', label: 'Bedrift' },
  { value: 'sports_club', label: 'Idrettslag' },
  { value: 'youth_organization', label: 'Ungdomsorganisasjon' },
  { value: 'school', label: 'Skole' },
  { value: 'municipality', label: 'Kommune' },
];

export function OrganizationForm({ organization, onSubmit, onCancel }: OrganizationFormProps) {
  const [formData, setFormData] = useState<CreateOrganizationDTO>({
    name: '',
    actorType: 'business',
    organizationNumber: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill form if editing
  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name,
        actorType: organization.actorType,
        organizationNumber: organization.organizationNumber || '',
        email: organization.email || '',
        phone: organization.phone || '',
        address: organization.address || '',
        city: organization.city || '',
        postalCode: organization.postalCode || '',
      });
    }
  }, [organization]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Navn er påkrevd';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ugyldig e-postadresse';
    }

    if (formData.organizationNumber && !/^\d{9}$/.test(formData.organizationNumber.replace(/\s/g, ''))) {
      newErrors.organizationNumber = 'Organisasjonsnummer må være 9 siffer';
    }

    if (formData.postalCode && !/^\d{4}$/.test(formData.postalCode)) {
      newErrors.postalCode = 'Postnummer må være 4 siffer';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Clean up empty strings
      const cleanData: CreateOrganizationDTO = {
        ...formData,
        organizationNumber: formData.organizationNumber?.trim() || undefined,
        email: formData.email?.trim() || undefined,
        phone: formData.phone?.trim() || undefined,
        address: formData.address?.trim() || undefined,
        city: formData.city?.trim() || undefined,
        postalCode: formData.postalCode?.trim() || undefined,
      };

      await onSubmit(cleanData);
    } catch (error) {
      console.error('Failed to save organization:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof CreateOrganizationDTO) => (value: string) => {
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

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={5}>
        {/* Basic Information */}
        <FormSection title="Grunnleggende informasjon">
          <Stack spacing={4}>
            <FormField
              label="Navn"
              required
              
              description="Organisasjonens fulle navn"
            >
              <Textfield
                value={formData.name}
                onChange={(e) => handleChange('name')(e.target.value)}
                placeholder="F.eks. Oslo Idrettslag"
                aria-label="Navn"
              />
            </FormField>

            <FormField
              label="Type organisasjon"
              required
              description="Organisasjonstype påvirker prisregler og rabatter"
            >
              <Select
                value={formData.actorType}
                onChange={(e) => handleChange('actorType')(e.target.value as ActorType)}
              >
                {actorTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField
              label="Organisasjonsnummer"
              error={errors.organizationNumber || undefined}
              description="9 siffer (valgfritt)"
            >
              <Textfield
                value={formData.organizationNumber || ''}
                onChange={(e) => handleChange('organizationNumber')(e.target.value)}
                placeholder="123456789"
                aria-label="Organisasjonsnummer"
                maxLength={9}
              />
            </FormField>
          </Stack>
        </FormSection>

        {/* Contact Information */}
        <FormSection title="Kontaktinformasjon">
          <Stack spacing={4}>
            <FormField
              label="E-post"
              error={errors.email || undefined}
              description="Primær e-postadresse"
            >
              <Textfield
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleChange('email')(e.target.value)}
                placeholder="kontakt@organisasjon.no"
                aria-label="E-post"
              />
            </FormField>

            <FormField
              label="Telefon"
              description="Kontakttelefon"
            >
              <Textfield
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone')(e.target.value)}
                placeholder="+47 12 34 56 78"
                aria-label="Telefon"
              />
            </FormField>
          </Stack>
        </FormSection>

        {/* Address */}
        <FormSection title="Adresse">
          <Stack spacing={4}>
            <FormField
              label="Gateadresse"
              description="F.eks. Storgata 1"
            >
              <Textfield
                value={formData.address || ''}
                onChange={(e) => handleChange('address')(e.target.value)}
                placeholder="Gateadresse"
                aria-label="Gateadresse"
              />
            </FormField>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--ds-spacing-3)' }}>
              <FormField
                label="Postnummer"
                error={errors.postalCode || undefined}
              >
                <Textfield
                  value={formData.postalCode || ''}
                  onChange={(e) => handleChange('postalCode')(e.target.value)}
                  placeholder="0001"
                  aria-label="Postnummer"
                  maxLength={4}
                />
              </FormField>

              <FormField label="Poststed">
                <Textfield
                  value={formData.city || ''}
                  onChange={(e) => handleChange('city')(e.target.value)}
                  placeholder="Oslo"
                  aria-label="Poststed"
                />
              </FormField>
            </div>
          </Stack>
        </FormSection>

        {/* Actions */}
        <FormActions
          submitText={organization ? 'Lagre endringer' : 'Opprett organisasjon'}
          onCancel={onCancel}
          isSubmitting={isSubmitting}
        />
      </Stack>
    </form>
  );
}
