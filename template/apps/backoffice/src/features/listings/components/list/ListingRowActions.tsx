/**
 * Listing Row Actions
 * RBAC-aware dropdown menu for listing actions
 */

import { useState } from 'react';
import {
  Dropdown,
  Dialog,
  Button,
  Heading,
  Paragraph,
  MoreVerticalIcon,
} from '@xaheen/ds';
import { useNavigate } from 'react-router-dom';
import {
  usePublishListing,
  useArchiveListing,
  useDeleteListing,
  useDuplicateListing,
} from '@xaheen/sdk';
import { useListingPermissions } from '../../hooks/useListingPermissions';
import { useToast } from '../../../../providers/ToastProvider';
import type { ListingStatus } from '@xaheen/sdk';

interface ListingRowActionsProps {
  listingId: string;
  listingSlug: string;
  listingName: string;
  status: ListingStatus;
  onActionComplete?: (() => void) | undefined;
}

export function ListingRowActions({
  listingId,
  listingSlug,
  listingName,
  status,
  onActionComplete,
}: ListingRowActionsProps) {
  const navigate = useNavigate();
  const toast = useToast();
  const { canEditListing, canPublishListing, canArchiveListing, canDeleteListing, permissions } =
    useListingPermissions();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);

  const publishMutation = usePublishListing();
  const archiveMutation = useArchiveListing();
  const deleteMutation = useDeleteListing();
  const duplicateMutation = useDuplicateListing();

  const handleView = () => {
    // Use slug if available, fallback to ID
    const identifier = listingSlug || listingId;
    navigate(`/listings/${identifier}/view`);
  };

  const handleEdit = () => {
    // Use slug if available, fallback to ID
    const identifier = listingSlug || listingId;
    navigate(`/listings/${identifier}`);
  };

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

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(listingId);
      setDeleteDialogOpen(false);
      onActionComplete?.();
      toast.success('Slettet', `"${listingName}" er slettet`);
    } catch (error) {
      console.error('Failed to delete listing:', error);
      setDeleteDialogOpen(false);
      toast.error('Kunne ikke slette', error instanceof Error ? error.message : 'En uventet feil oppstod');
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

  const isLoading =
    publishMutation.isPending ||
    archiveMutation.isPending ||
    deleteMutation.isPending ||
    duplicateMutation.isPending;

  return (
    <>
      <Dropdown.TriggerContext>
        <Dropdown.Trigger
          aria-label="Handlinger"
          disabled={isLoading}
        >
          <MoreVerticalIcon />
        </Dropdown.Trigger>
        <Dropdown placement="bottom-end">
          <Dropdown.List>
            {/* View - Always available */}
            {permissions.canView && (
              <Dropdown.Item>
                <Dropdown.Button onClick={handleView}>
                  Vis detaljer
                </Dropdown.Button>
              </Dropdown.Item>
            )}

            {/* Edit - Based on status */}
            {canEditListing(status) && (
              <Dropdown.Item>
                <Dropdown.Button onClick={handleEdit}>
                  Rediger
                </Dropdown.Button>
              </Dropdown.Item>
            )}

            {/* Duplicate - Always available */}
            {permissions.canDuplicate && (
              <Dropdown.Item>
                <Dropdown.Button onClick={handleDuplicate}>
                  Dupliser
                </Dropdown.Button>
              </Dropdown.Item>
            )}

            {/* Publish - Only for drafts, admin only */}
            {canPublishListing(status) && (
              <Dropdown.Item>
                <Dropdown.Button onClick={handlePublish}>
                  Publiser
                </Dropdown.Button>
              </Dropdown.Item>
            )}

            {/* Archive - Only for published, admin only */}
            {canArchiveListing(status) && (
              <Dropdown.Item>
                <Dropdown.Button onClick={() => setArchiveDialogOpen(true)}>
                  Arkiver
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

      {/* Archive Confirmation Dialog */}
      <Dialog open={archiveDialogOpen} onClose={() => setArchiveDialogOpen(false)}>
        <Dialog.Block>
          <Heading level={2} data-size="sm">Arkiver objekt</Heading>
          <Paragraph>
            Er du sikker på at du vil arkivere &quot;{listingName}&quot;?
            Objektet vil ikke lenger være synlig for brukere.
          </Paragraph>
        </Dialog.Block>
        <Dialog.Block>
          <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', justifyContent: 'flex-end' }}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setArchiveDialogOpen(false)}
              disabled={archiveMutation.isPending}
            >
              Avbryt
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleArchive}
              loading={archiveMutation.isPending}
            >
              Arkiver
            </Button>
          </div>
        </Dialog.Block>
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
        <Dialog.Block>
          <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', justifyContent: 'flex-end' }}>
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
