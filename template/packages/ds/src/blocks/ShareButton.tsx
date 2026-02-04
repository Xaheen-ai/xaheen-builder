/**
 * ShareButton
 *
 * Button for sharing listings with support for native share API,
 * clipboard copy, and social media sharing options.
 */
import * as React from 'react';
import { Button, Heading, Paragraph, Dialog } from '@digdir/designsystemet-react';
import { cn } from '../utils';
import { ShareIcon, CheckIcon, CloseIcon } from '../primitives/icons';

// =============================================================================
// Types
// =============================================================================

export interface ShareData {
  /** URL to share */
  url: string;
  /** Share title */
  title: string;
  /** Share description/text */
  description?: string;
  /** Image URL for social previews */
  image?: string;
}

export type SharePlatform =
  | 'native'
  | 'copy'
  | 'email'
  | 'facebook'
  | 'twitter'
  | 'linkedin'
  | 'whatsapp';

export interface ShareButtonProps {
  /** Share data */
  shareData: ShareData;
  /** UTM parameters for tracking */
  utmParams?: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
  };
  /** Available share platforms (default: all) */
  platforms?: SharePlatform[];
  /** Callback when share is initiated */
  onShare?: (platform?: SharePlatform) => void;
  /** Visual variant */
  variant?: 'icon' | 'button';
  /** Size */
  size?: 'sm' | 'md' | 'lg';
  /** Custom class name */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

export interface ShareSheetProps {
  /** Whether the sheet is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Share data */
  shareData: ShareData;
  /** UTM parameters */
  utmParams?: ShareButtonProps['utmParams'];
  /** Available platforms */
  platforms?: SharePlatform[];
  /** Share callback */
  onShare?: (platform: SharePlatform) => void;
}

// =============================================================================
// Icons
// =============================================================================

function CopyIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function MailIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function FacebookIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function TwitterIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedinIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function WhatsappIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// =============================================================================
// Helpers
// =============================================================================

function buildShareUrl(baseUrl: string, utmParams?: ShareButtonProps['utmParams']): string {
  if (!utmParams) return baseUrl;

  const url = new URL(baseUrl);
  if (utmParams.source) url.searchParams.set('utm_source', utmParams.source);
  if (utmParams.medium) url.searchParams.set('utm_medium', utmParams.medium);
  if (utmParams.campaign) url.searchParams.set('utm_campaign', utmParams.campaign);
  if (utmParams.content) url.searchParams.set('utm_content', utmParams.content);
  return url.toString();
}

function getShareLink(
  platform: SharePlatform,
  data: ShareData,
  utmParams?: ShareButtonProps['utmParams']
): string {
  const url = buildShareUrl(data.url, {
    ...utmParams,
    source: platform,
  });
  const text = encodeURIComponent(data.title);
  const body = encodeURIComponent(data.description || data.title);

  switch (platform) {
    case 'email':
      return `mailto:?subject=${text}&body=${body}%0A%0A${encodeURIComponent(url)}`;
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    case 'twitter':
      return `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`;
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    case 'whatsapp':
      return `https://wa.me/?text=${text}%20${encodeURIComponent(url)}`;
    default:
      return url;
  }
}

// =============================================================================
// ShareSheet Component
// =============================================================================

export function ShareSheet({
  isOpen,
  onClose,
  shareData,
  utmParams,
  platforms = ['copy', 'email', 'facebook', 'twitter', 'linkedin', 'whatsapp'],
  onShare,
}: ShareSheetProps): React.ReactElement | null {
  const [copied, setCopied] = React.useState(false);

  const handleCopyLink = async () => {
    try {
      const url = buildShareUrl(shareData.url, { ...utmParams, source: 'copy' });
      await navigator.clipboard.writeText(url);
      setCopied(true);
      onShare?.('copy');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handlePlatformShare = (platform: SharePlatform) => {
    onShare?.(platform);
    const link = getShareLink(platform, shareData, utmParams);
    window.open(link, '_blank', 'noopener,noreferrer,width=600,height=400');
  };

  const platformConfig: Record<
    Exclude<SharePlatform, 'native'>,
    { label: string; icon: React.ReactNode; color: string }
  > = {
    copy: {
      label: copied ? 'Kopiert!' : 'Kopier lenke',
      icon: copied ? <CheckIcon size={20} /> : <CopyIcon size={20} />,
      color: 'var(--ds-color-neutral-base-default)',
    },
    email: {
      label: 'E-post',
      icon: <MailIcon size={20} />,
      color: 'var(--ds-color-neutral-text-default)',
    },
    facebook: {
      label: 'Facebook',
      icon: <FacebookIcon size={20} />,
      color: '#1877F2',
    },
    twitter: {
      label: 'X (Twitter)',
      icon: <TwitterIcon size={20} />,
      color: '#000000',
    },
    linkedin: {
      label: 'LinkedIn',
      icon: <LinkedinIcon size={20} />,
      color: '#0A66C2',
    },
    whatsapp: {
      label: 'WhatsApp',
      icon: <WhatsappIcon size={20} />,
      color: '#25D366',
    },
  };

  const visiblePlatforms = platforms.filter((p) => p !== 'native') as Exclude<
    SharePlatform,
    'native'
  >[];

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      style={{ maxWidth: '400px' }}
    >
      <Dialog.Block>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--ds-spacing-4)',
            }}
          >
            <Heading level={2} data-size="sm" style={{ margin: 0 }}>
              Del
            </Heading>
            <button
              type="button"
              onClick={onClose}
              aria-label="Lukk"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                border: 'none',
                borderRadius: 'var(--ds-border-radius-full)',
                backgroundColor: 'transparent',
                color: 'var(--ds-color-neutral-text-subtle)',
                cursor: 'pointer',
              }}
            >
              <CloseIcon size={20} />
            </button>
          </div>

          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
            {shareData.title}
          </Paragraph>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 'var(--ds-spacing-3)',
            }}
          >
            {visiblePlatforms.map((platform) => {
              const config = platformConfig[platform];
              return (
                <button
                  key={platform}
                  type="button"
                  onClick={() =>
                    platform === 'copy'
                      ? handleCopyLink()
                      : handlePlatformShare(platform)
                  }
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 'var(--ds-spacing-2)',
                    padding: 'var(--ds-spacing-3)',
                    border: '1px solid var(--ds-color-neutral-border-subtle)',
                    borderRadius: 'var(--ds-border-radius-md)',
                    backgroundColor: 'var(--ds-color-neutral-background-default)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span style={{ color: config.color }}>{config.icon}</span>
                  <span
                    style={{
                      fontSize: 'var(--ds-font-size-xs)',
                      color: 'var(--ds-color-neutral-text-default)',
                    }}
                  >
                    {config.label}
                  </span>
                </button>
              );
            })}
          </div>
        </Dialog.Block>
    </Dialog>
  );
}

// =============================================================================
// ShareButton Component
// =============================================================================

export function ShareButton({
  shareData,
  utmParams,
  platforms = ['native', 'copy', 'email', 'facebook', 'twitter', 'linkedin', 'whatsapp'],
  onShare,
  variant = 'icon',
  size = 'md',
  className,
  disabled = false,
}: ShareButtonProps): React.ReactElement {
  const [showSheet, setShowSheet] = React.useState(false);

  const sizeMap = {
    sm: { button: '32px', icon: 14 },
    md: { button: '40px', icon: 16 },
    lg: { button: '48px', icon: 20 },
  };

  const currentSize = sizeMap[size];

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled) return;

    // Try native share API first
    if (
      platforms.includes('native') &&
      typeof navigator !== 'undefined' &&
      navigator.share
    ) {
      try {
        await navigator.share({
          title: shareData.title,
          text: shareData.description || '',
          url: buildShareUrl(shareData.url, { ...utmParams, source: 'native' }),
        });
        onShare?.('native');
        return;
      } catch (err) {
        // User cancelled or API not supported, fall through to sheet
        if ((err as Error).name !== 'AbortError') {
          console.debug('Native share failed, showing sheet:', err);
        }
      }
    }

    // Show share sheet
    setShowSheet(true);
  };

  const handleSheetShare = (platform: SharePlatform) => {
    onShare?.(platform);
  };

  // Icon-only variant
  if (variant === 'icon') {
    return (
      <>
        <button
          type="button"
          onClick={handleClick}
          aria-label="Del"
          disabled={disabled}
          className={cn('share-button', className)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: currentSize.button,
            height: currentSize.button,
            border: '1px solid var(--ds-color-neutral-border-default)',
            borderRadius: 'var(--ds-border-radius-full)',
            backgroundColor: 'var(--ds-color-neutral-background-default)',
            color: 'var(--ds-color-neutral-text-subtle)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            opacity: disabled ? 0.5 : 1,
          }}
        >
          <ShareIcon size={currentSize.icon} />
        </button>

        <ShareSheet
          isOpen={showSheet}
          onClose={() => setShowSheet(false)}
          shareData={shareData}
          utmParams={utmParams}
          platforms={platforms.filter((p) => p !== 'native') as SharePlatform[]}
          onShare={handleSheetShare}
        />
      </>
    );
  }

  // Full button variant
  return (
    <>
      <Button
        type="button"
        onClick={handleClick}
        data-size={size}
        variant="secondary"
        disabled={disabled}
        className={cn('share-button-full', className)}
      >
        <ShareIcon size={16} />
        <span>Del</span>
      </Button>

      <ShareSheet
        isOpen={showSheet}
        onClose={() => setShowSheet(false)}
        shareData={shareData}
        utmParams={utmParams}
        platforms={platforms.filter((p) => p !== 'native') as SharePlatform[]}
        onShare={handleSheetShare}
      />
    </>
  );
}

export default ShareButton;
