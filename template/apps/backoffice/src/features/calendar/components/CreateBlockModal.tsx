/**
 * Create Block Modal
 * Modal for creating calendar blocks (maintenance, closed, holds, etc.)
 */

/* eslint-disable digdir/prefer-ds-components -- Complex form with native HTML elements for better browser compatibility */

import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  Button,
  Heading,
  Paragraph,
  Spinner,
  Checkbox,
  Alert,
} from '@xaheen/ds';
import {
  useListings,
  useCreateBlock,
  useCheckConflicts,
  type BlockType,
  type CreateBlockDTO,
  type Listing,
} from '@xaheen/sdk';
import {
  type BlockFormData,
  type RecurrenceFormData,
  BLOCK_TYPE_CONFIG,
  DEFAULT_BLOCK_FORM,
  DEFAULT_RECURRENCE_FORM,
  WEEKDAY_LABELS,
} from '../types';
import { useCalendarPermissions } from '../hooks/useCalendarPermissions';

interface CreateBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialListingId?: string | undefined;
  initialDate?: Date | undefined;
  initialStartTime?: Date | undefined;
  initialEndTime?: Date | undefined;
  onSuccess?: () => void;
}

export function CreateBlockModal({
  isOpen,
  onClose,
  initialListingId,
  initialDate,
  initialStartTime,
  initialEndTime,
  onSuccess,
}: CreateBlockModalProps) {
  const permissions = useCalendarPermissions();
  const createBlock = useCreateBlock();

  // Form state
  const [formData, setFormData] = useState<BlockFormData>(() => ({
    ...DEFAULT_BLOCK_FORM,
    listingId: initialListingId ?? '',
    startDate: initialDate ? initialDate.toISOString().split('T')[0] ?? '' : '',
    endDate: initialDate ? initialDate.toISOString().split('T')[0] ?? '' : '',
    startTime: initialStartTime ? initialStartTime.toTimeString().slice(0, 5) : '',
    endTime: initialEndTime ? initialEndTime.toTimeString().slice(0, 5) : '',
    allDay: !initialStartTime && !initialEndTime,
  }));

  const [showRecurrence, setShowRecurrence] = useState(false);
  const [recurrence, setRecurrence] = useState<RecurrenceFormData>(DEFAULT_RECURRENCE_FORM);

  // Fetch listings for dropdown
  const { data: listingsData, isLoading: isLoadingListings } = useListings({ status: 'published' });
  const listings = listingsData?.data ?? [];

  // Conflict check params
  const conflictParams = useMemo(() => {
    if (!formData.listingId || !formData.startDate || !formData.startTime || !formData.endTime) {
      return null;
    }
    return {
      listingId: formData.listingId,
      startTime: `${formData.startDate}T${formData.startTime}:00`,
      endTime: `${formData.endDate || formData.startDate}T${formData.endTime}:00`,
    };
  }, [formData.listingId, formData.startDate, formData.endDate, formData.startTime, formData.endTime]);

  // Check for conflicts
  const { data: conflictsData, isLoading: isCheckingConflicts } = useCheckConflicts(
    conflictParams ?? { listingId: '', startTime: '', endTime: '' },
    { enabled: !!conflictParams }
  );
  const conflicts = conflictsData?.data;

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        ...DEFAULT_BLOCK_FORM,
        listingId: initialListingId ?? '',
        startDate: initialDate ? initialDate.toISOString().split('T')[0] ?? '' : new Date().toISOString().split('T')[0] ?? '',
        endDate: initialDate ? initialDate.toISOString().split('T')[0] ?? '' : new Date().toISOString().split('T')[0] ?? '',
        startTime: initialStartTime ? initialStartTime.toTimeString().slice(0, 5) : '',
        endTime: initialEndTime ? initialEndTime.toTimeString().slice(0, 5) : '',
        allDay: !initialStartTime && !initialEndTime,
      });
      setShowRecurrence(false);
      setRecurrence(DEFAULT_RECURRENCE_FORM);
    }
  }, [isOpen, initialListingId, initialDate, initialStartTime, initialEndTime]);

  // Form handlers
  const updateField = <K extends keyof BlockFormData>(field: K, value: BlockFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleWeekday = (day: number) => {
    setRecurrence((prev) => ({
      ...prev,
      weekdays: prev.weekdays.includes(day)
        ? prev.weekdays.filter((d) => d !== day)
        : [...prev.weekdays, day].sort(),
    }));
  };

  // Validation
  const isValid = useMemo(() => {
    if (!formData.listingId || !formData.title || !formData.startDate) {
      return false;
    }
    if (!formData.allDay && (!formData.startTime || !formData.endTime)) {
      return false;
    }
    if (showRecurrence && (!recurrence.endDate || (recurrence.frequency === 'weekly' && recurrence.weekdays.length === 0))) {
      return false;
    }
    return true;
  }, [formData, showRecurrence, recurrence]);

  const hasConflicts = conflicts?.hasConflicts ?? false;
  const canSubmit = isValid && (!hasConflicts || permissions.canOverrideConflicts);

  // Submit handler
  const handleSubmit = async () => {
    if (!canSubmit) return;

    const startDateTime = formData.allDay
      ? `${formData.startDate}T00:00:00`
      : `${formData.startDate}T${formData.startTime}:00`;

    const endDateTime = formData.allDay
      ? `${formData.endDate || formData.startDate}T23:59:59`
      : `${formData.endDate || formData.startDate}T${formData.endTime}:00`;

    const blockData: CreateBlockDTO = {
      listingId: formData.listingId,
      title: formData.title,
      blockType: formData.blockType,
      startTime: startDateTime,
      endTime: endDateTime,
      allDay: formData.allDay,
      notifyAffectedUsers: formData.notifyAffectedUsers,
      ...(formData.notes ? { notes: formData.notes } : {}),
      ...(showRecurrence && recurrence.endDate
        ? {
            recurrence: {
              frequency: recurrence.frequency,
              interval: recurrence.interval,
              endDate: recurrence.endDate,
              ...(recurrence.frequency === 'weekly' && recurrence.weekdays.length > 0
                ? { weekdays: recurrence.weekdays }
                : {}),
            },
          }
        : {}),
    };

    try {
      await createBlock.mutateAsync(blockData);
      onSuccess?.();
      onClose();
    } catch {
      // Error handling is done by react-query
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <Dialog.Block>
        <Heading level={2} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          Opprett blokkering
        </Heading>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
          {/* Listing selector */}
          <div>
            <label
              htmlFor="listing-select"
              style={{
                display: 'block',
                fontSize: 'var(--ds-font-size-sm)',
                fontWeight: 'var(--ds-font-weight-medium)',
                marginBottom: 'var(--ds-spacing-1)',
              }}
            >
              Lokale *
            </label>
            <select
              id="listing-select"
              value={formData.listingId}
              onChange={(e) => updateField('listingId', e.target.value)}
              disabled={isLoadingListings}
              style={{
                width: '100%',
                padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                borderRadius: 'var(--ds-border-radius-md)',
                border: '1px solid var(--ds-color-neutral-border-default)',
                fontSize: 'var(--ds-font-size-sm)',
              }}
            >
              <option value="">Velg lokale...</option>
              {listings.map((listing: Listing) => (
                <option key={listing.id} value={listing.id}>
                  {listing.name}
                </option>
              ))}
            </select>
          </div>

          {/* Block type */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 'var(--ds-font-size-sm)',
                fontWeight: 'var(--ds-font-weight-medium)',
                marginBottom: 'var(--ds-spacing-2)',
              }}
            >
              Type blokkering *
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
              {(Object.keys(BLOCK_TYPE_CONFIG) as BlockType[]).map((type) => {
                const config = BLOCK_TYPE_CONFIG[type];
                if (!config) return null;
                return (
                  <label
                    key={type}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 'var(--ds-spacing-2)',
                      padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                      borderRadius: 'var(--ds-border-radius-md)',
                      border: `1px solid ${formData.blockType === type ? config.colorBorder : 'var(--ds-color-neutral-border-subtle)'}`,
                      backgroundColor: formData.blockType === type ? config.colorBg : 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="blockType"
                      value={type}
                      checked={formData.blockType === type}
                      onChange={(e) => updateField('blockType', e.target.value as BlockType)}
                      style={{ marginTop: '2px' }}
                    />
                    <div>
                      <div style={{ fontWeight: 'var(--ds-font-weight-medium)', fontSize: 'var(--ds-font-size-sm)' }}>
                        {config.label}
                      </div>
                      <div style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                        {config.description}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label
              htmlFor="block-title"
              style={{
                display: 'block',
                fontSize: 'var(--ds-font-size-sm)',
                fontWeight: 'var(--ds-font-weight-medium)',
                marginBottom: 'var(--ds-spacing-1)',
              }}
            >
              Tittel *
            </label>
            <input
              id="block-title"
              type="text"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="F.eks. Vedlikehold av varmeanlegg"
              style={{
                width: '100%',
                padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                borderRadius: 'var(--ds-border-radius-md)',
                border: '1px solid var(--ds-color-neutral-border-default)',
                fontSize: 'var(--ds-font-size-sm)',
              }}
            />
          </div>

          {/* Date and time */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ds-spacing-3)' }}>
            <div>
              <label
                htmlFor="start-date"
                style={{
                  display: 'block',
                  fontSize: 'var(--ds-font-size-sm)',
                  fontWeight: 'var(--ds-font-weight-medium)',
                  marginBottom: 'var(--ds-spacing-1)',
                }}
              >
                Fra dato *
              </label>
              <input
                id="start-date"
                type="date"
                value={formData.startDate}
                onChange={(e) => updateField('startDate', e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  border: '1px solid var(--ds-color-neutral-border-default)',
                  fontSize: 'var(--ds-font-size-sm)',
                }}
              />
            </div>
            <div>
              <label
                htmlFor="end-date"
                style={{
                  display: 'block',
                  fontSize: 'var(--ds-font-size-sm)',
                  fontWeight: 'var(--ds-font-weight-medium)',
                  marginBottom: 'var(--ds-spacing-1)',
                }}
              >
                Til dato
              </label>
              <input
                id="end-date"
                type="date"
                value={formData.endDate || formData.startDate}
                onChange={(e) => updateField('endDate', e.target.value)}
                min={formData.startDate}
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

          {/* All day toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
            <Checkbox
              checked={formData.allDay}
              onChange={(e) => updateField('allDay', e.target.checked)}
              aria-label="Hele dagen"
            />
            <span style={{ fontSize: 'var(--ds-font-size-sm)' }}>Hele dagen</span>
          </div>

          {/* Time range (if not all day) */}
          {!formData.allDay && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ds-spacing-3)' }}>
              <div>
                <label
                  htmlFor="start-time"
                  style={{
                    display: 'block',
                    fontSize: 'var(--ds-font-size-sm)',
                    fontWeight: 'var(--ds-font-weight-medium)',
                    marginBottom: 'var(--ds-spacing-1)',
                  }}
                >
                  Fra kl. *
                </label>
                <input
                  id="start-time"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => updateField('startTime', e.target.value)}
                  style={{
                    width: '100%',
                    padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                    borderRadius: 'var(--ds-border-radius-md)',
                    border: '1px solid var(--ds-color-neutral-border-default)',
                    fontSize: 'var(--ds-font-size-sm)',
                  }}
                />
              </div>
              <div>
                <label
                  htmlFor="end-time"
                  style={{
                    display: 'block',
                    fontSize: 'var(--ds-font-size-sm)',
                    fontWeight: 'var(--ds-font-weight-medium)',
                    marginBottom: 'var(--ds-spacing-1)',
                  }}
                >
                  Til kl. *
                </label>
                <input
                  id="end-time"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => updateField('endTime', e.target.value)}
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
          )}

          {/* Recurrence toggle */}
          {permissions.canCreateRecurringBlocks && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                <Checkbox
                  checked={showRecurrence}
                  onChange={(e) => setShowRecurrence(e.target.checked)}
                  aria-label="Gjenta blokkering"
                />
                <span style={{ fontSize: 'var(--ds-font-size-sm)' }}>Gjenta blokkering</span>
              </div>

              {showRecurrence && (
                <div
                  style={{
                    padding: 'var(--ds-spacing-3)',
                    backgroundColor: 'var(--ds-color-neutral-surface-default)',
                    borderRadius: 'var(--ds-border-radius-md)',
                    border: '1px solid var(--ds-color-neutral-border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', marginBottom: 'var(--ds-spacing-3)' }}>
                    <div style={{ flex: 1 }}>
                      <label
                        htmlFor="recurrence-frequency"
                        style={{
                          display: 'block',
                          fontSize: 'var(--ds-font-size-sm)',
                          fontWeight: 'var(--ds-font-weight-medium)',
                          marginBottom: 'var(--ds-spacing-1)',
                        }}
                      >
                        Frekvens
                      </label>
                      <select
                        id="recurrence-frequency"
                        value={recurrence.frequency}
                        onChange={(e) =>
                          setRecurrence((prev) => ({
                            ...prev,
                            frequency: e.target.value as RecurrenceFormData['frequency'],
                          }))
                        }
                        style={{
                          width: '100%',
                          padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                          borderRadius: 'var(--ds-border-radius-md)',
                          border: '1px solid var(--ds-color-neutral-border-default)',
                          fontSize: 'var(--ds-font-size-sm)',
                        }}
                      >
                        <option value="daily">Daglig</option>
                        <option value="weekly">Ukentlig</option>
                        <option value="monthly">Månedlig</option>
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label
                        htmlFor="recurrence-end"
                        style={{
                          display: 'block',
                          fontSize: 'var(--ds-font-size-sm)',
                          fontWeight: 'var(--ds-font-weight-medium)',
                          marginBottom: 'var(--ds-spacing-1)',
                        }}
                      >
                        Slutt dato *
                      </label>
                      <input
                        id="recurrence-end"
                        type="date"
                        value={recurrence.endDate}
                        onChange={(e) =>
                          setRecurrence((prev) => ({ ...prev, endDate: e.target.value }))
                        }
                        min={formData.startDate}
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

                  {recurrence.frequency === 'weekly' && (
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: 'var(--ds-font-size-sm)',
                          fontWeight: 'var(--ds-font-weight-medium)',
                          marginBottom: 'var(--ds-spacing-2)',
                        }}
                      >
                        Ukedager *
                      </label>
                      <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', flexWrap: 'wrap' }}>
                        {WEEKDAY_LABELS.map((label, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => toggleWeekday(index)}
                            style={{
                              padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                              borderRadius: 'var(--ds-border-radius-md)',
                              border: '1px solid var(--ds-color-neutral-border-default)',
                              backgroundColor: recurrence.weekdays.includes(index)
                                ? 'var(--ds-color-accent-surface-default)'
                                : 'transparent',
                              color: recurrence.weekdays.includes(index)
                                ? 'var(--ds-color-accent-text-default)'
                                : 'var(--ds-color-neutral-text-default)',
                              cursor: 'pointer',
                              fontSize: 'var(--ds-font-size-sm)',
                            }}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Notes */}
          <div>
            <label
              htmlFor="block-notes"
              style={{
                display: 'block',
                fontSize: 'var(--ds-font-size-sm)',
                fontWeight: 'var(--ds-font-weight-medium)',
                marginBottom: 'var(--ds-spacing-1)',
              }}
            >
              Notat
            </label>
            <textarea
              id="block-notes"
              value={formData.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="Valgfritt notat..."
              rows={3}
              style={{
                width: '100%',
                padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                borderRadius: 'var(--ds-border-radius-md)',
                border: '1px solid var(--ds-color-neutral-border-default)',
                fontSize: 'var(--ds-font-size-sm)',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Notify users */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
            <Checkbox
              checked={formData.notifyAffectedUsers}
              onChange={(e) => updateField('notifyAffectedUsers', e.target.checked)}
              aria-label="Varsle berørte brukere"
            />
            <span style={{ fontSize: 'var(--ds-font-size-sm)' }}>Varsle berørte brukere</span>
          </div>

          {/* Conflict warning */}
          {isCheckingConflicts && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
              <Spinner data-data-size="sm" aria-label="Sjekker konflikter..." />
              <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                Sjekker for konflikter...
              </Paragraph>
            </div>
          )}

          {conflicts?.hasConflicts && (
            <Alert data-color="warning">
              <Heading level={3} data-size="xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
                {conflicts.conflicts.length} konflikt{conflicts.conflicts.length > 1 ? 'er' : ''} funnet
              </Heading>
              <ul style={{ margin: 0, paddingLeft: 'var(--ds-spacing-4)' }}>
                {conflicts.conflicts.slice(0, 5).map((conflict: { title: string; startTime: string; endTime: string }, idx: number) => (
                  <li key={idx} style={{ fontSize: 'var(--ds-font-size-sm)' }}>
                    {conflict.title} ({new Date(conflict.startTime).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })} - {new Date(conflict.endTime).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })})
                  </li>
                ))}
                {conflicts.conflicts.length > 5 && (
                  <li style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                    +{conflicts.conflicts.length - 5} flere...
                  </li>
                )}
              </ul>
              {!permissions.canOverrideConflicts && (
                <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)' }}>
                  Du har ikke tilgang til å opprette blokkeringer som overlapper med eksisterende bookinger.
                </Paragraph>
              )}
            </Alert>
          )}
        </div>
      </Dialog.Block>

      <Dialog.Block>
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', justifyContent: 'flex-end' }}>
          <Button type="button" variant="secondary" onClick={onClose}>
            Avbryt
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            disabled={!canSubmit || createBlock.isPending}
          >
            {createBlock.isPending ? 'Oppretter...' : 'Opprett'}
          </Button>
        </div>
      </Dialog.Block>
    </Dialog>
  );
}
