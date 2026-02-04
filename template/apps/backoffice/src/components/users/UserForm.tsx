/**
 * User Form Component
 * Create and edit backoffice users with role assignment
 */

import { useState, useEffect } from 'react';
import {
  Stack,
  FormField,
  Textfield,
  Select,
  Alert,
} from '@xaheen/ds';
import type { User, CreateUserDTO, UserRole } from '@xaheen/sdk';
import { FormSection, FormActions, InfoBox } from '../shared';

interface UserFormProps {
  user?: User | null;
  onSubmit: (data: CreateUserDTO) => Promise<void>;
  onCancel: () => void;
}

const roleOptions = [
  { value: 'admin', label: 'Administrator', description: 'Full tilgang til alle funksjoner' },
  { value: 'saksbehandler', label: 'Saksbehandler', description: 'Behandle bookinger og forespørsler' },
];

export function UserForm({ user, onSubmit, onCancel }: UserFormProps) {
  const [formData, setFormData] = useState<CreateUserDTO>({
    name: '',
    email: '',
    phone: '',
    role: 'saksbehandler',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill form if editing
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
      });
    }
  }, [user]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Navn er påkrevd';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-post er påkrevd';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ugyldig e-postadresse';
    }

    if (!formData.role) {
      newErrors.role = 'Rolle er påkrevd';
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
      const cleanData: CreateUserDTO = {
        ...formData,
        phone: formData.phone?.trim() || undefined,
      };

      await onSubmit(cleanData);
    } catch (error) {
      console.error('Failed to save user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof CreateUserDTO) => (value: string) => {
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

  const selectedRoleOption = roleOptions.find(opt => opt.value === formData.role);

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={5}>
        {/* Info Alert */}
        {!user && (
          <Alert severity="info">
            Brukeren vil motta en e-postinvitasjon til den angitte e-postadressen for å opprette passord og få tilgang til backoffice.
          </Alert>
        )}

        {/* Basic Information */}
        <FormSection title="Brukerinformasjon">
          <Stack spacing={4}>
            <FormField
              label="Fullt navn"
              required
              
              description="Brukerens fulle navn"
            >
              <Textfield
                value={formData.name}
                onChange={(e) => handleChange('name')(e.target.value)}
                placeholder="F.eks. Ola Nordmann"
                
              />
            </FormField>

            <FormField
              label="E-post"
              required
              error={errors.email || undefined}
              description={user ? 'Brukerens e-postadresse' : 'Invitasjonen sendes til denne adressen'}
            >
              <Textfield
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email')(e.target.value)}
                placeholder="ola.nordmann@kommune.no"
                
                disabled={!!user} // Can't change email when editing
              />
            </FormField>

            <FormField
              label="Telefon"
              description="Valgfri kontaktinformasjon"
            >
              <Textfield
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone')(e.target.value)}
                placeholder="+47 12 34 56 78"
              />
            </FormField>
          </Stack>
        </FormSection>

        {/* Role Assignment */}
        <FormSection title="Tilgangsnivå">
          <Stack spacing={4}>
            <FormField
              label="Rolle"
              required
              error={errors.role || undefined}
              description="Velg brukerens rolle og tilgangsnivå"
            >
              <Select
                value={formData.role}
                onChange={(e) => handleChange('role')(e.target.value as UserRole)}
                error={!!errors.role}
              >
                {roleOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormField>

            {/* Role Description */}
            {selectedRoleOption && (
              <InfoBox variant="info">
                <strong>{selectedRoleOption.label}:</strong> {selectedRoleOption.description}
              </InfoBox>
            )}
          </Stack>
        </FormSection>

        {/* Role Permission Details */}
        <FormSection title={`Tilganger for ${selectedRoleOption?.label}`}>
          <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            {formData.role === 'admin' ? (
              <ul style={{ margin: 0, paddingLeft: 'var(--ds-spacing-5)' }}>
                <li>Full tilgang til alle funksjoner</li>
                <li>Behandle bookinger og forespørsler</li>
                <li>Administrere organisasjoner og medlemmer</li>
                <li>Administrere brukere og roller</li>
                <li>Konfigurere systeminnstillinger</li>
                <li>Se rapporter og statistikk</li>
                <li>Se revisjonslogger</li>
              </ul>
            ) : formData.role === 'saksbehandler' ? (
              <ul style={{ margin: 0, paddingLeft: 'var(--ds-spacing-5)' }}>
                <li>Behandle bookinger og forespørsler</li>
                <li>Administrere lokaler og ressurser</li>
                <li>Administrere sesongleie</li>
                <li>Behandle meldinger fra brukere</li>
                <li>Se kalender og rapporter</li>
                <li>Kan ikke administrere brukere eller innstillinger</li>
              </ul>
            ) : (
              <div style={{ fontSize: 'var(--ds-font-size-sm)' }}>Ingen tilganger</div>
            )}
          </div>
        </FormSection>

        {/* Actions */}
        <FormActions
          submitText={user ? 'Lagre endringer' : 'Send invitasjon'}
          onCancel={onCancel}
          isSubmitting={isSubmitting}
        />
      </Stack>
    </form>
  );
}
