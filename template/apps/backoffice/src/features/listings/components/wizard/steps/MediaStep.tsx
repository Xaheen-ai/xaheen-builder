/**
 * Media Step
 * Image and document upload management
 */

/* eslint-disable digdir/prefer-ds-components, digdir/require-interactive-labels -- Media upload component */

import { useCallback, useState } from 'react';
import { Paragraph, Heading, Button, Card } from '@xaheen/ds';
import {
  useUploadListingMedia,
  useDeleteListingMedia,
  formatBytes,
  formatSpeed,
  formatETA,
  UploadProgressTracker,
} from '@xaheen/sdk';
import type { UploadProgressEvent } from '@xaheen/sdk';
import type { BackofficeListing, ListingDocument } from '../../../types';

export interface MediaStepProps {
  data: Partial<BackofficeListing>;
  onChange: (data: Partial<BackofficeListing>) => void;
  errors?: string[];
}

interface FileUploadProgress {
  filename: string;
  progress: UploadProgressEvent;
  status: 'compressing' | 'uploading' | 'complete' | 'error';
  error?: string;
}

export function MediaStep({ data, onChange, errors = [] }: MediaStepProps) {
  const [isDraggingImages, setIsDraggingImages] = useState(false);
  const [isDraggingDocs, setIsDraggingDocs] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Map<string, FileUploadProgress>>(new Map());
  const uploadMutation = useUploadListingMedia();
  const deleteMutation = useDeleteListingMedia();

  const images = data.images || [];
  const documents: ListingDocument[] = data.documents || [];
  const listingId = data.id;

  // Helper to update progress for a specific file
  const updateFileProgress = useCallback((fileId: string, update: Partial<FileUploadProgress>) => {
    setUploadProgress(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(fileId);
      if (existing) {
        newMap.set(fileId, { ...existing, ...update });
      } else {
        newMap.set(fileId, update as FileUploadProgress);
      }
      return newMap;
    });
  }, []);

  // Helper to remove file from progress tracking
  const removeFileProgress = useCallback((fileId: string) => {
    setUploadProgress(prev => {
      const newMap = new Map(prev);
      newMap.delete(fileId);
      return newMap;
    });
  }, []);

  // Simulate compression with progress tracking
  const compressFile = useCallback(async (file: File, fileId: string): Promise<string> => {
    const tracker = new UploadProgressTracker();

    // Start compression
    updateFileProgress(fileId, {
      filename: file.name,
      status: 'compressing',
      progress: {
        loaded: 0,
        total: file.size,
        percentage: 0,
      },
    });

    // Simulate compression progress
    return new Promise<string>((resolve) => {
      const reader = new FileReader();

      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = tracker.update(e.loaded, e.total);
          updateFileProgress(fileId, {
            status: 'compressing',
            progress,
          });
        }
      };

      reader.onloadend = () => {
        updateFileProgress(fileId, {
          status: 'complete',
          progress: {
            loaded: file.size,
            total: file.size,
            percentage: 100,
          },
        });
        resolve(reader.result as string);
      };

      reader.readAsDataURL(file);
    });
  }, [updateFileProgress]);

  // Image handling
  const handleImageDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingImages(true);
  }, []);

  const handleImageDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingImages(false);
  }, []);

  const handleImageDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingImages(false);

    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      if (!listingId) {
        // Process files with progress tracking
        const newUrls = await Promise.all(
          files.map(async (file) => {
            const fileId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
            try {
              const url = await compressFile(file, fileId);
              // Remove from progress after a short delay to show completion
              setTimeout(() => removeFileProgress(fileId), 1500);
              return url;
            } catch {
              updateFileProgress(fileId, {
                filename: file.name,
                status: 'error',
                error: 'Komprimering feilet',
                progress: { loaded: 0, total: file.size, percentage: 0 },
              });
              throw error;
            }
          })
        );
        onChange({ images: [...images, ...newUrls] });
      } else {
        // Track progress for each file
        const fileIds = files.map(file => {
          const fileId = `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`;
          updateFileProgress(fileId, {
            filename: file.name,
            status: 'compressing',
            progress: { loaded: 0, total: file.size, percentage: 0 },
          });
          return fileId;
        });

        // Upload with progress tracking
        await uploadMutation.mutateAsync({
          id: listingId,
          files,
          options: {
            onProgress: (progress) => {
              // Update first file's progress (SDK handles all files in batch)
              if (fileIds[0]) {
                updateFileProgress(fileIds[0], {
                  status: 'uploading',
                  progress,
                });
              }
            },
          },
        });

        // Mark all as complete
        fileIds.forEach(fileId => {
          updateFileProgress(fileId, {
            status: 'complete',
            progress: { loaded: 100, total: 100, percentage: 100 },
          });
        });

        // Clear progress after showing completion
        setTimeout(() => {
          fileIds.forEach(fileId => removeFileProgress(fileId));
        }, 1500);
      }
    } catch {
      // Error handling - already tracked in progress
    } finally {
      setIsUploading(false);
    }
  }, [listingId, images, onChange, uploadMutation, compressFile, updateFileProgress, removeFileProgress]);

  const handleImageSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      if (!listingId) {
        // Process files with progress tracking
        const newUrls = await Promise.all(
          files.map(async (file) => {
            const fileId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
            try {
              const url = await compressFile(file, fileId);
              // Remove from progress after a short delay to show completion
              setTimeout(() => removeFileProgress(fileId), 1500);
              return url;
            } catch {
              updateFileProgress(fileId, {
                filename: file.name,
                status: 'error',
                error: 'Komprimering feilet',
                progress: { loaded: 0, total: file.size, percentage: 0 },
              });
              throw error;
            }
          })
        );
        onChange({ images: [...images, ...newUrls] });
      } else {
        // Track progress for each file
        const fileIds = files.map(file => {
          const fileId = `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`;
          updateFileProgress(fileId, {
            filename: file.name,
            status: 'compressing',
            progress: { loaded: 0, total: file.size, percentage: 0 },
          });
          return fileId;
        });

        // Upload with progress tracking
        await uploadMutation.mutateAsync({
          id: listingId,
          files,
          options: {
            onProgress: (progress) => {
              // Update first file's progress (SDK handles all files in batch)
              if (fileIds[0]) {
                updateFileProgress(fileIds[0], {
                  status: 'uploading',
                  progress,
                });
              }
            },
          },
        });

        // Mark all as complete
        fileIds.forEach(fileId => {
          updateFileProgress(fileId, {
            status: 'complete',
            progress: { loaded: 100, total: 100, percentage: 100 },
          });
        });

        // Clear progress after showing completion
        setTimeout(() => {
          fileIds.forEach(fileId => removeFileProgress(fileId));
        }, 1500);
      }
    } catch {
      // Error handling - already tracked in progress
    } finally {
      setIsUploading(false);
    }
    e.target.value = '';
  }, [listingId, images, onChange, uploadMutation, compressFile, updateFileProgress, removeFileProgress]);

  const handleRemoveImage = useCallback(async (index: number) => {
    const imageUrl = images[index];
    if (!imageUrl) return;

    if (!listingId || imageUrl.startsWith('data:')) {
      const newImages = [...images];
      newImages.splice(index, 1);
      onChange({ images: newImages });
    } else {
      try {
        const parts = imageUrl.split('/');
        const mediaId = parts[parts.length - 1] || index.toString();
        await deleteMutation.mutateAsync({ listingId, mediaId });
      } catch {
        console.error('Delete failed:', error);
      }
    }
  }, [listingId, images, onChange, deleteMutation]);

  const handleSetCover = useCallback((index: number) => {
    const newImages = [...images];
    const [moved] = newImages.splice(index, 1);
    if (moved) {
      newImages.unshift(moved);
      onChange({ images: newImages });
    }
  }, [images, onChange]);

  // Document handling
  const handleDocDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingDocs(true);
  }, []);

  const handleDocDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingDocs(false);
  }, []);

  const handleDocDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingDocs(false);

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const files = Array.from(e.dataTransfer.files).filter(f => allowedTypes.includes(f.type) || f.name.endsWith('.pdf'));
    if (files.length === 0) return;

    const newDocs = await Promise.all(
      files.map(file => {
        return new Promise<ListingDocument>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              id: `doc-${Date.now()}-${Math.random().toString(36).slice(2)}`,
              name: file.name,
              url: reader.result as string,
              type: file.type,
              size: file.size,
            });
          };
          reader.readAsDataURL(file);
        });
      })
    );
    onChange({ documents: [...documents, ...newDocs] });
  }, [documents, onChange]);

  const handleDocSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newDocs = await Promise.all(
      files.map(file => {
        return new Promise<ListingDocument>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              id: `doc-${Date.now()}-${Math.random().toString(36).slice(2)}`,
              name: file.name,
              url: reader.result as string,
              type: file.type,
              size: file.size,
            });
          };
          reader.readAsDataURL(file);
        });
      })
    );
    onChange({ documents: [...documents, ...newDocs] });
    e.target.value = '';
  }, [documents, onChange]);

  const handleRemoveDoc = useCallback((docId: string) => {
    const newDocs = documents.filter(d => d.id !== docId);
    onChange({ documents: newDocs });
  }, [documents, onChange]);

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getDocIcon = (type: string) => {
    if (type.includes('pdf')) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--ds-color-danger-base-default)' }}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      );
    }
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--ds-color-accent-base-default)' }}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header */}
      <div>
        <Heading level={2} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
          Media
        </Heading>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
          Last opp bilder og dokumenter for utleieobjektet
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

      {/* IMAGES SECTION */}
      <Card
        style={{
          padding: 'var(--ds-spacing-5)',
          backgroundColor: 'var(--ds-color-neutral-background-default)',
          border: '1px solid var(--ds-color-neutral-border-subtle)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--ds-spacing-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--ds-color-accent-base-default)' }}>
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <div>
              <Heading level={3} data-size="xs" style={{ margin: 0 }}>
                Bilder
              </Heading>
              <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                Det første bildet blir hovedbilde
              </Paragraph>
            </div>
          </div>
          {images.length > 0 && (
            <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              {images.length} {images.length === 1 ? 'bilde' : 'bilder'}
            </Paragraph>
          )}
        </div>

        {/* Image Drop zone */}
        <div
          onDragOver={handleImageDragOver}
          onDragLeave={handleImageDragLeave}
          onDrop={handleImageDrop}
          onClick={() => !isUploading && document.getElementById('image-input')?.click()}
          style={{
            border: `2px dashed ${isDraggingImages ? 'var(--ds-color-accent-border-default)' : 'var(--ds-color-neutral-border-default)'}`,
            borderRadius: 'var(--ds-border-radius-lg)',
            padding: 'var(--ds-spacing-6)',
            textAlign: 'center',
            backgroundColor: isDraggingImages ? 'var(--ds-color-accent-surface-default)' : 'var(--ds-color-neutral-surface-default)',
            transition: 'all 0.2s ease',
            cursor: isUploading ? 'default' : 'pointer',
          }}
        >
          {!isUploading ? (
            <>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--ds-color-neutral-text-subtle)" strokeWidth="1.5" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                Dra og slipp bilder her
              </Paragraph>
              <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                eller klikk for å velge filer • JPG, PNG, WebP
              </Paragraph>
            </>
          ) : null}
          <input
            id="image-input"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
            style={{ display: 'none' }}
            disabled={isUploading}
          />
        </div>

        {/* Upload Progress Display */}
        {uploadProgress.size > 0 && (
          <div style={{ marginTop: 'var(--ds-spacing-4)', display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
            {Array.from(uploadProgress.values()).map((fileProgress) => (
              <div
                key={fileProgress.filename}
                style={{
                  padding: 'var(--ds-spacing-3)',
                  backgroundColor: 'var(--ds-color-neutral-surface-default)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  border: '1px solid var(--ds-color-neutral-border-subtle)',
                }}
              >
                {/* File name and status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--ds-spacing-2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                    {fileProgress.status === 'compressing' && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--ds-color-accent-base-default)', animation: 'spin 1s linear infinite' }}>
                        <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="8" />
                      </svg>
                    )}
                    {fileProgress.status === 'uploading' && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--ds-color-accent-base-default)' }}>
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    )}
                    {fileProgress.status === 'complete' && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--ds-color-success-base-default)' }}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    {fileProgress.status === 'error' && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--ds-color-danger-base-default)' }}>
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                      </svg>
                    )}
                    <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                      {fileProgress.filename}
                    </Paragraph>
                  </div>
                  <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {fileProgress.status === 'compressing' && 'Komprimerer...'}
                    {fileProgress.status === 'uploading' && 'Laster opp...'}
                    {fileProgress.status === 'complete' && 'Fullført'}
                    {fileProgress.status === 'error' && fileProgress.error}
                  </Paragraph>
                </div>

                {/* Progress bar */}
                <div style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                  <div
                    style={{
                      width: '100%',
                      height: '8px',
                      backgroundColor: 'var(--ds-color-neutral-background-subtle)',
                      borderRadius: 'var(--ds-border-radius-full)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${fileProgress.progress.percentage}%`,
                        height: '100%',
                        backgroundColor: fileProgress.status === 'error'
                          ? 'var(--ds-color-danger-base-default)'
                          : fileProgress.status === 'complete'
                          ? 'var(--ds-color-success-base-default)'
                          : 'var(--ds-color-accent-base-default)',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>

                {/* Progress details */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {formatBytes(fileProgress.progress.loaded)} av {formatBytes(fileProgress.progress.total)} ({fileProgress.progress.percentage}%)
                  </Paragraph>
                  {fileProgress.progress.speed !== undefined && fileProgress.progress.speed > 0 && (
                    <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                      {formatSpeed(fileProgress.progress.speed)}
                      {fileProgress.progress.estimatedTimeRemaining !== undefined && (
                        <> • {formatETA(fileProgress.progress.estimatedTimeRemaining)} gjenstår</>
                      )}
                    </Paragraph>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Image gallery */}
        {images.length > 0 && (
          <div
            style={{
              marginTop: 'var(--ds-spacing-4)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
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
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {index === 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'var(--ds-spacing-1)',
                      left: 'var(--ds-spacing-1)',
                      padding: '2px var(--ds-spacing-2)',
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
                    background: 'linear-gradient(transparent, var(--ds-color-neutral-background-default))',
                    display: 'flex',
                    gap: 'var(--ds-spacing-1)',
                    justifyContent: 'flex-end',
                  }}
                >
                  {index !== 0 && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleSetCover(index); }}
                      style={{
                        padding: '2px var(--ds-spacing-2)',
                        fontSize: 'var(--ds-font-size-body-xs)',
                        backgroundColor: 'var(--ds-color-neutral-background-default)',
                        border: 'none',
                        borderRadius: 'var(--ds-border-radius-sm)',
                        cursor: 'pointer',
                      }}
                    >
                      Hovedbilde
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleRemoveImage(index); }}
                    style={{
                      padding: '2px var(--ds-spacing-2)',
                      fontSize: 'var(--ds-font-size-body-xs)',
                      backgroundColor: 'var(--ds-color-danger-base-default)',
                      color: 'var(--ds-color-neutral-contrast-default)',
                      border: 'none',
                      borderRadius: 'var(--ds-border-radius-sm)',
                      cursor: 'pointer',
                    }}
                  >
                    Slett
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* DOCUMENTS SECTION */}
      <Card
        style={{
          padding: 'var(--ds-spacing-5)',
          backgroundColor: 'var(--ds-color-neutral-background-default)',
          border: '1px solid var(--ds-color-neutral-border-subtle)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--ds-spacing-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--ds-color-accent-base-default)' }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <div>
              <Heading level={3} data-size="xs" style={{ margin: 0 }}>
                Dokumenter
              </Heading>
              <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                Manualer, bruksanvisninger og retningslinjer
              </Paragraph>
            </div>
          </div>
          {documents.length > 0 && (
            <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              {documents.length} {documents.length === 1 ? 'dokument' : 'dokumenter'}
            </Paragraph>
          )}
        </div>

        {/* Document Drop zone */}
        <div
          onDragOver={handleDocDragOver}
          onDragLeave={handleDocDragLeave}
          onDrop={handleDocDrop}
          onClick={() => document.getElementById('doc-input')?.click()}
          style={{
            border: `2px dashed ${isDraggingDocs ? 'var(--ds-color-accent-border-default)' : 'var(--ds-color-neutral-border-default)'}`,
            borderRadius: 'var(--ds-border-radius-lg)',
            padding: 'var(--ds-spacing-6)',
            textAlign: 'center',
            backgroundColor: isDraggingDocs ? 'var(--ds-color-accent-surface-default)' : 'var(--ds-color-neutral-surface-default)',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
          }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--ds-color-neutral-text-subtle)" strokeWidth="1.5" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
          <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
            Dra og slipp dokumenter her
          </Paragraph>
          <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
            eller klikk for å velge filer • PDF, Word, Excel
          </Paragraph>
          <input
            id="doc-input"
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx"
            multiple
            onChange={handleDocSelect}
            style={{ display: 'none' }}
          />
        </div>

        {/* Document list */}
        {documents.length > 0 && (
          <div
            style={{
              marginTop: 'var(--ds-spacing-4)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--ds-spacing-2)',
            }}
          >
            {documents.map((doc) => (
              <div
                key={doc.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--ds-spacing-3)',
                  backgroundColor: 'var(--ds-color-neutral-surface-default)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  border: '1px solid var(--ds-color-neutral-border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
                  {getDocIcon(doc.type)}
                  <div>
                    <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                      {doc.name}
                    </Paragraph>
                    <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                      {formatFileSize(doc.size)}
                    </Paragraph>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
                  <Button
                    type="button"
                    variant="tertiary"
                    data-size="sm"
                    onClick={() => window.open(doc.url, '_blank')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </Button>
                  <Button
                    type="button"
                    variant="tertiary"
                    data-size="sm"
                    onClick={() => handleRemoveDoc(doc.id)}
                    style={{ color: 'var(--ds-color-danger-text-default)' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Tips */}
      <div
        style={{
          padding: 'var(--ds-spacing-4)',
          backgroundColor: 'var(--ds-color-info-surface-default)',
          borderRadius: 'var(--ds-border-radius-md)',
          border: '1px solid var(--ds-color-info-border-default)',
          display: 'flex',
          gap: 'var(--ds-spacing-3)',
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ color: 'var(--ds-color-info-text-default)', flexShrink: 0, marginTop: '2px' }}
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <div>
          <Heading level={4} data-size="2xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)', color: 'var(--ds-color-info-text-default)' }}>
            Tips for gode bilder
          </Heading>
          <ul style={{ margin: 0, paddingLeft: 'var(--ds-spacing-4)', color: 'var(--ds-color-info-text-default)' }}>
            <li><Paragraph data-size="xs" style={{ margin: 0 }}>Bruk god belysning og vis rommet fra flere vinkler</Paragraph></li>
            <li><Paragraph data-size="xs" style={{ margin: 0 }}>Inkluder bilder av fasiliteter og utstyr</Paragraph></li>
            <li><Paragraph data-size="xs" style={{ margin: 0 }}>Anbefalt oppløsning: minimum 1200x800 piksler</Paragraph></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
