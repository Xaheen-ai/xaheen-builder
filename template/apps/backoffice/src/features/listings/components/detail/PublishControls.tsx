/**
 * Publish Controls Component
 * Status badge and publishing action buttons with RBAC checks
 */

import { useState } from 'react';
import {
  Button,
  Dialog,
  Heading,
  Paragraph,
  ListingStatusBadge,
  Dropdown,
  MoreVerticalIcon,
} from '@xaheen/ds';
import { useNavigate } from 'react-router-dom';
import {
  usePublishListing,
  useArchiveListing,
  useDuplicateListing,
  useDeleteListing,
} from '@xaheen/sdk';
import { useListingPermissions } from '../../hooks/useListingPermissions';
import { useToast } from '../../../../providers/ToastProvider';
import type { ListingStatus } from '@xaheen/sdk';

interface PublishControlsProps {
  listingId: string;
  listingName: string;
  status: ListingStatus;
  onActionComplete?: (() => void) | undefined;
}

export function PublishControls({
  listingId,
  listingName,
  status,
  onActionComplete,
}: PublishControlsProps) {
  const navigate = useNavigate();
  const toast = useToast();
  const { canPublishListing, canArchiveListing, canDeleteListing, permissions } = useListingPermissions();
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const publishMutation = usePublishListing();
  const archiveMutation = useArchiveListing();
  const duplicateMutation = useDuplicateListing();
  const deleteMutation = useDeleteListing();

  const handlePublish = async () => {
    try {
      await publishMutation.mutateAsync(listingId);
      onActionComplete?.();
      toast.success('Publisert', `"${listingName}" er nå publisert!`);
    } catch (error) {
      console.error('Failed to publish listing:', error);
      toast.error('Kunne ikke publisere', error instanceof Error ? error.message : 'En uventet feil oppstod');
    }
  };

  const handleArchive = async () => {
    try {
      await archiveMutation.mutateAsync(listingId);
      setArchiveDialogOpen(false);
      onActionComplete?.();
      toast.success('Arkivert', `"${listingName}" er nå arkivert`);
    } catch (error) {
      console.error('Failed to archive listing:', error);
      setArchiveDialogOpen(false);
      toast.error('Kunne ikke arkivere', error instanceof Error ? error.message : 'En uventet feil oppstod');
    }
  };

  const handleDuplicate = async () => {
    try {
      const result = await duplicateMutation.mutateAsync(listingId);
      onActionComplete?.();
      toast.success('Duplisert', `"${listingName}" er duplisert!`);
      // Navigate to the new duplicate if we got a response
      if (result?.data?.slug) {
        navigate(`/listings/${result.data.slug}`);
      }
    } catch (error) {
      console.error('Failed to duplicate listing:', error);
      toast.error('Kunne ikke duplisere', error instanceof Error ? error.message : 'En uventet feil oppstod');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(listingId);
      setDeleteDialogOpen(false);
      onActionComplete?.();
      toast.success('Slettet', `"${listingName}" er slettet`);
      // Navigate back to listings after delete
      navigate('/listings');
    } catch (error) {
      console.error('Failed to delete listing:', error);
      setDeleteDialogOpen(false);
      toast.error('Kunne ikke slette', error instanceof Error ? error.message : 'En uventet feil oppstod');
    }
  };

  const isLoading =
    publishMutation.isPending ||
    archiveMutation.isPending ||
    duplicateMutation.isPending ||
    deleteMutation.isPending;

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--ds-spacing-3)',
        }}
      >
        {/* Status Badge */}
        <ListingStatusBadge status={status} />

        {/* Publish Button - Only for drafts, admin only */}
        {canPublishListing(status) && (
          <Button
            onClick={handlePublish}
            disabled={isLoading}
            size="sm"
            variant="primary" type="button"
          >
            Publiser
          </Button>
        )}

        {/* Archive Button - Only for published, admin only */}
        {canArchiveListing(status) && (
          <Button
            onClick={() => setArchiveDialogOpen(true)}
            disabled={isLoading}
            size="sm"
            variant="secondary" type="button"
          >
            Arkiver
          </Button>
        )}

        {/* More Actions Dropdown */}
        <Dropdown.TriggerContext>
          <Dropdown.Trigger
            aria-label="Flere handlinger"
            disabled={isLoading}
          >
            <MoreVerticalIcon />
          </Dropdown.Trigger>
          <Dropdown placement="bottom-end">
            <Dropdown.List>
              {/* Duplicate - Always available */}
              {permissions.canDuplicate && (
                <Dropdown.Item>
                  <Dropdown.Button onClick={handleDuplicate}>
                    Dupliser
                  </Dropdown.Button>
                </Dropdown.Item>
              )}

              {/* Delete - Admin only */}
              {canDeleteListing(status) && (
                <Dropdown.Item>
                  <Dropdown.Button
                    onClick={() => setDeleteDialogOpen(true)}
                    style={{ color: 'var(--ds-color-danger-text-default)' }}
                  >
                    Slett
                  </Dropdown.Button>
                </Dropdown.Item>
              )}
            </Dropdown.List>
          </Dropdown>
        </Dropdown.TriggerContext>
      </div>

      {/* Archive Confirmation Dialog */}
      <Dialog open={archiveDialogOpen} onClose={() => setArchiveDialogOpen(false)}>
        <Dialog.Block>
          <Heading level={2} data-size="sm">Arkiver objekt</Heading>
          <Paragraph>
            Er du sikker på at du vil arkivere &quot;{listingName}&quot;?
            Objektet vil ikke lenger være synlig for brukere.
          </Paragraph>
        </Dialog.Block>
        <Dialog.Actions>
          <Button
            variant="secondary"
            onClick={() => setArchiveDialogOpen(false)}
            disabled={isLoading} type="button"
          >
            Avbryt
          </Button>
          <Button
            variant="primary"
            onClick={handleArchive}
            disabled={isLoading} type="button"
          >
            Arkiver
          </Button>
        </Dialog.Actions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <Dialog.Block>
          <Heading level={2} data-size="sm">Slett objekt</Heading>
          <Paragraph>
            Er du sikker på at du vil slette &quot;{listingName}&quot;?
            Denne handlingen kan ikke angres.
          </Paragraph>
        </Dialog.Block>
        <Dialog.Actions>
          <Button
            variant="secondary"
            onClick={() => setDeleteDialogOpen(false)}
            disabled={isLoading} type="button"
          >
            Avbryt
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={isLoading} type="button"
          >
            Slett
          </Button>
        </Dialog.Actions>
      </Dialog>
    </>
  );
}
