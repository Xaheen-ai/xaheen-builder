/**
 * ContactWidget Component
 *
 * Displays contact information for a listing.
 * Matches Digilist design with clean card layout.
 */

import * as React from 'react';
import { Paragraph } from '@xaheen/ds';
import type { ContactInfo } from '../../types';

// =============================================================================
// Icons
// =============================================================================

function MailIcon({ size = 18 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function PhoneIcon({ size = 18 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

// =============================================================================
// Props
// =============================================================================

export interface ContactWidgetProps {
  contact: ContactInfo;
  onSendMessage?: () => void;
  showMessageButton?: boolean;
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

function UserIcon({ size = 18 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function ContactWidget({
  contact,
  className,
}: ContactWidgetProps): React.ReactElement {
  const hasAnyContact = contact.email || contact.phone || contact.name;

  if (!hasAnyContact) {
    return <></>;
  }

  return (
    <div
      className={className}
      style={{
        padding: 'var(--ds-spacing-4)',
        backgroundColor: 'var(--ds-color-neutral-background-default)',
        borderRadius: 'var(--ds-border-radius-lg)',
        border: '1px solid var(--ds-color-neutral-border-subtle)',
      }}
    >
      <Paragraph
        data-size="xs"
        style={{
          margin: 0,
          marginBottom: 'var(--ds-spacing-3)',
          color: 'var(--ds-color-neutral-text-subtle)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          fontWeight: 'var(--ds-font-weight-medium)',
        }}
      >
        Kontaktinformasjon
      </Paragraph>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
        {/* Contact Name */}
        {contact.name && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
            <div style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              <UserIcon />
            </div>
            <div>
              <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                Kontaktperson
              </Paragraph>
              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                {contact.name}
              </Paragraph>
            </div>
          </div>
        )}

        {/* Email */}
        {contact.email && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
            <div style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              <MailIcon />
            </div>
            <div>
              <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                E-post
              </Paragraph>
              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                {contact.email}
              </Paragraph>
            </div>
          </div>
        )}

        {/* Phone */}
        {contact.phone && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
            <div style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              <PhoneIcon />
            </div>
            <div>
              <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                Telefon
              </Paragraph>
              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                {contact.phone}
              </Paragraph>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ContactWidget;
