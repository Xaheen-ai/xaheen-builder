/**
 * ImageGallery
 *
 * Hero image with vertical thumbnail sidebar for listing detail pages.
 * Displays main image on left (~70%) with vertical thumbnails on right (~30%).
 * Supports image navigation and counter display.
 */
import * as React from 'react';
import { Paragraph } from '@digdir/designsystemet-react';
import { cn } from '../utils';
import type { GalleryImage } from '../types/listing-detail';

export interface ImageGalleryProps {
  /** Array of images to display */
  images: GalleryImage[];
  /** Initial image index to display */
  initialIndex?: number;
  /** Show image counter badge (e.g., "1 / 3") */
  showCounter?: boolean;
  /** Callback when hero image is clicked */
  onImageClick?: (index: number) => void;
  /** Height of the gallery */
  height?: number | string;
  /** Maximum number of thumbnails to show */
  maxThumbnails?: number;
  /** Custom class name */
  className?: string;
}

/**
 * ImageGallery component for listing detail pages
 *
 * @example
 * ```tsx
 * <ImageGallery
 *   images={[
 *     { id: '1', src: '/img1.jpg', alt: 'Image 1' },
 *     { id: '2', src: '/img2.jpg', alt: 'Image 2' },
 *   ]}
 *   showCounter
 * />
 * ```
 */
export function ImageGallery({
  images,
  initialIndex = 0,
  showCounter = true,
  onImageClick,
  height = 500,
  maxThumbnails = 3,
  className,
}: ImageGalleryProps): React.ReactElement {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  };

  const handleHeroClick = () => {
    onImageClick?.(currentIndex);
  };

  const currentImage = images[currentIndex];
  const displayedThumbnails = images.slice(0, maxThumbnails);
  const galleryHeight = typeof height === 'number' ? `${height}px` : height;

  if (!images.length) {
    return (
      <div
        className={cn('image-gallery', className)}
        style={{
          height: galleryHeight,
          backgroundColor: 'var(--ds-color-neutral-surface-hover)',
          borderRadius: 'var(--ds-border-radius-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          Ingen bilder tilgjengelig
        </Paragraph>
      </div>
    );
  }

  // Calculate thumbnail height based on number of thumbnails and gaps
  const thumbnailCount = Math.min(displayedThumbnails.length, maxThumbnails);
  const gapSize = 12; // var(--ds-spacing-3) = 12px
  const totalGaps = (thumbnailCount - 1) * gapSize;

  return (
    <div
      className={cn('image-gallery', className)}
      style={{
        display: 'grid',
        gridTemplateColumns: images.length > 1 ? '1fr 240px' : '1fr',
        gap: 'var(--ds-spacing-3)',
        height: galleryHeight,
      }}
    >
      {/* Main/Hero Image */}
      <div
        className="image-gallery-hero"
        style={{
          position: 'relative',
          height: '100%',
          borderRadius: 'var(--ds-border-radius-lg)',
          overflow: 'hidden',
          cursor: onImageClick ? 'pointer' : 'default',
        }}
        onClick={handleHeroClick}
      >
        <img
          src={currentImage?.src}
          alt={currentImage?.alt || ''}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        {/* Image counter badge - positioned bottom-left like reference */}
        {showCounter && images.length > 1 && (
          <div
            style={{
              position: 'absolute',
              bottom: 'var(--ds-spacing-4)',
              left: 'var(--ds-spacing-4)',
              padding: 'var(--ds-spacing-2) var(--ds-spacing-4)',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              color: 'white',
              borderRadius: 'var(--ds-border-radius-full)',
              fontSize: 'var(--ds-font-size-sm)',
              fontWeight: 'var(--ds-font-weight-medium)',
              backdropFilter: 'blur(4px)',
            }}
          >
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Vertical Thumbnails - only show if more than 1 image */}
      {images.length > 1 && (
        <div
          className="image-gallery-thumbnails"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--ds-spacing-3)',
            height: '100%',
          }}
        >
          {displayedThumbnails.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => handleThumbnailClick(index)}
              aria-label={`Vis bilde ${index + 1}`}
              aria-current={index === currentIndex ? 'true' : undefined}
              style={{
                flex: 1,
                padding: 0,
                border: index === currentIndex
                  ? '3px solid var(--ds-color-accent-base-default)'
                  : '3px solid transparent',
                borderRadius: 'var(--ds-border-radius-lg)',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'border-color 0.2s ease, opacity 0.2s ease, transform 0.2s ease',
                opacity: index === currentIndex ? 1 : 0.85,
                background: 'none',
                height: `calc((100% - ${totalGaps}px) / ${thumbnailCount})`,
              }}
              onMouseEnter={(e) => {
                if (index !== currentIndex) {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'scale(1.02)';
                }
              }}
              onMouseLeave={(e) => {
                if (index !== currentIndex) {
                  e.currentTarget.style.opacity = '0.85';
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              <img
                src={image.thumbnail || image.src}
                alt={image.alt || `Thumbnail ${index + 1}`}
                loading="lazy"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .image-gallery {
            grid-template-columns: 1fr !important;
            height: auto !important;
          }

          .image-gallery-hero {
            height: 300px !important;
          }

          .image-gallery-thumbnails {
            flex-direction: row !important;
            height: 80px !important;
            overflow-x: auto;
          }

          .image-gallery-thumbnails button {
            flex: 0 0 auto !important;
            width: 100px !important;
            height: 80px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default ImageGallery;
