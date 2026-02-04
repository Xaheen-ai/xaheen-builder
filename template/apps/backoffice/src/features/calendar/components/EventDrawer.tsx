/**
 * Event Drawer
 * Side drawer for viewing and managing calendar events
 */

import {
  Dialog,
  Button,
  Heading,
  Paragraph,
  Badge,
  Spinner,
} from '@xaheen/ds';
import {
  useConfirmBooking,
  useCancelBooking,
  useDeleteBlock,
  type CalendarEvent,
} from '@xaheen/sdk';
import { useCalendarPermissions } from '../hooks/useCalendarPermissions';
import { BLOCK_TYPE_CONFIG } from '../types';
import type { BlockType } from '@xaheen/sdk';

interface EventDrawerProps {
  isOpen: boolean;
  event: CalendarEvent | null;
  onClose: () => void;
  onEdit?: (event: CalendarEvent) => void;
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function getStatusBadge(status: string) {
  const normalizedStatus = status?.toLowerCase() || '';

  switch (normalizedStatus) {
    case 'confirmed':
      return { color: 'success', label: 'Bekreftet' };
    case 'pending':
      return { color: 'warning', label: 'Venter godkjenning' };
    case 'blocked':
    case 'maintenance':
      return { color: 'neutral', label: 'Sperret' };
    case 'cancelled':
      return { color: 'danger', label: 'Kansellert' };
    default:
      return { color: 'info', label: status };
  }
}

export function EventDrawer({ isOpen, event, onClose, onEdit }: EventDrawerProps) {
  const permissions = useCalendarPermissions();
  const confirmBooking = useConfirmBooking();
  const cancelBooking = useCancelBooking();
  const deleteBlock = useDeleteBlock();

  if (!event) return null;

  const startStr = event.start || event.startTime || '';
  const endStr = event.end || event.endTime || '';
  const statusBadge = getStatusBadge(event.status);
  const isBlock = event.status === 'blocked' || event.status === 'maintenance';
  const isPending = event.status?.toLowerCase() === 'pending';

  const handleApprove = async () => {
    if (!event.bookingId) return;
    await confirmBooking.mutateAsync(event.bookingId);
    onClose();
  };

  const handleReject = async () => {
    if (!event.bookingId) return;
    if (window.confirm('Er du sikker på at du vil avslå denne forespørselen?')) {
      await cancelBooking.mutateAsync({ id: event.bookingId });
      onClose();
    }
  };

  const handleDeleteBlock = async () => {
    if (window.confirm('Er du sikker på at du vil slette denne blokkeringen?')) {
      await deleteBlock.mutateAsync(event.id);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <Dialog.Block>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--ds-spacing-4)' }}>
          <Heading level={2} data-size="sm" style={{ margin: 0 }}>
            {event.title || event.userName || 'Booking'}
          </Heading>
          <Badge data-color={statusBadge.color as 'success' | 'warning' | 'danger' | 'info' | 'neutral'}>
            {statusBadge.label}
          </Badge>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
          {/* Listing */}
          {event.listingName && (
            <div>
              <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                Lokale
              </Paragraph>
              <Paragraph data-size="sm" style={{ margin: 0 }}>
                {event.listingName}
              </Paragraph>
            </div>
          )}

          {/* Date */}
          <div>
            <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
              Dato
            </Paragraph>
            <Paragraph data-size="sm" style={{ margin: 0 }}>
              {startStr ? formatDate(startStr) : '-'}
            </Paragraph>
          </div>

          {/* Time */}
          <div>
            <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
              Tid
            </Paragraph>
            <Paragraph data-size="sm" style={{ margin: 0 }}>
              {startStr && endStr ? `${formatTime(startStr)} - ${formatTime(endStr)}` : '-'}
            </Paragraph>
          </div>

          {/* User (for bookings) */}
          {event.userName && !isBlock && (
            <div>
              <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                Booket av
              </Paragraph>
              <Paragraph data-size="sm" style={{ margin: 0 }}>
                {event.userName}
              </Paragraph>
            </div>
          )}

          {/* Organization */}
          {event.organizationName && (
            <div>
              <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                Organisasjon
              </Paragraph>
              <Paragraph data-size="sm" style={{ margin: 0 }}>
                {event.organizationName}
              </Paragraph>
            </div>
          )}

          {/* Block type indicator */}
          {isBlock && (
            <div
              style={{
                padding: 'var(--ds-spacing-3)',
                borderRadius: 'var(--ds-border-radius-md)',
                backgroundColor: 'var(--ds-color-neutral-surface-default)',
                border: '1px solid var(--ds-color-neutral-border-subtle)',
              }}
            >
              <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-1)' }}>
                Type blokkering
              </Paragraph>
              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                {BLOCK_TYPE_CONFIG[event.status as BlockType]?.label || 'Blokkert'}
              </Paragraph>
            </div>
          )}
        </div>
      </Dialog.Block>

      <Dialog.Block>
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <Button type="button" variant="secondary" onClick={onClose}>
            Lukk
          </Button>

          {/* Pending request actions */}
          {isPending && event.bookingId && permissions.canApproveRequests && (
            <>
              <Button
                type="button"
                variant="secondary"
                onClick={handleReject}
                disabled={cancelBooking.isPending}
                data-color="danger"
              >
                {cancelBooking.isPending ? <Spinner data-data-size="sm" aria-label="Avslår..." /> : 'Avslå'}
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleApprove}
                disabled={confirmBooking.isPending}
              >
                {confirmBooking.isPending ? <Spinner data-data-size="sm" aria-label="Godkjenner..." /> : 'Godkjenn'}
              </Button>
            </>
          )}

          {/* Block actions */}
          {isBlock && permissions.canDeleteBlock && (
            <>
              {onEdit && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => onEdit(event)}
                >
                  Rediger
                </Button>
              )}
              <Button
                type="button"
                variant="secondary"
                onClick={handleDeleteBlock}
                disabled={deleteBlock.isPending}
                data-color="danger"
              >
                {deleteBlock.isPending ? <Spinner data-data-size="sm" aria-label="Sletter..." /> : 'Slett'}
              </Button>
            </>
          )}

          {/* View booking link */}
          {event.bookingId && !isPending && (
            <Button
              type="button"
              variant="primary"
              onClick={() => window.location.href = `/bookings/${event.bookingId}`}
            >
              Se booking
            </Button>
          )}
        </div>
      </Dialog.Block>
    </Dialog>
  );
}
