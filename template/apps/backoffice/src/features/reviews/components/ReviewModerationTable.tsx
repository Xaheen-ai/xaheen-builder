/**
 * Review Moderation Table
 * Table display for review moderation with status badges and action buttons
 * Enables administrators to approve, reject, or delete reviews
 */

import { useState } from 'react';
import {
  Table,
  Paragraph,
  Spinner,
  Button,
  StarIcon,
  Checkbox,
  Dialog,
  Heading,
  Dropdown,
  MoreVerticalIcon,
} from '@xaheen/ds';
import type { Review, ReviewStatus } from '@xaheen/sdk';
import {
  useApproveReview,
  useRejectReview,
  useDeleteReview,
} from '@xaheen/sdk';
import { formatDistanceToNow } from 'date-fns';
import { nb } from 'date-fns/locale';

// =============================================================================
// Types
// =============================================================================

interface ReviewModerationTableProps {
  reviews: Review[];
  isLoading: boolean;
  selectedIds: string[];
  onSelectAll: (selected: boolean) => void;
  onSelectOne: (id: string, selected: boolean) => void;
  onRefresh?: () => void;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get status badge configuration for review status
 */
function getStatusBadgeConfig(status: ReviewStatus): {
  color: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  label: string;
} {
  const configs: Record<ReviewStatus, { color: 'success' | 'warning' | 'danger' | 'info' | 'neutral'; label: string }> = {
    pending: { color: 'warning', label: 'Venter' },
    approved: { color: 'success', label: 'Godkjent' },
    rejected: { color: 'danger', label: 'Avslått' },
  };
  return configs[status] || { color: 'neutral', label: status };
}

/**
 * Format relative time in Norwegian
 */
function formatRelativeTime(date: string): string {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: nb });
  } catch {
    return '-';
  }
}

/**
 * Truncate text with ellipsis
 */
function truncateText(text: string | undefined, maxLength: number): string {
  if (!text) return '-';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// =============================================================================
// StatusTag Component (inline for this component)
// =============================================================================

interface StatusTagProps {
  status: ReviewStatus;
}

function StatusTag({ status }: StatusTagProps) {
  const config = getStatusBadgeConfig(status);
  const colorStyles = {
    success: {
      bg: 'var(--ds-color-success-surface-default)',
      text: 'var(--ds-color-success-text-default)',
    },
    warning: {
      bg: 'var(--ds-color-warning-surface-default)',
      text: 'var(--ds-color-warning-text-default)',
    },
    danger: {
      bg: 'var(--ds-color-danger-surface-default)',
      text: 'var(--ds-color-danger-text-default)',
    },
    info: {
      bg: 'var(--ds-color-info-surface-default)',
      text: 'var(--ds-color-info-text-default)',
    },
    neutral: {
      bg: 'var(--ds-color-neutral-surface-hover)',
      text: 'var(--ds-color-neutral-text-subtle)',
    },
  };

  const colorStyle = colorStyles[config.color];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 'var(--ds-border-radius-full)',
        backgroundColor: colorStyle.bg,
        color: colorStyle.text,
        padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
        fontSize: 'var(--ds-font-size-xs)',
        fontWeight: 'var(--ds-font-weight-medium)',
        lineHeight: 'var(--ds-font-line-height-xs)',
        whiteSpace: 'nowrap',
      }}
    >
      {config.label}
    </span>
  );
}

// =============================================================================
// ReviewRowActions Component
// =============================================================================

interface ReviewRowActionsProps {
  review: Review;
  onActionComplete?: (() => void) | undefined;
}

function ReviewRowActions({ review, onActionComplete }: ReviewRowActionsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  const approveMutation = useApproveReview();
  const rejectMutation = useRejectReview();
  const deleteMutation = useDeleteReview();

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync({ id: review.id });
      onActionComplete?.();
    } catch (error) {
      console.error('Failed to approve review:', error);
    }
  };

  const handleReject = async () => {
    try {
      await rejectMutation.mutateAsync({ id: review.id });
      setRejectDialogOpen(false);
      onActionComplete?.();
    } catch (error) {
      console.error('Failed to reject review:', error);
      setRejectDialogOpen(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(review.id);
      setDeleteDialogOpen(false);
      onActionComplete?.();
    } catch (error) {
      console.error('Failed to delete review:', error);
      setDeleteDialogOpen(false);
    }
  };

  const isLoading =
    approveMutation.isPending ||
    rejectMutation.isPending ||
    deleteMutation.isPending;

  return (
    <>
      <Dropdown.TriggerContext>
        <Dropdown.Trigger aria-label="Handlinger" disabled={isLoading}>
          <MoreVerticalIcon />
        </Dropdown.Trigger>
        <Dropdown placement="bottom-end">
          <Dropdown.List>
            {/* Approve - Only for pending reviews */}
            {review.status === 'pending' && (
              <Dropdown.Item>
                <Dropdown.Button onClick={handleApprove}>Godkjenn</Dropdown.Button>
              </Dropdown.Item>
            )}

            {/* Reject - Only for pending or approved reviews */}
            {(review.status === 'pending' || review.status === 'approved') && (
              <Dropdown.Item>
                <Dropdown.Button onClick={() => setRejectDialogOpen(true)}>
                  Avslå
                </Dropdown.Button>
              </Dropdown.Item>
            )}

            {/* Delete - Always available */}
            <Dropdown.Item>
              <Dropdown.Button
                onClick={() => setDeleteDialogOpen(true)}
                style={{ color: 'var(--ds-color-danger-text-default)' }}
              >
                Slett
              </Dropdown.Button>
            </Dropdown.Item>
          </Dropdown.List>
        </Dropdown>
      </Dropdown.TriggerContext>

      {/* Reject Confirmation Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)}>
        <Dialog.Block>
          <Heading level={2} data-size="sm">
            Avslå anmeldelse
          </Heading>
          <Paragraph>
            Er du sikker på at du vil avslå denne anmeldelsen? Den vil ikke være
            synlig for brukere.
          </Paragraph>
        </Dialog.Block>
        <Dialog.Block>
          <div
            style={{
              display: 'flex',
              gap: 'var(--ds-spacing-3)',
              justifyContent: 'flex-end',
            }}
          >
            <Button
              type="button"
              variant="secondary"
              onClick={() => setRejectDialogOpen(false)}
              disabled={rejectMutation.isPending}
            >
              Avbryt
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleReject}
              loading={rejectMutation.isPending}
            >
              Avslå
            </Button>
          </div>
        </Dialog.Block>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <Dialog.Block>
          <Heading level={2} data-size="sm">
            Slett anmeldelse
          </Heading>
          <Paragraph>
            Er du sikker på at du vil slette denne anmeldelsen? Denne handlingen kan
            ikke angres.
          </Paragraph>
        </Dialog.Block>
        <Dialog.Block>
          <div
            style={{
              display: 'flex',
              gap: 'var(--ds-spacing-3)',
              justifyContent: 'flex-end',
            }}
          >
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Avbryt
            </Button>
            <Button
              type="button"
              variant="primary"
              data-color="danger"
              onClick={handleDelete}
              loading={deleteMutation.isPending}
            >
              Slett
            </Button>
          </div>
        </Dialog.Block>
      </Dialog>
    </>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function ReviewModerationTable({
  reviews,
  isLoading,
  selectedIds,
  onSelectAll,
  onSelectOne,
  onRefresh,
}: ReviewModerationTableProps) {
  const allSelected = reviews.length > 0 && selectedIds.length === reviews.length;

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 'var(--ds-spacing-10)',
        }}
      >
        <Spinner aria-label="Laster..." />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: 'var(--ds-spacing-10)',
          backgroundColor: 'var(--ds-color-neutral-surface-default)',
          borderRadius: 'var(--ds-border-radius-md)',
          border: '1px solid var(--ds-color-neutral-border-subtle)',
        }}
      >
        <Paragraph data-size="md" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          Ingen anmeldelser funnet
        </Paragraph>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          Prøv å endre filterkriteriene
        </Paragraph>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--ds-color-neutral-surface-default)',
        borderRadius: 'var(--ds-border-radius-md)',
        border: '1px solid var(--ds-color-neutral-border-subtle)',
        overflow: 'hidden',
      }}
    >
      <Table>
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell style={{ width: '48px' }}>
              <Checkbox
                aria-label="Velg alle"
                checked={allSelected}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSelectAll(e.target.checked)}
              />
            </Table.HeaderCell>
            <Table.HeaderCell>Vurdering</Table.HeaderCell>
            <Table.HeaderCell>Anmeldelse</Table.HeaderCell>
            <Table.HeaderCell>Objekt</Table.HeaderCell>
            <Table.HeaderCell>Bruker</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell>Opprettet</Table.HeaderCell>
            <Table.HeaderCell style={{ width: '60px' }} />
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {reviews.map((review) => (
            <Table.Row key={review.id}>
              <Table.Cell onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                <Checkbox
                  aria-label={`Velg anmeldelse fra ${review.userName || 'ukjent'}`}
                  checked={selectedIds.includes(review.id)}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSelectOne(review.id, e.target.checked)}
                />
              </Table.Cell>
              <Table.Cell>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-1)' }}>
                  {Array.from({ length: review.rating }, (_, i) => (
                    <StarIcon
                      key={i}
                      style={{
                        width: '16px',
                        height: '16px',
                        color: 'var(--ds-color-warning-text-default)',
                        fill: 'currentColor',
                      }}
                    />
                  ))}
                  <Paragraph
                    data-size="sm"
                    style={{
                      margin: 0,
                      marginLeft: 'var(--ds-spacing-1)',
                      color: 'var(--ds-color-neutral-text-default)',
                      fontWeight: 'var(--ds-font-weight-medium)',
                    }}
                  >
                    {review.rating}/5
                  </Paragraph>
                </div>
              </Table.Cell>
              <Table.Cell>
                <Paragraph
                  data-size="sm"
                  style={{
                    margin: 0,
                    color: 'var(--ds-color-neutral-text-default)',
                    maxWidth: '300px',
                  }}
                  title={review.comment}
                >
                  {truncateText(review.comment, 80)}
                </Paragraph>
              </Table.Cell>
              <Table.Cell>
                <Paragraph
                  data-size="sm"
                  style={{
                    margin: 0,
                    color: 'var(--ds-color-neutral-text-default)',
                  }}
                >
                  {review.listingName || '-'}
                </Paragraph>
              </Table.Cell>
              <Table.Cell>
                <div>
                  <Paragraph
                    data-size="sm"
                    style={{
                      fontWeight: 'var(--ds-font-weight-medium)',
                      margin: 0,
                      color: 'var(--ds-color-neutral-text-default)',
                    }}
                  >
                    {review.userName || 'Ukjent'}
                  </Paragraph>
                  {review.userEmail && (
                    <Paragraph
                      data-size="xs"
                      style={{
                        color: 'var(--ds-color-neutral-text-subtle)',
                        margin: 0,
                      }}
                    >
                      {review.userEmail}
                    </Paragraph>
                  )}
                </div>
              </Table.Cell>
              <Table.Cell>
                <StatusTag status={review.status} />
              </Table.Cell>
              <Table.Cell>
                <Paragraph
                  data-size="sm"
                  style={{
                    margin: 0,
                    color: 'var(--ds-color-neutral-text-subtle)',
                  }}
                >
                  {formatRelativeTime(review.createdAt)}
                </Paragraph>
              </Table.Cell>
              <Table.Cell onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                <ReviewRowActions review={review} onActionComplete={onRefresh} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}
