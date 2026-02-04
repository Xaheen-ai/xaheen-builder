/**
 * Edit Booking Form Component
 * Allow modification of booking details for confirmed and pending bookings
 */

import { useState, useEffect } from 'react';
import {
  Stack,
  FormField,
  Textfield,
  Select,
  Alert,
} from '@xaheen/ds';
import {
  useListings,
  type Booking,
  type UpdateBookingDTO,
} from '@xaheen/sdk';
import { FormSection, FormActions, InfoBox } from '../shared';

interface EditBookingFormProps {
  booking: Booking;
  onSubmit: (data: UpdateBookingDTO) => Promise<void>;
  onCancel: () => void;
}

export function EditBookingForm({ booking, onSubmit, onCancel }: EditBookingFormProps) {
  const [formData, setFormData] = useState({
    listingId: booking.listingId,
    startTime: '',
    endTime: '',
    notes: booking.notes || '',
    totalPrice: booking.totalPrice || 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch listings for dropdown
  const { data: listingsData } = useListings({ limit: 100 });
  const listings = listingsData?.data ?? [];

  // Initialize form data from booking
  useEffect(() => {
    const start = new Date(booking.startTime);
    const end = new Date(booking.endTime);

    // Format for datetime-local input
    const formatForInput = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    setFormData({
      listingId: booking.listingId,
      startTime: formatForInput(start),
      endTime: formatForInput(end),
      notes: booking.notes || '',
      totalPrice: booking.totalPrice || 0,
    });
  }, [booking]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.listingId) {
      newErrors.listingId = 'Lokale er påkrevd';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Starttid er påkrevd';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'Sluttid er påkrevd';
    }

    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);

      if (start >= end) {
        newErrors.endTime = 'Sluttid må være etter starttid';
      }

      // Check if booking is in the past
      const now = new Date();
      if (end < now && booking.status !== 'completed') {
        newErrors.endTime = 'Kan ikke sette sluttid i fortiden';
      }
    }

    if (Number(formData.totalPrice) < 0) {
      newErrors.totalPrice = 'Pris kan ikke være negativ';
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
      const updateData: UpdateBookingDTO = {
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        notes: formData.notes?.trim() || undefined,
        totalPrice: formData.totalPrice,
      };

      await onSubmit(updateData);
    } catch (error) {
      console.error('Failed to update booking:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof typeof formData) => (value: any) => {
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

  // Calculate duration
  const calculateDuration = () => {
    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      const diffMs = end.getTime() - start.getTime();
      const hours = diffMs / (1000 * 60 * 60);
      if (hours < 1) return `${Math.round(hours * 60)} min`;
      return hours % 1 === 0 ? `${hours} t` : `${hours.toFixed(1)} t`;
    }
    return '–';
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={5}>
        {/* Warning Alert */}
        <Alert>
          Endringer i booking vil påvirke brukerens reservasjon. Sørg for at brukeren er informert om endringene.
        </Alert>

        {/* Booking Details */}
        <FormSection title="Bookingdetaljer">
          <Stack spacing={4}>
            <FormField
              label="Lokale"
              required
              
              description="Hvilket lokale skal bookes?"
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ds-spacing-3)' }}>
              <FormField
                label="Starttid"
                required
                
              >
                <Textfield
                  type="datetime-local"
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
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => handleChange('endTime')(e.target.value)}
                  aria-label="Sluttid"
                />
              </FormField>
            </div>

            {/* Duration indicator */}
            {formData.startTime && formData.endTime && !errors.startTime && !errors.endTime && (
              <InfoBox variant="info">
                Varighet: <strong>{calculateDuration()}</strong>
              </InfoBox>
            )}
          </Stack>
        </FormSection>

        {/* Pricing */}
        <FormSection title="Prissetting">
          <FormField
            label="Total pris"
            required
            error={errors.totalPrice || undefined}
            description="Pris i NOK (inkl. mva)"
          >
            <Textfield
              type="number"
              value={formData.totalPrice.toString()}
              onChange={(e) => handleChange('totalPrice')(parseFloat(e.target.value) || 0)}
              placeholder="0"
              aria-label="Total pris"
              min="0"
              step="0.01"
            />
          </FormField>
        </FormSection>

        {/* Notes */}
        <FormSection title="Notater">
          <FormField
            label="Interne notater"
            description="Notater synlige for saksbehandler"
          >
            <Textfield
              value={formData.notes}
              onChange={(e) => handleChange('notes')(e.target.value)}
              placeholder="Legg til eventuelle notater..."
              aria-label="Interne notater"
              multiline
              rows={4}
            />
          </FormField>
        </FormSection>

        {/* Actions */}
        <FormActions
          submitText="Lagre endringer"
          onCancel={onCancel}
          isSubmitting={isSubmitting}
        />
      </Stack>
    </form>
  );
}
