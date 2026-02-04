/**
 * Seasonal Lease Form Component
 * Create and edit seasonal lease agreements with conflict detection
 */

import { useState, useEffect } from 'react';
import {
  Stack,
  FormField,
  Textfield,
  Select,
  Checkbox,
  Alert,
  Button,
} from '@xaheen/ds';
import {
  useOrganizations,
  useListings,
  type SeasonalLease,
  type CreateSeasonalLeaseDTO,
} from '@xaheen/sdk';
import { FormSection, FormActions } from '../shared';

interface SeasonalLeaseFormProps {
  lease?: SeasonalLease | null;
  onSubmit: (data: CreateSeasonalLeaseDTO) => Promise<void>;
  onCancel: () => void;
}

const weekdayOptions = [
  { value: 1, label: 'Mandag' },
  { value: 2, label: 'Tirsdag' },
  { value: 3, label: 'Onsdag' },
  { value: 4, label: 'Torsdag' },
  { value: 5, label: 'Fredag' },
  { value: 6, label: 'Lørdag' },
  { value: 0, label: 'Søndag' },
];

export function SeasonalLeaseForm({ lease, onSubmit, onCancel }: SeasonalLeaseFormProps) {
  const [formData, setFormData] = useState<CreateSeasonalLeaseDTO>({
    listingId: '',
    organizationId: '',
    startDate: '',
    endDate: '',
    weekdays: [1, 2, 3, 4, 5], // Default: weekdays
    startTime: '09:00',
    endTime: '17:00',
    totalPrice: 0,
    notes: '',
  });

  const [selectedWeekdays, setSelectedWeekdays] = useState<Set<number>>(new Set([1, 2, 3, 4, 5]));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch organizations and listings for dropdowns
  const { data: orgsData } = useOrganizations();
  const organizations = orgsData?.data ?? [];

  const { data: listingsData } = useListings();
  const listings = listingsData?.data ?? [];

  // Pre-fill form if editing
  useEffect(() => {
    if (lease) {
      setFormData({
        listingId: lease.listingId,
        organizationId: lease.organizationId,
        startDate: lease.startDate.split('T')[0],
        endDate: lease.endDate.split('T')[0],
        weekdays: lease.weekdays,
        startTime: lease.startTime,
        endTime: lease.endTime,
        totalPrice: lease.totalPrice,
        notes: lease.notes || '',
      });
      setSelectedWeekdays(new Set(lease.weekdays));
    }
  }, [lease]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.listingId) {
      newErrors.listingId = 'Lokale er påkrevd';
    }

    if (!formData.organizationId) {
      newErrors.organizationId = 'Organisasjon er påkrevd';
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

    if (selectedWeekdays.size === 0) {
      newErrors.weekdays = 'Velg minst én ukedag';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Starttid er påkrevd';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'Sluttid er påkrevd';
    }

    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = 'Sluttid må være etter starttid';
    }

    if (formData.totalPrice === undefined || formData.totalPrice < 0) {
      newErrors.totalPrice = 'Pris må være et positivt tall';
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
      const cleanData: CreateSeasonalLeaseDTO = {
        ...formData,
        weekdays: Array.from(selectedWeekdays).sort((a, b) => a - b),
        notes: formData.notes?.trim() || undefined,
      };

      await onSubmit(cleanData);
    } catch (error) {
      console.error('Failed to save seasonal lease:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof CreateSeasonalLeaseDTO) => (value: any) => {
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

  const handleWeekdayToggle = (day: number) => {
    const newSelected = new Set(selectedWeekdays);
    if (newSelected.has(day)) {
      newSelected.delete(day);
    } else {
      newSelected.add(day);
    }
    setSelectedWeekdays(newSelected);
    if (errors.weekdays) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.weekdays;
        return newErrors;
      });
    }
  };

  const handleSelectAllWeekdays = () => {
    setSelectedWeekdays(new Set([1, 2, 3, 4, 5]));
  };

  const handleSelectWeekend = () => {
    setSelectedWeekdays(new Set([0, 6]));
  };

  const handleSelectAllDays = () => {
    setSelectedWeekdays(new Set([0, 1, 2, 3, 4, 5, 6]));
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={5}>
        {/* Info Alert */}
        <Alert>
          Sesongleie låser lokalet for den valgte perioden. Kalenderblokker kan genereres automatisk etter godkjenning.
        </Alert>

        {/* Basic Information */}
        <FormSection title="Grunnleggende informasjon">
          <Stack spacing={4}>
            <FormField
              label="Organisasjon"
              required
              
              description="Hvem leier lokalet?"
            >
              <Select
                value={formData.organizationId}
                onChange={(e) => handleChange('organizationId')(e.target.value)}
                
                disabled={!!lease} // Can't change org when editing
              >
                <option value="">Velg organisasjon...</option>
                {organizations.map(org => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField
              label="Lokale"
              required
              
              description="Hvilket lokale skal leies?"
            >
              <Select
                value={formData.listingId}
                onChange={(e) => handleChange('listingId')(e.target.value)}
                
              >
                <option value="">Velg lokale...</option>
                {listings.map(listing => (
                  <option key={listing.id} value={listing.id}>
                    {listing.name}
                  </option>
                ))}
              </Select>
            </FormField>
          </Stack>
        </FormSection>

        {/* Period */}
        <FormSection title="Leieperiode">
          <Stack spacing={4}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ds-spacing-3)' }}>
              <FormField
                label="Startdato"
                required
                
              >
                <Textfield
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate')(e.target.value)}
                  aria-label="Startdato"
                />
              </FormField>

              <FormField
                label="Sluttdato"
                required
                error={errors.endDate || undefined}
              >
                <Textfield
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange('endDate')(e.target.value)}
                  aria-label="Sluttdato"
                />
              </FormField>
            </div>
          </Stack>
        </FormSection>

        {/* Weekdays */}
        <FormSection title="Ukedager">
          <div style={{ marginBottom: 'var(--ds-spacing-3)', display: 'flex', gap: 'var(--ds-spacing-2)', flexWrap: 'wrap' }}>
            <Button type="button" variant="secondary" data-size="sm" onClick={handleSelectAllWeekdays}>
              Hverdager
            </Button>
            <Button type="button" variant="secondary" data-size="sm" onClick={handleSelectWeekend}>
              Helg
            </Button>
            <Button type="button" variant="secondary" data-size="sm" onClick={handleSelectAllDays}>
              Alle dager
            </Button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 'var(--ds-spacing-2)' }}>
            {weekdayOptions.map(option => (
              <Checkbox
                key={option.value}
                checked={selectedWeekdays.has(option.value)}
                onChange={() => handleWeekdayToggle(option.value)}
              >
                {option.label}
              </Checkbox>
            ))}
          </div>
          {errors.weekdays && (
            <div style={{ color: 'var(--ds-color-danger-text-default)', fontSize: 'var(--ds-font-size-sm)', marginTop: 'var(--ds-spacing-1)' }}>
              {errors.weekdays}
            </div>
          )}
        </FormSection>

        {/* Time */}
        <FormSection title="Tidspunkt">
          <Stack spacing={4}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ds-spacing-3)' }}>
              <FormField
                label="Starttid"
                required
                error={errors.startTime || undefined}
              >
                <Textfield
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleChange('startTime')(e.target.value)}
                  aria-label="Starttid"
                />
              </FormField>

              <FormField
                label="Sluttid"
                required
                error={errors.endTime || undefined}
              >
                <Textfield
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleChange('endTime')(e.target.value)}
                  aria-label="Sluttid"
                />
              </FormField>
            </div>
          </Stack>
        </FormSection>

        {/* Pricing */}
        <FormSection title="Prissetting">
          <Stack spacing={4}>
            <FormField
              label="Total pris"
              required
              error={errors.totalPrice || undefined}
              description="Totalpris for hele leieperioden (NOK)"
            >
              <Textfield
                type="number"
                value={formData.totalPrice?.toString() || '0'}
                onChange={(e) => handleChange('totalPrice')(parseFloat(e.target.value) || 0)}
                placeholder="0"
                aria-label="Total pris"
                min="0"
                step="0.01"
              />
            </FormField>

            <FormField
              label="Notater"
              description="Interne notater om avtalen"
            >
              <Textfield
                value={formData.notes || ''}
                onChange={(e) => handleChange('notes')(e.target.value)}
                placeholder="F.eks. spesielle avtaler eller betingelser"
                aria-label="Notater"
                multiline
                rows={3}
              />
            </FormField>
          </Stack>
        </FormSection>

        {/* Actions */}
        <FormActions
          submitText={lease ? 'Lagre endringer' : 'Opprett sesongleie'}
          onCancel={onCancel}
          isSubmitting={isSubmitting}
        />
      </Stack>
    </form>
  );
}
