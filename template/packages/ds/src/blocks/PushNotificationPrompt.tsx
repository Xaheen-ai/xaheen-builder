/**
 * PushNotificationPrompt
 *
 * Modal dialog displayed to request browser push notification permission
 * from the user for receiving booking updates and reminders.
 */
import * as React from 'react';
import { Dialog, Button, Heading, Paragraph } from '@digdir/designsystemet-react';
import { cn } from '../utils';
import { BellIcon, CloseIcon } from '../primitives/icons';

// =============================================================================
// Types
// =============================================================================

export interface PushNotificationPromptProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Enable notifications handler */
  onEnable?: () => void;
  /** Dismiss handler (optional, defaults to onClose) */
  onDismiss?: () => void;
  /** Title text */
  title?: string;
  /** Description text */
  description?: string;
  /** Context for the prompt (affects messaging) */
  context?: 'booking' | 'reminder' | 'general';
  /** Custom class name */
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function PushNotificationPrompt({
  isOpen,
  onClose,
  onEnable,
  onDismiss,
  title,
  description,
  context = 'general',
  className,
}: PushNotificationPromptProps): React.ReactElement {
  // Get contextual messages
  const getContextualContent = () => {
    switch (context) {
      case 'booking':
        return {
          title: title || 'Få varsler om dine bookinger',
          description:
            description ||
            'Hold deg oppdatert om bookingbekreftelser, endringer og kanselleringer direkte i nettleseren din.',
        };
      case 'reminder':
        return {
          title: title || 'Ikke gå glipp av dine bookinger',
          description:
            description ||
            'Vi kan sende deg påminnelser før dine bookinger så du aldri glemmer en avtale.',
        };
      default:
        return {
          title: title || 'Aktiver varsler',
          description:
            description ||
            'Få viktige oppdateringer om dine bookinger direkte i nettleseren din.',
        };
    }
  };

  const content = getContextualContent();

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className={cn('push-notification-prompt', className)}
      style={{ maxWidth: '400px' }}
    >
      <Dialog.Block>
        {/* Close button */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: 'var(--ds-spacing-2)',
          }}
        >
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

        {/* Icon */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: 'var(--ds-spacing-4)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              backgroundColor: 'var(--ds-color-accent-surface-default)',
              borderRadius: 'var(--ds-border-radius-full)',
              color: 'var(--ds-color-accent-base-default)',
            }}
          >
            <BellIcon size={32} />
          </div>
        </div>

        {/* Title */}
        <Heading
          level={2}
          data-size="sm"
          style={{
            margin: 0,
            marginBottom: 'var(--ds-spacing-2)',
            textAlign: 'center',
          }}
        >
          {content.title}
        </Heading>

        {/* Description */}
        <Paragraph
          data-size="sm"
          style={{
            margin: 0,
            marginBottom: 'var(--ds-spacing-6)',
            textAlign: 'center',
            color: 'var(--ds-color-neutral-text-subtle)',
          }}
        >
          {content.description}
        </Paragraph>

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--ds-spacing-2)',
          }}
        >
          {onEnable && (
            <Button
              type="button"
              onClick={onEnable}
              data-size="md"
              style={{ width: '100%' }}
            >
              Aktiver varsler
            </Button>
          )}
          <Button
            type="button"
            onClick={onDismiss || onClose}
            variant="secondary"
            data-size="md"
            style={{ width: '100%' }}
          >
            Kanskje senere
          </Button>
        </div>
      </Dialog.Block>
    </Dialog>
  );
}
