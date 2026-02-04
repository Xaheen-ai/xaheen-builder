/**
 * Edit Modal
 * Modal for editing listing details inline from the detail view
 * Follows patterns from wizard steps with SDK-first architecture
 */

import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  Button,
  Heading,
  Paragraph,
  Textfield,
  Textarea,
  Alert,
  Card,
  Select,
} from '@xaheen/ds';
import { useUpdateListing, type Listing } from '@xaheen/sdk';
import { useToast } from '../../../../providers/ToastProvider';

export interface EditModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** The listing to edit */
  listing: Listing;
  /** Callback on successful update */
  onSuccess?: () => void;
}

// Norwegian labels for listing types
const LISTING_TYPE_LABELS: Record<string, string> = {
  SPACE: 'Lokale',
  RESOURCE: 'Ressurs',
  SERVICE: 'Tjeneste',
  EVENT: 'Arrangement',
  VEHICLE: 'Kjøretøy',
  OTHER: 'Annet',
};

// Norwegian labels for visibility
const VISIBILITY_LABELS: Record<string, string> = {
  public: 'Offentlig',
  unlisted: 'Ulistet',
  private: 'Privat',
};

/**
 * EditModal Component
 *
 * @example
 * ```tsx
 * <EditModal
 *   isOpen={isEditOpen}
 *   onClose={() => setIsEditOpen(false)}
 *   listing={listing}
 *   onSuccess={() => refetch()}
 * />
 * ```
 */
export function EditModal({ isOpen, onClose, listing, onSuccess }: EditModalProps) {
  const updateMutation = useUpdateListing();
  const toast = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: listing.name || '',
    description: listing.description || '',
    fullDescription: listing.content?.fullDescription || '',
    capacity: listing.capacity || 0,
    visibility: listing.metadata?.visibility || 'public',
  });

  const [errors, setErrors] = useState<string[]>([]);

  // Reset form when listing changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: listing.name || '',
        description: listing.description || '',
        fullDescription: listing.content?.fullDescription || '',
        capacity: listing.capacity || 0,
        visibility: listing.metadata?.visibility || 'public',
      });
      setErrors([]);
    }
  }, [isOpen, listing]);

  // Form handlers
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, name: e.target.value }));
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, description: e.target.value }));
  };

  const handleFullDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, fullDescription: e.target.value }));
  };

  const handleCapacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setFormData((prev) => ({ ...prev, capacity: isNaN(value) ? 0 : value }));
  };

  const handleVisibilityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, visibility: e.target.value as 'public' | 'unlisted' | 'private' }));
  };

  // Validation
  const validate = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.name.trim()) {
      newErrors.push('Navn er påkrevd');
    }

    if (formData.name.length > 200) {
      newErrors.push('Navn kan ikke være lengre enn 200 tegn');
    }

    if (formData.capacity < 0) {
      newErrors.push('Kapasitet kan ikke være negativ');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // Check if form has changes
  const hasChanges = useMemo(() => {
    return (
      formData.name !== (listing.name || '') ||
      formData.description !== (listing.description || '') ||
      formData.fullDescription !== (listing.content?.fullDescription || '') ||
      formData.capacity !== (listing.capacity || 0) ||
      formData.visibility !== (listing.metadata?.visibility || 'public')
    );
  }, [formData, listing]);

  // Submit handler
  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    try {
      // Build update payload
      const updatePayload: Partial<Listing> = {
        name: formData.name,
        description: formData.description,
        capacity: formData.capacity,
        content: {
          ...listing.content,
          fullDescription: formData.fullDescription,
        },
        metadata: {
          ...listing.metadata,
          visibility: formData.visibility,
        },
      };

      // Perform the update with optimistic UI
      await updateMutation.mutateAsync({
        id: listing.id,
        data: updatePayload,
      });

      // Show success toast
      toast.success('Endringer lagret', `Endringene i "${formData.name}" er lagret`);

      // Trigger callback to refetch/update parent view (optimistic update)
      onSuccess?.();

      // Close modal
      onClose();
    } catch (error) {
      // Show error toast with RFC 7807 compliant error message
      const errorMessage = error instanceof Error ? error.message : 'En uventet feil oppstod';
      toast.error('Kunne ikke lagre endringer', errorMessage);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <Dialog.Block>
        <Heading level={2} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
          Rediger utleieobjekt
        </Heading>
        <Paragraph
          data-size="sm"
          style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0, marginBottom: 'var(--ds-spacing-4)' }}
        >
          Oppdater grunnleggende informasjon om {listing.name}
        </Paragraph>

        {/* Error display */}
        {errors.length > 0 && (
          <Alert data-color="danger" style={{ marginBottom: 'var(--ds-spacing-4)' }}>
            <Heading level={3} data-size="xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
              Vennligst korriger følgende feil:
            </Heading>
            <ul style={{ margin: 0, paddingLeft: 'var(--ds-spacing-4)' }}>
              {errors.map((error, idx) => (
                <li key={idx} style={{ fontSize: 'var(--ds-font-size-sm)' }}>
                  {error}
                </li>
              ))}
            </ul>
          </Alert>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
          {/* Basic Information Section */}
          <Card data-color="neutral">
            <div style={{ padding: 'var(--ds-spacing-4)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--ds-spacing-3)', marginBottom: 'var(--ds-spacing-4)' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--ds-border-radius-md)',
                    backgroundColor: 'var(--ds-color-accent-surface-default)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--ds-color-accent-base-default)',
                    flexShrink: 0,
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div>
                  <Heading level={3} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-1)' }}>
                    Grunnleggende informasjon
                  </Heading>
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                    Navn, type og kapasitet
                  </Paragraph>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
                {/* Listing Type - Read only */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 'var(--ds-font-size-sm)',
                      fontWeight: 'var(--ds-font-weight-medium)',
                      marginBottom: 'var(--ds-spacing-1)',
                    }}
                  >
                    Type
                  </label>
                  <div
                    style={{
                      padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                      backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
                      borderRadius: 'var(--ds-border-radius-md)',
                      border: '1px solid var(--ds-color-neutral-border-subtle)',
                      fontSize: 'var(--ds-font-size-sm)',
                      color: 'var(--ds-color-neutral-text-subtle)',
                    }}
                  >
                    {LISTING_TYPE_LABELS[listing.type] || listing.type}
                  </div>
                </div>

                {/* Name */}
                <Textfield
                  label="Navn *"
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="F.eks. Møterom 101"
                  data-size="small"
                />

                {/* Capacity */}
                <div>
                  <label
                    htmlFor="capacity-field"
                    style={{
                      display: 'block',
                      fontSize: 'var(--ds-font-size-sm)',
                      fontWeight: 'var(--ds-font-weight-medium)',
                      marginBottom: 'var(--ds-spacing-1)',
                    }}
                  >
                    Kapasitet
                  </label>
                  <input
                    id="capacity-field"
                    type="number"
                    value={formData.capacity}
                    onChange={handleCapacityChange}
                    min="0"
                    step="1"
                    style={{
                      width: '100%',
                      padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                      borderRadius: 'var(--ds-border-radius-md)',
                      border: '1px solid var(--ds-color-neutral-border-default)',
                      fontSize: 'var(--ds-font-size-sm)',
                    }}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Description Section */}
          <Card data-color="neutral">
            <div style={{ padding: 'var(--ds-spacing-4)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--ds-spacing-3)', marginBottom: 'var(--ds-spacing-4)' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--ds-border-radius-md)',
                    backgroundColor: 'var(--ds-color-info-surface-default)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--ds-color-info-base-default)',
                    flexShrink: 0,
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </div>
                <div>
                  <Heading level={3} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-1)' }}>
                    Beskrivelse
                  </Heading>
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                    Kort og fullstendig beskrivelse
                  </Paragraph>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
                {/* Short Description */}
                <div>
                  <label
                    htmlFor="description-field"
                    style={{
                      display: 'block',
                      fontSize: 'var(--ds-font-size-sm)',
                      fontWeight: 'var(--ds-font-weight-medium)',
                      marginBottom: 'var(--ds-spacing-1)',
                    }}
                  >
                    Kort beskrivelse
                  </label>
                  <Textarea
                    id="description-field"
                    value={formData.description}
                    onChange={handleDescriptionChange}
                    placeholder="Kort beskrivelse som vises i lister..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                      borderRadius: 'var(--ds-border-radius-md)',
                      border: '1px solid var(--ds-color-neutral-border-default)',
                      fontSize: 'var(--ds-font-size-sm)',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                    }}
                  />
                  {formData.description && (
                    <Paragraph data-size="xs" style={{ marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                      {formData.description.length} tegn
                    </Paragraph>
                  )}
                </div>

                {/* Full Description */}
                <div>
                  <label
                    htmlFor="full-description-field"
                    style={{
                      display: 'block',
                      fontSize: 'var(--ds-font-size-sm)',
                      fontWeight: 'var(--ds-font-weight-medium)',
                      marginBottom: 'var(--ds-spacing-1)',
                    }}
                  >
                    Fullstendig beskrivelse
                  </label>
                  <Textarea
                    id="full-description-field"
                    value={formData.fullDescription}
                    onChange={handleFullDescriptionChange}
                    placeholder="Beskriv utleieobjektet i detalj. Hva gjør det unikt? Hva inkluderes?"
                    rows={6}
                    style={{
                      width: '100%',
                      padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                      borderRadius: 'var(--ds-border-radius-md)',
                      border: '1px solid var(--ds-color-neutral-border-default)',
                      fontSize: 'var(--ds-font-size-sm)',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                    }}
                  />
                  {formData.fullDescription && (
                    <Paragraph data-size="xs" style={{ marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                      {formData.fullDescription.length} tegn
                    </Paragraph>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Metadata Section */}
          <Card data-color="neutral">
            <div style={{ padding: 'var(--ds-spacing-4)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--ds-spacing-3)', marginBottom: 'var(--ds-spacing-4)' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--ds-border-radius-md)',
                    backgroundColor: 'var(--ds-color-warning-surface-default)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--ds-color-warning-base-default)',
                    flexShrink: 0,
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.25M15.54 15.54l4.24 4.25M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" />
                  </svg>
                </div>
                <div>
                  <Heading level={3} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-1)' }}>
                    Metadata og innstillinger
                  </Heading>
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                    Synlighet og andre innstillinger
                  </Paragraph>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
                {/* Visibility */}
                <div>
                  <label
                    htmlFor="visibility-field"
                    style={{
                      display: 'block',
                      fontSize: 'var(--ds-font-size-sm)',
                      fontWeight: 'var(--ds-font-weight-medium)',
                      marginBottom: 'var(--ds-spacing-1)',
                    }}
                  >
                    Synlighet
                  </label>
                  <Select
                    id="visibility-field"
                    value={formData.visibility}
                    onChange={handleVisibilityChange}
                    aria-label="Synlighet"
                  >
                    {Object.entries(VISIBILITY_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                  <Paragraph data-size="xs" style={{ marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {formData.visibility === 'public' && 'Synlig for alle brukere'}
                    {formData.visibility === 'unlisted' && 'Kun tilgjengelig via direktelenke'}
                    {formData.visibility === 'private' && 'Kun synlig for autoriserte brukere'}
                  </Paragraph>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </Dialog.Block>

      <Dialog.Block>
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', justifyContent: 'flex-end' }}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={updateMutation.isPending}>
            Avbryt
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            disabled={!hasChanges || updateMutation.isPending}
          >
            {updateMutation.isPending ? 'Lagrer...' : 'Lagre endringer'}
          </Button>
        </div>
      </Dialog.Block>
    </Dialog>
  );
}
