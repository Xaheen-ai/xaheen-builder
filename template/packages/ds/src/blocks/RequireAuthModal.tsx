/**
 * RequireAuthModal
 *
 * Modal dialog displayed when an unauthenticated user attempts
 * an action that requires authentication.
 */
import * as React from 'react';
import { Dialog, Button, Heading, Paragraph } from '@digdir/designsystemet-react';
import { cn } from '../utils';
import { UserIcon, CloseIcon } from '../primitives/icons';

// =============================================================================
// Types
// =============================================================================

export interface RequireAuthModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Login handler */
  onLogin?: () => void;
  /** Register handler (optional) */
  onRegister?: () => void;
  /** Title text */
  title?: string;
  /** Description text */
  description?: string;
  /** The action that requires auth (for contextual messaging) */
  actionContext?: 'favorite' | 'book' | 'message' | 'review' | 'general';
  /** Custom class name */
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function RequireAuthModal({
  isOpen,
  onClose,
  onLogin,
  onRegister,
  title,
  description,
  actionContext = 'general',
  className,
}: RequireAuthModalProps): React.ReactElement {
  // Get contextual messages
  const getContextualContent = () => {
    switch (actionContext) {
      case 'favorite':
        return {
          title: title || 'Logg inn for å lagre favoritter',
          description:
            description ||
            'Du må være innlogget for å lagre favoritter. Opprett en konto eller logg inn for å fortsette.',
        };
      case 'book':
        return {
          title: title || 'Logg inn for å booke',
          description:
            description ||
            'Du må være innlogget for å fullføre en booking. Opprett en konto eller logg inn for å fortsette.',
        };
      case 'message':
        return {
          title: title || 'Logg inn for å sende melding',
          description:
            description ||
            'Du må være innlogget for å kontakte utleier. Opprett en konto eller logg inn for å fortsette.',
        };
      case 'review':
        return {
          title: title || 'Logg inn for å skrive anmeldelse',
          description:
            description ||
            'Du må være innlogget for å skrive en anmeldelse. Opprett en konto eller logg inn for å fortsette.',
        };
      default:
        return {
          title: title || 'Innlogging kreves',
          description:
            description ||
            'Du må være innlogget for å utføre denne handlingen. Opprett en konto eller logg inn for å fortsette.',
        };
    }
  };

  const content = getContextualContent();

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className={cn('require-auth-modal', className)}
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
              <UserIcon size={32} />
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
            {onLogin && (
              <Button
                type="button"
                onClick={onLogin}
                data-size="md"
                style={{ width: '100%' }}
              >
                Logg inn
              </Button>
            )}
            {onRegister && (
              <Button
                type="button"
                onClick={onRegister}
                variant="secondary"
                data-size="md"
                style={{ width: '100%' }}
              >
                Opprett konto
              </Button>
            )}
          </div>

          {/* Help text */}
          <Paragraph
            data-size="xs"
            style={{
              margin: 0,
              marginTop: 'var(--ds-spacing-4)',
              textAlign: 'center',
              color: 'var(--ds-color-neutral-text-subtle)',
            }}
          >
            Ved å logge inn godtar du våre vilkår og personvernerklæring.
          </Paragraph>
      </Dialog.Block>
    </Dialog>
  );
}

export default RequireAuthModal;
