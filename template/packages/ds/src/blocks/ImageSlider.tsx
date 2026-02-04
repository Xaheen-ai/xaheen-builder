/**
 * ImageSlider
 *
 * Full-width image carousel with navigation, thumbnails, and smooth transitions.
 * Supports keyboard navigation, touch swipe, and fullscreen mode.
 */
import * as React from 'react';
import { Paragraph } from '@digdir/designsystemet-react';
import { cn } from '../utils';
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from '../primitives/icons';
import type { GalleryImage } from '../types/listing-detail';

export interface ImageSliderProps {
  /** Array of images to display */
  images: GalleryImage[];
  /** Initial slide index */
  initialIndex?: number;
  /** Height of the slider */
  height?: number | string;
  /** Show navigation arrows */
  showArrows?: boolean;
  /** Show dot indicators */
  showDots?: boolean;
  /** Show thumbnail strip */
  showThumbnails?: boolean;
  /** Show image counter */
  showCounter?: boolean;
  /** Enable fullscreen mode on click */
  enableFullscreen?: boolean;
  /** Auto-play interval in ms (0 to disable) */
  autoPlay?: number;
  /** Custom class name */
  className?: string;
}

/**
 * ImageSlider component
 *
 * @example
 * ```tsx
 * <ImageSlider
 *   images={[
 *     { id: '1', src: '/img1.jpg', alt: 'Image 1' },
 *     { id: '2', src: '/img2.jpg', alt: 'Image 2' },
 *   ]}
 *   showThumbnails
 *   showArrows
 *   showDots
 * />
 * ```
 */
export function ImageSlider({
  images,
  initialIndex = 0,
  height = 500,
  showArrows = true,
  showDots = true,
  showThumbnails = true,
  showCounter = true,
  enableFullscreen = true,
  autoPlay = 0,
  className,
}: ImageSliderProps): React.ReactElement {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const [touchStart, setTouchStart] = React.useState<number | null>(null);
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null);
  const sliderRef = React.useRef<HTMLDivElement>(null);

  // Minimum swipe distance
  const minSwipeDistance = 50;

  const goToSlide = React.useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 400);
  }, [isTransitioning]);

  const goToPrevious = React.useCallback(() => {
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    goToSlide(newIndex);
  }, [currentIndex, images.length, goToSlide]);

  const goToNext = React.useCallback(() => {
    const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    goToSlide(newIndex);
  }, [currentIndex, images.length, goToSlide]);

  // Auto-play
  React.useEffect(() => {
    if (autoPlay > 0 && !isFullscreen) {
      const interval = setInterval(goToNext, autoPlay);
      return () => clearInterval(interval);
    }
  }, [autoPlay, goToNext, isFullscreen]);

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrevious, goToNext, isFullscreen]);

  // Touch handlers
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    const touch = e.targetTouches[0];
    if (touch) {
      setTouchStart(touch.clientX);
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const touch = e.targetTouches[0];
    if (touch) {
      setTouchEnd(touch.clientX);
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  const handleImageClick = () => {
    if (enableFullscreen) {
      setIsFullscreen(true);
    }
  };

  if (!images.length) {
    return (
      <div
        className={cn('image-slider', className)}
        style={{
          height: typeof height === 'number' ? `${height}px` : height,
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

  const sliderContent = (
    <>
      {/* Main slider */}
      <div
        ref={sliderRef}
        className="image-slider-main"
        style={{
          position: 'relative',
          height: typeof height === 'number' ? `${height}px` : height,
          borderRadius: isFullscreen ? 0 : 'var(--ds-border-radius-lg)',
          overflow: 'hidden',
          cursor: enableFullscreen && !isFullscreen ? 'zoom-in' : 'default',
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={!isFullscreen ? handleImageClick : undefined}
      >
        {/* Slides container */}
        <div
          className="image-slider-track"
          style={{
            display: 'flex',
            height: '100%',
            transform: `translateX(-${currentIndex * 100}%)`,
            transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {images.map((image, index) => (
            <div
              key={image.id}
              className="image-slider-slide"
              style={{
                minWidth: '100%',
                height: '100%',
                position: 'relative',
              }}
            >
              <img
                src={image.src}
                alt={image.alt}
                loading={index === 0 ? 'eager' : 'lazy'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
          ))}
        </div>

        {/* Gradient overlays for better arrow visibility */}
        {showArrows && images.length > 1 && (
          <>
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '120px',
                height: '100%',
                background: 'linear-gradient(to right, rgba(0,0,0,0.3), transparent)',
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '120px',
                height: '100%',
                background: 'linear-gradient(to left, rgba(0,0,0,0.3), transparent)',
                pointerEvents: 'none',
              }}
            />
          </>
        )}

        {/* Navigation arrows */}
        {showArrows && images.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
              aria-label="Forrige bilde"
              style={{
                position: 'absolute',
                top: '50%',
                left: 'var(--ds-spacing-4)',
                transform: 'translateY(-50%)',
                width: '48px',
                height: '48px',
                borderRadius: 'var(--ds-border-radius-full)',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--ds-shadow-md)',
                transition: 'all 0.2s ease',
                zIndex: 10,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                e.currentTarget.style.backgroundColor = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(-50%)';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
              }}
            >
              <ChevronLeftIcon size={24} style={{ color: 'var(--ds-color-neutral-text-default)' }} />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); goToNext(); }}
              aria-label="Neste bilde"
              style={{
                position: 'absolute',
                top: '50%',
                right: 'var(--ds-spacing-4)',
                transform: 'translateY(-50%)',
                width: '48px',
                height: '48px',
                borderRadius: 'var(--ds-border-radius-full)',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--ds-shadow-md)',
                transition: 'all 0.2s ease',
                zIndex: 10,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                e.currentTarget.style.backgroundColor = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(-50%)';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
              }}
            >
              <ChevronRightIcon size={24} style={{ color: 'var(--ds-color-neutral-text-default)' }} />
            </button>
          </>
        )}

        {/* Counter badge */}
        {showCounter && images.length > 1 && (
          <div
            style={{
              position: 'absolute',
              bottom: 'var(--ds-spacing-4)',
              right: 'var(--ds-spacing-4)',
              padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              borderRadius: 'var(--ds-border-radius-full)',
              color: 'white',
              fontSize: 'var(--ds-font-size-sm)',
              fontWeight: 'var(--ds-font-weight-medium)',
              backdropFilter: 'blur(4px)',
              zIndex: 10,
            }}
          >
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* Dot indicators */}
        {showDots && images.length > 1 && (
          <div
            style={{
              position: 'absolute',
              bottom: 'var(--ds-spacing-4)',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 'var(--ds-spacing-2)',
              zIndex: 10,
            }}
          >
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={(e) => { e.stopPropagation(); goToSlide(index); }}
                aria-label={`Gå til bilde ${index + 1}`}
                style={{
                  width: index === currentIndex ? '24px' : '8px',
                  height: '8px',
                  borderRadius: 'var(--ds-border-radius-full)',
                  backgroundColor: index === currentIndex ? 'white' : 'rgba(255, 255, 255, 0.5)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  padding: 0,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {showThumbnails && images.length > 1 && (
        <div
          className="image-slider-thumbnails"
          style={{
            display: 'flex',
            gap: 'var(--ds-spacing-2)',
            marginTop: 'var(--ds-spacing-3)',
            padding: '0 var(--ds-spacing-1)',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => goToSlide(index)}
              aria-label={`Velg bilde ${index + 1}`}
              style={{
                flexShrink: 0,
                width: '80px',
                height: '60px',
                borderRadius: 'var(--ds-border-radius-md)',
                overflow: 'hidden',
                border: index === currentIndex
                  ? '3px solid var(--ds-color-accent-base-default)'
                  : '3px solid transparent',
                cursor: 'pointer',
                opacity: index === currentIndex ? 1 : 0.6,
                transition: 'all 0.2s ease',
                padding: 0,
                background: 'none',
              }}
              onMouseEnter={(e) => {
                if (index !== currentIndex) {
                  e.currentTarget.style.opacity = '0.9';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (index !== currentIndex) {
                  e.currentTarget.style.opacity = '0.6';
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              <img
                src={image.thumbnail || image.src}
                alt={image.alt}
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
    </>
  );

  return (
    <>
      <div className={cn('image-slider', className)}>
        {sliderContent}
      </div>

      {/* Fullscreen modal */}
      {isFullscreen && (
        <div
          className="image-slider-fullscreen"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.3s ease',
          }}
          onClick={() => setIsFullscreen(false)}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            aria-label="Lukk fullskjerm"
            style={{
              position: 'absolute',
              top: 'var(--ds-spacing-4)',
              right: 'var(--ds-spacing-4)',
              width: '48px',
              height: '48px',
              borderRadius: 'var(--ds-border-radius-full)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              transition: 'background-color 0.2s ease',
              zIndex: 10,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            <CloseIcon size={24} />
          </button>

          {/* Fullscreen image */}
          <div
            style={{
              width: '100%',
              maxWidth: '1400px',
              padding: 'var(--ds-spacing-8)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <ImageSlider
              images={images}
              initialIndex={currentIndex}
              height="80vh"
              showArrows
              showDots
              showThumbnails
              showCounter
              enableFullscreen={false}
            />
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .image-slider-thumbnails::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
}

export default ImageSlider;
