import { useState, useEffect } from 'react';
import { Card, Heading, Paragraph, Button, Spinner, Label, Select, Textfield, Textarea } from '@xaheen/ds';
import type { Season } from '@xaheen/sdk/types';
import { useAccountContext } from '../../../providers/AccountContextProvider';
import { WEEKDAY_LABELS } from '../constants';

/**
 * Season Application Drawer
 *
 * Drawer/modal for submitting a season booking application.
 * Includes venue selection, weekday, time range, and notes.
 */

// Icons
function XIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01" />
    </svg>
  );
}

interface SeasonApplicationDrawerProps {
  season: Season;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SeasonApplicationFormData) => Promise<void>;
}

export interface SeasonApplicationFormData {
  seasonId: string;
  listingId: string;
  weekday: number;
  startTime: string;
  endTime: string;
  notes?: string;
}

export function SeasonApplicationDrawer({
  season,
  isOpen,
  onClose,
  onSubmit,
}: SeasonApplicationDrawerProps) {
  const { accountType, selectedOrganization } = useAccountContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [listingId, setListingId] = useState('');
  const [weekday, setWeekday] = useState<number>(1); // Monday by default
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');

  // Reset form when drawer opens/closes
  useEffect(() => {
    if (!isOpen) {
      setListingId('');
      setWeekday(1);
      setStartTime('');
      setEndTime('');
      setNotes('');
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!listingId) {
      setError('Vennligst velg et lokale');
      return;
    }
    if (!startTime || !endTime) {
      setError('Vennligst velg start- og sluttid');
      return;
    }
    if (startTime >= endTime) {
      setError('Starttid må være før sluttid');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        seasonId: season.id,
        listingId,
        weekday,
        startTime,
        endTime,
        notes: notes || undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Noe gikk galt. Vennligst prøv igjen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'var(--ds-color-neutral-background-overlay)',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease-in-out',
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '600px',
          backgroundColor: 'var(--ds-color-neutral-background-default)',
          boxShadow: 'var(--ds-shadow-large)',
          zIndex: 1001,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.3s ease-out',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: 'var(--ds-spacing-6)',
            borderBottom: '1px solid var(--ds-color-neutral-border-default)',
            backgroundColor: 'var(--ds-color-neutral-background-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--ds-spacing-4)',
          }}
        >
          <div>
            <Heading level={2} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-1)' }}>
              Søk om sesongbooking
            </Heading>
            <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              {season.name}
            </Paragraph>
          </div>
          <Button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Lukk søknadsskjema"
            style={{
              all: 'unset',
              cursor: 'pointer',
              padding: 'var(--ds-spacing-2)',
              borderRadius: 'var(--ds-border-radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--ds-color-neutral-text-subtle)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--ds-color-neutral-surface-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <XIcon />
          </Button>
        </div>

        {/* Account Context Banner */}
        {accountType === 'organization' && selectedOrganization && (
          <div
            style={{
              padding: 'var(--ds-spacing-4)',
              backgroundColor: 'var(--ds-color-success-surface-default)',
              border: '1px solid var(--ds-color-success-border-default)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-3)',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--ds-border-radius-md)',
                backgroundColor: 'var(--ds-color-success-base-default)',
                color: 'var(--ds-color-neutral-contrast-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <BuildingIcon />
            </div>
            <div>
              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)' }}>
                Søker på vegne av: {selectedOrganization.name}
              </Paragraph>
              <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                Søknaden sendes inn som organisasjon
              </Paragraph>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, padding: 'var(--ds-spacing-6)', display: 'grid', gap: 'var(--ds-spacing-6)' }}>
            {/* Error message */}
            {error && (
              <Card
                style={{
                  padding: 'var(--ds-spacing-4)',
                  backgroundColor: 'var(--ds-color-danger-surface-default)',
                  border: '1px solid var(--ds-color-danger-border-default)',
                }}
              >
                <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-danger-text-default)' }}>
                  {error}
                </Paragraph>
              </Card>
            )}

            {/* Venue Selection */}
            <div>
              <Label
                htmlFor="listing"
                style={{
                  display: 'block',
                  marginBottom: 'var(--ds-spacing-2)',
                }}
              >
                Velg lokale *
              </Label>
              <Select
                id="listing"
                value={listingId}
                onChange={(e) => setListingId(e.target.value)}
                disabled={isSubmitting}
                required
                style={{
                  width: '100%',
                  padding: 'var(--ds-spacing-3)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  border: '1px solid var(--ds-color-neutral-border-default)',
                  fontSize: 'var(--ds-font-size-md)',
                  backgroundColor: 'var(--ds-color-neutral-background-default)',
                }}
              >
                <option value="">Velg et lokale</option>
                {/* TODO: Replace with actual listings from season */}
                <option value="listing-1">Idrettshall 1</option>
                <option value="listing-2">Idrettshall 2</option>
                <option value="listing-3">Møterom A</option>
                <option value="listing-4">Kinosalen</option>
              </Select>
              <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                Velg hvilket lokale du ønsker å booke
              </Paragraph>
            </div>

            {/* Weekday Selection */}
            <div>
              <Label
                htmlFor="weekday"
                style={{
                  display: 'block',
                  marginBottom: 'var(--ds-spacing-2)',
                }}
              >
                Ukedag *
              </Label>
              <Select
                id="weekday"
                value={weekday}
                onChange={(e) => setWeekday(Number(e.target.value))}
                disabled={isSubmitting}
                required
                style={{
                  width: '100%',
                  padding: 'var(--ds-spacing-3)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  border: '1px solid var(--ds-color-neutral-border-default)',
                  fontSize: 'var(--ds-font-size-md)',
                  backgroundColor: 'var(--ds-color-neutral-background-default)',
                }}
              >
                {WEEKDAY_LABELS.map((label, index) => (
                  <option key={index} value={index}>
                    {label}
                  </option>
                ))}
              </Select>
              <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                Hvilken ukedag ønsker du faste tider?
              </Paragraph>
            </div>

            {/* Time Range */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--ds-spacing-4)',
              }}
            >
              <div>
                <Label
                  htmlFor="startTime"
                  style={{
                    display: 'block',
                    marginBottom: 'var(--ds-spacing-2)',
                  }}
                >
                  Fra kl. *
                </Label>
                <Textfield
                  type="time"
                  id="startTime"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  disabled={isSubmitting}
                  required
                  style={{
                    width: '100%',
                    padding: 'var(--ds-spacing-3)',
                    borderRadius: 'var(--ds-border-radius-md)',
                    border: '1px solid var(--ds-color-neutral-border-default)',
                    fontSize: 'var(--ds-font-size-md)',
                    backgroundColor: 'var(--ds-color-neutral-background-default)',
                  }}
                />
              </div>

              <div>
                <Label
                  htmlFor="endTime"
                  style={{
                    display: 'block',
                    marginBottom: 'var(--ds-spacing-2)',
                  }}
                >
                  Til kl. *
                </Label>
                <Textfield
                  type="time"
                  id="endTime"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  disabled={isSubmitting}
                  required
                  style={{
                    width: '100%',
                    padding: 'var(--ds-spacing-3)',
                    borderRadius: 'var(--ds-border-radius-md)',
                    border: '1px solid var(--ds-color-neutral-border-default)',
                    fontSize: 'var(--ds-font-size-md)',
                    backgroundColor: 'var(--ds-color-neutral-background-default)',
                  }}
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label
                htmlFor="notes"
                style={{
                  display: 'block',
                  marginBottom: 'var(--ds-spacing-2)',
                }}
              >
                Merknad (valgfritt)
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isSubmitting}
                rows={4}
                placeholder="Legg til eventuelle merknader eller spesielle behov..."
                style={{
                  width: '100%',
                  padding: 'var(--ds-spacing-3)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  border: '1px solid var(--ds-color-neutral-border-default)',
                  fontSize: 'var(--ds-font-size-md)',
                  backgroundColor: 'var(--ds-color-neutral-background-default)',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
              <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                Del informasjon som kan være viktig for behandling av søknaden
              </Paragraph>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              padding: 'var(--ds-spacing-5) var(--ds-spacing-6)',
              borderTop: '1px solid var(--ds-color-neutral-border-default)',
              backgroundColor: 'var(--ds-color-neutral-background-subtle)',
              display: 'flex',
              gap: 'var(--ds-spacing-3)',
              justifyContent: 'flex-end',
            }}
          >
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Avbryt
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner aria-hidden="true" />
                  <span style={{ marginLeft: 'var(--ds-spacing-2)' }}>Sender...</span>
                </>
              ) : (
                'Send søknad'
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}
