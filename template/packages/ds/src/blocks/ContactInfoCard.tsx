/**
 * ContactInfoCard
 *
 * Card displaying contact information with email and phone.
 */
import * as React from 'react';
import { Heading, Link, Paragraph } from '@digdir/designsystemet-react';
import { cn } from '../utils';
import { MailIcon, PhoneIcon } from '../primitives/icons';

export interface ContactInfoCardProps {
  /** Email address */
  email?: string;
  /** Phone number */
  phone?: string;
  /** Website URL */
  website?: string;
  /** Contact person name */
  contactName?: string;
  /** Card title */
  title?: string;
  /** Custom class name */
  className?: string;
}

/**
 * ContactInfoCard component
 *
 * @example
 * ```tsx
 * <ContactInfoCard
 *   email="kontakt@digilist.no"
 *   phone="+47 12 34 56 78"
 * />
 * ```
 */
export function ContactInfoCard({
  email,
  phone,
  website,
  contactName,
  title = 'Kontaktinformasjon',
  className,
}: ContactInfoCardProps): React.ReactElement {
  if (!email && !phone && !website && !contactName) {
    return <></>;
  }

  // Shared styles for icon container
  const iconContainerStyle: React.CSSProperties = {
    width: 40,
    height: 40,
    borderRadius: 'var(--ds-border-radius-full)',
    backgroundColor: 'var(--ds-color-neutral-surface-hover)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  return (
    <div
      className={cn('contact-info-card', className)}
      style={{
        padding: 'var(--ds-spacing-5)',
        backgroundColor: 'var(--ds-color-neutral-background-default)',
        border: '1px solid var(--ds-color-neutral-border-subtle)',
        borderRadius: 'var(--ds-border-radius-lg)',
      }}
    >
      {title && (
        <Heading
          level={3}
          data-size="xs"
          style={{
            margin: '0 0 var(--ds-spacing-4) 0',
            color: 'var(--ds-color-neutral-text-default)',
          }}
        >
          {title}
        </Heading>
      )}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--ds-spacing-4)',
        }}
      >
        {contactName && (
          <Paragraph
            data-size="sm"
            style={{
              margin: 0,
              fontWeight: 'var(--ds-font-weight-medium)',
              color: 'var(--ds-color-neutral-text-default)',
            }}
          >
            {contactName}
          </Paragraph>
        )}

        {email && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-3)',
            }}
          >
            <div style={iconContainerStyle}>
              <MailIcon
                size={18}
                style={{ color: 'var(--ds-color-neutral-text-subtle)' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-1)' }}>
              <Paragraph
                data-size="xs"
                style={{
                  margin: 0,
                  color: 'var(--ds-color-neutral-text-subtle)',
                }}
              >
                E-post
              </Paragraph>
              <Link
                href={`mailto:${email}`}
                style={{
                  fontSize: 'var(--ds-font-size-sm)',
                  color: 'var(--ds-color-accent-text-default)',
                }}
              >
                {email}
              </Link>
            </div>
          </div>
        )}

        {phone && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-3)',
            }}
          >
            <div style={iconContainerStyle}>
              <PhoneIcon
                size={18}
                style={{ color: 'var(--ds-color-neutral-text-subtle)' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-1)' }}>
              <Paragraph
                data-size="xs"
                style={{
                  margin: 0,
                  color: 'var(--ds-color-neutral-text-subtle)',
                }}
              >
                Telefon
              </Paragraph>
              <Link
                href={`tel:${phone.replace(/\s/g, '')}`}
                style={{
                  fontSize: 'var(--ds-font-size-sm)',
                  color: 'var(--ds-color-accent-text-default)',
                }}
              >
                {phone}
              </Link>
            </div>
          </div>
        )}

        {website && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-2)',
            }}
          >
            <Link
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 'var(--ds-font-size-sm)',
              }}
            >
              {website}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default ContactInfoCard;
