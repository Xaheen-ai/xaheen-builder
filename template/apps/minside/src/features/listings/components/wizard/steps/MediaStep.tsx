/**
 * Media Step
 * Image upload and management
 */

import { useCallback, useState } from 'react';
import { Paragraph, Heading, Spinner } from '@xaheen/ds';
import { useUploadListingMedia, useDeleteListingMedia } from '@xaheen/sdk';
import type { BackofficeListing } from '../../../types';

export interface MediaStepProps {
  data: Partial<BackofficeListing>;
  onChange: (data: Partial<BackofficeListing>) => void;
  errors?: string[];
}

export function MediaStep({ data, onChange, errors = [] }: MediaStepProps) {
  const [isDragging, setIsDragging] = useState(false);
  const uploadMutation = useUploadListingMedia();
  const deleteMutation = useDeleteListingMedia();

  const images = data.images || [];
  const listingId = data.id;

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) return;

    // For new listings (no ID yet), store as local URLs
    if (!listingId) {
      const newUrls = await Promise.all(
        files.map(file => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
        })
      );
      onChange({ images: [...images, ...newUrls] });
    } else {
      // For existing listings, upload via API
      try {
        await uploadMutation.mutateAsync({ id: listingId, files });
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }
  }, [listingId, images, onChange, uploadMutation]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) return;

    if (!listingId) {
      const newUrls = await Promise.all(
        files.map(file => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
        })
      );
      onChange({ images: [...images, ...newUrls] });
    } else {
      try {
        await uploadMutation.mutateAsync({ id: listingId, files });
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }

    // Reset input
    e.target.value = '';
  }, [listingId, images, onChange, uploadMutation]);

  const handleRemoveImage = useCallback(async (index: number) => {
    const imageUrl = images[index];

    if (!listingId || imageUrl.startsWith('data:')) {
      // Local image - just remove from array
      const newImages = [...images];
      newImages.splice(index, 1);
      onChange({ images: newImages });
    } else {
      // Remote image - delete via API
      try {
        // Extract media ID from URL or use index as fallback
        const mediaId = imageUrl.split('/').pop() || index.toString();
        await deleteMutation.mutateAsync({ listingId, mediaId });
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  }, [listingId, images, onChange, deleteMutation]);

  const handleSetCover = useCallback((index: number) => {
    // Move image to first position
    const newImages = [...images];
    const [moved] = newImages.splice(index, 1);
    newImages.unshift(moved);
    onChange({ images: newImages });
  }, [images, onChange]);

  const isUploading = uploadMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      <div>
        <Heading level={2} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
          Bilder
        </Heading>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          Last opp bilder av utleieobjektet. Det første bildet blir hovedbilde.
        </Paragraph>
      </div>

      {errors.length > 0 && (
        <div
          style={{
            padding: 'var(--ds-spacing-3)',
            backgroundColor: 'var(--ds-color-danger-surface-default)',
            borderRadius: 'var(--ds-border-radius-md)',
            border: '1px solid var(--ds-color-danger-border-default)',
          }}
        >
          {errors.map((error, idx) => (
            <Paragraph key={idx} data-size="sm" style={{ color: 'var(--ds-color-danger-text-default)', margin: 0 }}>
              {error}
            </Paragraph>
          ))}
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${isDragging ? 'var(--ds-color-accent-border-default)' : 'var(--ds-color-neutral-border-default)'}`,
          borderRadius: 'var(--ds-border-radius-lg)',
          padding: 'var(--ds-spacing-8)',
          textAlign: 'center',
          backgroundColor: isDragging ? 'var(--ds-color-accent-surface-default)' : 'var(--ds-color-neutral-surface-default)',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
        }}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        {isUploading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
            <Spinner aria-label="Laster opp..." />
            <Paragraph data-size="sm">Laster opp bilder...</Paragraph>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 'var(--ds-spacing-3)' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--ds-color-neutral-text-subtle)" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <Paragraph data-size="md" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
              Dra og slipp bilder her
            </Paragraph>
            <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              eller klikk for å velge filer
            </Paragraph>
          </>
        )}
        {/* eslint-disable-next-line digdir/prefer-ds-components -- Hidden file input for drag-drop upload */}
        <input
          id="file-input"
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>

      {/* Image gallery */}
      {images.length > 0 && (
        <div>
          <Heading level={3} data-size="xs" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
            Opplastede bilder ({images.length})
          </Heading>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: 'var(--ds-spacing-3)',
            }}
          >
            {images.map((url, index) => (
              <div
                key={index}
                style={{
                  position: 'relative',
                  aspectRatio: '4/3',
                  borderRadius: 'var(--ds-border-radius-md)',
                  overflow: 'hidden',
                  border: index === 0 ? '3px solid var(--ds-color-accent-base-default)' : '1px solid var(--ds-color-neutral-border-subtle)',
                }}
              >
                <img
                  src={url}
                  alt={`Bilde ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                {index === 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'var(--ds-spacing-1)',
                      left: 'var(--ds-spacing-1)',
                      padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
                      fontSize: 'var(--ds-font-size-xs)',
                      fontWeight: 'var(--ds-font-weight-semibold)',
                      backgroundColor: 'var(--ds-color-accent-base-default)',
                      color: 'var(--ds-color-neutral-contrast-default)',
                      borderRadius: 'var(--ds-border-radius-sm)',
                    }}
                  >
                    Hovedbilde
                  </div>
                )}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: 'var(--ds-spacing-2)',
                    // eslint-disable-next-line digdir/no-hardcoded-colors
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                    display: 'flex',
                    gap: 'var(--ds-spacing-1)',
                    justifyContent: 'flex-end',
                  }}
                >
                  {index !== 0 && (
                    // eslint-disable-next-line digdir/prefer-ds-components -- Small overlay button with custom styling
                    <button
                      type="button"
                      onClick={() => handleSetCover(index)}
                      style={{
                        padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
                        fontSize: 'var(--ds-font-size-xs)',
                        backgroundColor: 'var(--ds-color-neutral-background-default)',
                        border: 'none',
                        borderRadius: 'var(--ds-border-radius-sm)',
                        cursor: 'pointer',
                      }}
                    >
                      Sett som hovedbilde
                    </button>
                  )}
                  {/* eslint-disable-next-line digdir/prefer-ds-components -- Small overlay button with custom styling */}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    disabled={isDeleting}
                    style={{
                      padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
                      fontSize: 'var(--ds-font-size-xs)',
                      backgroundColor: 'var(--ds-color-danger-base-default)',
                      color: 'var(--ds-color-neutral-contrast-default)',
                      border: 'none',
                      borderRadius: 'var(--ds-border-radius-sm)',
                      cursor: isDeleting ? 'not-allowed' : 'pointer',
                      opacity: isDeleting ? 0.6 : 1,
                    }}
                  >
                    Slett
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div
        style={{
          padding: 'var(--ds-spacing-4)',
          backgroundColor: 'var(--ds-color-info-surface-default)',
          borderRadius: 'var(--ds-border-radius-md)',
          border: '1px solid var(--ds-color-info-border-default)',
        }}
      >
        <Heading level={4} data-size="2xs" style={{ marginBottom: 'var(--ds-spacing-2)', color: 'var(--ds-color-info-text-default)' }}>
          Tips for gode bilder
        </Heading>
        {/* eslint-disable-next-line digdir/prefer-ds-components -- Simple tips list */}
        <ul style={{ margin: 0, paddingLeft: 'var(--ds-spacing-4)', color: 'var(--ds-color-info-text-default)' }}>
          <li><Paragraph data-size="sm" style={{ margin: 0 }}>Bruk god belysning og vis rommet fra flere vinkler</Paragraph></li>
          <li><Paragraph data-size="sm" style={{ margin: 0 }}>Inkluder bilder av fasiliteter og utstyr</Paragraph></li>
          <li><Paragraph data-size="sm" style={{ margin: 0 }}>Anbefalt oppløsning: minimum 1200x800 piksler</Paragraph></li>
        </ul>
      </div>
    </div>
  );
}
