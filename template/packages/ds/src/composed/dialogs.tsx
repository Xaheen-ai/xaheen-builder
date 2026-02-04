/**
 * Dialog Components
 * 
 * Reusable dialog components for confirmations and alerts.
 * Uses native dialog element with design system styling.
 */

import { type ReactNode, useState, useCallback, createContext, useContext, useEffect, useRef } from 'react';
import { Button, Heading, Paragraph } from '@digdir/designsystemet-react';

// =============================================================================
// Types
// =============================================================================

export type DialogVariant = 'info' | 'success' | 'warning' | 'danger';

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: DialogVariant;
  isLoading?: boolean;
}

export interface AlertDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  closeText?: string;
  variant?: DialogVariant;
}

// =============================================================================
// Icons
// =============================================================================

function InfoIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="8" />
    </svg>
  );
}

function SuccessIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="9 12 12 15 16 10" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12" y2="17" />
    </svg>
  );
}

function DangerIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

function getVariantIcon(variant: DialogVariant): ReactNode {
  switch (variant) {
    case 'success':
      return <SuccessIcon />;
    case 'warning':
      return <WarningIcon />;
    case 'danger':
      return <DangerIcon />;
    default:
      return <InfoIcon />;
  }
}

function getVariantColors(variant: DialogVariant) {
  switch (variant) {
    case 'success':
      return {
        bg: 'var(--ds-color-success-surface-default)',
        color: 'var(--ds-color-success-base-default)',
      };
    case 'warning':
      return {
        bg: 'var(--ds-color-warning-surface-default)',
        color: 'var(--ds-color-warning-base-default)',
      };
    case 'danger':
      return {
        bg: 'var(--ds-color-danger-surface-default)',
        color: 'var(--ds-color-danger-base-default)',
      };
    default:
      return {
        bg: 'var(--ds-color-accent-surface-default)',
        color: 'var(--ds-color-accent-base-default)',
      };
  }
}

// =============================================================================
// Dialog Base
// =============================================================================

interface DialogBaseProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

function DialogBase({ open, onClose, children }: DialogBaseProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClick = (e: MouseEvent) => {
      const rect = dialog.getBoundingClientRect();
      const isInDialog = (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      );
      if (!isInDialog) {
        onClose();
      }
    };

    dialog.addEventListener('click', handleClick);
    return () => dialog.removeEventListener('click', handleClick);
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      style={{
        border: 'none',
        borderRadius: 'var(--ds-border-radius-lg)',
        padding: 0,
        maxWidth: '420px',
        width: '90vw',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
        backgroundColor: 'var(--ds-color-neutral-background-default)',
      }}
    >
      <div onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </dialog>
  );
}

// =============================================================================
// ConfirmDialog Component
// =============================================================================

/**
 * Confirmation dialog for destructive or important actions.
 * 
 * @example
 * ```tsx
 * <ConfirmDialog
 *   open={showDelete}
 *   onClose={() => setShowDelete(false)}
 *   onConfirm={handleDelete}
 *   title="Slett booking?"
 *   description="Er du sikker på at du vil slette denne bookingen?"
 *   confirmText="Slett"
 *   cancelText="Avbryt"
 *   variant="danger"
 * />
 * ```
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Bekreft',
  cancelText = 'Avbryt',
  variant = 'info',
  isLoading = false,
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);
  const colors = getVariantColors(variant);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Confirm action failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const isProcessing = loading || isLoading;

  return (
    <DialogBase open={open} onClose={onClose}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--ds-spacing-3)',
        padding: 'var(--ds-spacing-5)',
        borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: 'var(--ds-border-radius-full)',
          backgroundColor: colors.bg,
          color: colors.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          {getVariantIcon(variant)}
        </div>
        <Heading level={2} data-size="sm" style={{ margin: 0 }}>
          {title}
        </Heading>
      </div>

      {/* Body */}
      {description && (
        <div style={{ padding: 'var(--ds-spacing-5)' }}>
          <Paragraph style={{ margin: 0, color: 'var(--ds-color-neutral-text-default)' }}>
            {description}
          </Paragraph>
        </div>
      )}

      {/* Footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 'var(--ds-spacing-3)',
        padding: 'var(--ds-spacing-4) var(--ds-spacing-5)',
        borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
        backgroundColor: 'var(--ds-color-neutral-background-subtle)',
      }}>
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
          disabled={isProcessing}
        >
          {cancelText}
        </Button>
        <Button
          type="button"
          variant="primary"
          {...(variant === 'danger' ? { 'data-color': 'danger' } : {})}
          onClick={handleConfirm}
          disabled={isProcessing}
        >
          {isProcessing ? 'Vennligst vent...' : confirmText}
        </Button>
      </div>
    </DialogBase>
  );
}

// =============================================================================
// AlertDialog Component
// =============================================================================

/**
 * Alert dialog for displaying important information.
 * 
 * @example
 * ```tsx
 * <AlertDialog
 *   open={showSuccess}
 *   onClose={() => setShowSuccess(false)}
 *   title="Booking bekreftet!"
 *   description="Du vil motta en bekreftelse på e-post."
 *   variant="success"
 * />
 * ```
 */
export function AlertDialog({
  open,
  onClose,
  title,
  description,
  closeText = 'Lukk',
  variant = 'info',
}: AlertDialogProps) {
  const colors = getVariantColors(variant);

  return (
    <DialogBase open={open} onClose={onClose}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--ds-spacing-3)',
        padding: 'var(--ds-spacing-5)',
        borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: 'var(--ds-border-radius-full)',
          backgroundColor: colors.bg,
          color: colors.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          {getVariantIcon(variant)}
        </div>
        <Heading level={2} data-size="sm" style={{ margin: 0 }}>
          {title}
        </Heading>
      </div>

      {/* Body */}
      {description && (
        <div style={{ padding: 'var(--ds-spacing-5)' }}>
          <Paragraph style={{ margin: 0, color: 'var(--ds-color-neutral-text-default)' }}>
            {description}
          </Paragraph>
        </div>
      )}

      {/* Footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        padding: 'var(--ds-spacing-4) var(--ds-spacing-5)',
        borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
        backgroundColor: 'var(--ds-color-neutral-background-subtle)',
      }}>
        <Button type="button" variant="primary" onClick={onClose}>
          {closeText}
        </Button>
      </div>
    </DialogBase>
  );
}

// =============================================================================
// Dialog Context & Hook
// =============================================================================

interface DialogContextValue {
  confirm: (options: Omit<ConfirmDialogProps, 'open' | 'onClose' | 'onConfirm'> & { onConfirm?: () => void | Promise<void> }) => Promise<boolean>;
  alert: (options: Omit<AlertDialogProps, 'open' | 'onClose'>) => Promise<void>;
}

const DialogContext = createContext<DialogContextValue | null>(null);

interface DialogState {
  type: 'confirm' | 'alert';
  props: ConfirmDialogProps | AlertDialogProps;
  resolve: (value: boolean) => void;
}

/**
 * Provider for imperative dialog access via useDialog hook.
 */
export function DialogProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<DialogState | null>(null);

  const confirm = useCallback((options: Omit<ConfirmDialogProps, 'open' | 'onClose' | 'onConfirm'> & { onConfirm?: () => void | Promise<void> }): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialog({
        type: 'confirm',
        props: {
          ...options,
          open: true,
          onClose: () => {
            setDialog(null);
            resolve(false);
          },
          onConfirm: async () => {
            await options.onConfirm?.();
            setDialog(null);
            resolve(true);
          },
        } as ConfirmDialogProps,
        resolve,
      });
    });
  }, []);

  const alert = useCallback((options: Omit<AlertDialogProps, 'open' | 'onClose'>): Promise<void> => {
    return new Promise((resolve) => {
      setDialog({
        type: 'alert',
        props: {
          ...options,
          open: true,
          onClose: () => {
            setDialog(null);
            resolve();
          },
        } as AlertDialogProps,
        resolve: () => resolve(),
      });
    });
  }, []);

  return (
    <DialogContext.Provider value={{ confirm, alert }}>
      {children}
      {dialog?.type === 'confirm' && (
        <ConfirmDialog {...(dialog.props as ConfirmDialogProps)} />
      )}
      {dialog?.type === 'alert' && (
        <AlertDialog {...(dialog.props as AlertDialogProps)} />
      )}
    </DialogContext.Provider>
  );
}

/**
 * Hook for imperative dialog access.
 * 
 * @example
 * ```tsx
 * const { confirm, alert } = useDialog();
 * 
 * const handleDelete = async () => {
 *   const confirmed = await confirm({
 *     title: 'Slett booking?',
 *     description: 'Handlingen kan ikke angres.',
 *     variant: 'danger',
 *   });
 *   if (confirmed) {
 *     await deleteBooking();
 *   }
 * };
 * ```
 */
export function useDialog(): DialogContextValue {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
}
