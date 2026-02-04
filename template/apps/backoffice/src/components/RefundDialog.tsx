/**
 * RefundDialog Component
 *
 * Admin dialog for processing full or partial refunds with reason input.
 * Used in payment reconciliation and booking management.
 *
 * @module apps/backoffice/src/components/RefundDialog
 */

import { useState, useRef, useEffect } from 'react';
import {
  Button,
  Heading,
  Paragraph,
  Textfield,
  Textarea,
  Label,
} from '@xaheen/ds';
import { useRefundPayment, formatCurrency, type RefundPaymentDTO } from '@xaheen/sdk';
import { useT } from '@xaheen/i18n';

// =============================================================================
// TYPES
// =============================================================================

export interface RefundDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog should close */
  onClose: () => void;
  /** Callback when refund is successful */
  onSuccess?: () => void;
  /** Order ID to refund */
  orderId: string;
  /** Maximum refundable amount */
  maxAmount: number;
  /** Currency code (e.g., NOK) */
  currency?: string;
  /** Original payment amount for display */
  originalAmount?: number;
}

// =============================================================================
// ICONS
// =============================================================================

function WarningIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12" y2="17" />
    </svg>
  );
}

// =============================================================================
// DIALOG BASE
// =============================================================================

interface DialogBaseProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
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
    // eslint-disable-next-line digdir/prefer-ds-components -- Using native dialog with imperative API (showModal/close)
    <dialog
      ref={dialogRef}
      onClose={onClose}
      style={{
        border: 'none',
        borderRadius: 'var(--ds-border-radius-lg)',
        padding: 0,
        maxWidth: '480px',
        width: '90vw',
        boxShadow: 'var(--ds-shadow-xlarge)',
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
// MAIN COMPONENT
// =============================================================================

/**
 * RefundDialog - Admin dialog for processing payment refunds
 *
 * Allows full or partial refunds with reason tracking.
 * Validates refund amount and shows loading states during processing.
 *
 * @example Basic usage
 * ```tsx
 * <RefundDialog
 *   open={showRefund}
 *   onClose={() => setShowRefund(false)}
 *   onSuccess={() => {
 *     toast.success('Refund processed');
 *     refetchPayments();
 *   }}
 *   orderId="vipps_123456"
 *   maxAmount={500}
 *   currency="NOK"
 *   originalAmount={500}
 * />
 * ```
 */
export function RefundDialog({
  open,
  onClose,
  onSuccess,
  orderId,
  maxAmount,
  currency = 'NOK',
  originalAmount,
}: RefundDialogProps): React.ReactElement {
  const t = useT();
  const { mutateAsync: refundPayment, isPending } = useRefundPayment();

  // Form state
  const [amount, setAmount] = useState<string>(maxAmount.toString());
  const [reason, setReason] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setAmount(maxAmount.toString());
      setReason('');
      setError('');
    }
  }, [open, maxAmount]);

  // Validate amount
  const validateAmount = (value: string): boolean => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      setError(t('refund.errors.invalidAmount', 'Beløpet må være større enn 0'));
      return false;
    }
    if (numValue > maxAmount) {
      setError(
        t(
          'refund.errors.exceedsMax',
          `Beløpet kan ikke overstige ${formatCurrency(maxAmount, currency)}`
        )
      );
      return false;
    }
    setError('');
    return true;
  };

  // Handle refund submission
  const handleRefund = async () => {
    if (!validateAmount(amount)) {
      return;
    }

    try {
      const refundData: RefundPaymentDTO = {
        orderId,
        amount: parseFloat(amount),
        reason: reason.trim() || undefined,
      };

      await refundPayment(refundData);
      onSuccess?.();
      onClose();
    } catch {
      setError(
        t(
          'refund.errors.failed',
          'Kunne ikke behandle refundering. Vennligst prøv igjen.'
        )
      );
    }
  };

  // Handle amount input change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
    setError('');
  };

  // Quick select buttons
  const isFullRefund = parseFloat(amount) === maxAmount;
  const isPartialRefund = parseFloat(amount) < maxAmount && parseFloat(amount) > 0;

  return (
    <DialogBase open={open} onClose={onClose}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--ds-spacing-3)',
          padding: 'var(--ds-spacing-5)',
          borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
        }}
      >
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--ds-border-radius-full)',
            backgroundColor: 'var(--ds-color-warning-surface-default)',
            color: 'var(--ds-color-warning-base-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <WarningIcon />
        </div>
        <Heading level={2} data-size="sm" style={{ margin: 0 }}>
          {t('refund.title', 'Refunder betaling')}
        </Heading>
      </div>

      {/* Body */}
      <div style={{ padding: 'var(--ds-spacing-5)' }}>
        {/* Payment info */}
        <div
          style={{
            marginBottom: 'var(--ds-spacing-4)',
            padding: 'var(--ds-spacing-3)',
            backgroundColor: 'var(--ds-color-neutral-background-subtle)',
            borderRadius: 'var(--ds-border-radius-md)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 'var(--ds-spacing-2)',
            }}
          >
            <span
              style={{
                fontSize: 'var(--ds-font-size-sm)',
                color: 'var(--ds-color-neutral-text-subtle)',
              }}
            >
              {t('refund.orderId', 'Ordre-ID')}
            </span>
            <span
              style={{
                fontSize: 'var(--ds-font-size-sm)',
                fontFamily: 'var(--ds-font-family-mono)',
              }}
            >
              {orderId}
            </span>
          </div>
          {originalAmount !== undefined && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span
                style={{
                  fontSize: 'var(--ds-font-size-sm)',
                  color: 'var(--ds-color-neutral-text-subtle)',
                }}
              >
                {t('refund.originalAmount', 'Opprinnelig beløp')}
              </span>
              <span
                style={{
                  fontSize: 'var(--ds-font-size-sm)',
                  fontWeight: 'var(--ds-font-weight-medium)',
                }}
              >
                {formatCurrency(originalAmount, currency)}
              </span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span
              style={{
                fontSize: 'var(--ds-font-size-sm)',
                color: 'var(--ds-color-neutral-text-subtle)',
              }}
            >
              {t('refund.maxRefundable', 'Maks refunderbart')}
            </span>
            <span
              style={{
                fontSize: 'var(--ds-font-size-sm)',
                fontWeight: 'var(--ds-font-weight-semibold)',
              }}
            >
              {formatCurrency(maxAmount, currency)}
            </span>
          </div>
        </div>

        {/* Quick select buttons */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--ds-spacing-2)',
            marginBottom: 'var(--ds-spacing-4)',
          }}
        >
          <Button
            type="button"
            variant="secondary"
            onClick={() => setAmount(maxAmount.toString())}
            style={{
              flex: 1,
              fontSize: 'var(--ds-font-size-sm)',
            }}
          >
            {t('refund.fullRefund', 'Full refundering')}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setAmount((maxAmount / 2).toFixed(2))}
            style={{
              flex: 1,
              fontSize: 'var(--ds-font-size-sm)',
            }}
          >
            {t('refund.halfRefund', '50%')}
          </Button>
        </div>

        {/* Amount input */}
        <div style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          <Label htmlFor="refund-amount" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
            {t('refund.amountLabel', 'Beløp å refundere')}
          </Label>
          <Textfield
            id="refund-amount"
            type="number"
            value={amount}
            onChange={handleAmountChange}
            placeholder={t('refund.amountPlaceholder', 'F.eks. 250')}
            disabled={isPending}
            step="0.01"
            min="0"
            max={maxAmount}
            error={!!error}
            aria-label={t('refund.amountLabel', 'Beløp å refundere')}
            style={{ width: '100%' }}
          />
          {error && (
            <Paragraph
              style={{
                margin: 'var(--ds-spacing-2) 0 0',
                fontSize: 'var(--ds-font-size-sm)',
                color: 'var(--ds-color-danger-text-default)',
              }}
            >
              {error}
            </Paragraph>
          )}
        </div>

        {/* Reason input */}
        <div>
          <Label htmlFor="refund-reason" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
            {t('refund.reasonLabel', 'Årsak (valgfritt)')}
          </Label>
          <Textarea
            id="refund-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t(
              'refund.reasonPlaceholder',
              'Beskriv hvorfor refunderingen gjennomføres...'
            )}
            disabled={isPending}
            rows={3}
            style={{ width: '100%' }}
          />
        </div>

        {/* Warning message */}
        <div
          style={{
            marginTop: 'var(--ds-spacing-4)',
            padding: 'var(--ds-spacing-3)',
            backgroundColor: 'var(--ds-color-warning-surface-default)',
            borderLeft: '3px solid var(--ds-color-warning-border-default)',
            borderRadius: 'var(--ds-border-radius-sm)',
          }}
        >
          <Paragraph
            style={{
              margin: 0,
              fontSize: 'var(--ds-font-size-sm)',
              color: 'var(--ds-color-warning-text-default)',
            }}
          >
            {isFullRefund
              ? t('refund.warningFull', 'Full refundering vil tilbakebetale hele beløpet.')
              : isPartialRefund
                ? t('refund.warningPartial', 'Delvis refundering vil tilbakebetale det angitte beløpet.')
                : t('refund.warningInvalid', 'Vennligst angi et gyldig beløp.')}
          </Paragraph>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 'var(--ds-spacing-3)',
          padding: 'var(--ds-spacing-4) var(--ds-spacing-5)',
          borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
          backgroundColor: 'var(--ds-color-neutral-background-subtle)',
        }}
      >
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
          disabled={isPending}
        >
          {t('common.cancel', 'Avbryt')}
        </Button>
        <Button
          type="button"
          variant="primary"
          data-color="warning"
          onClick={handleRefund}
          disabled={isPending || !!error}
        >
          {isPending
            ? t('refund.processing', 'Behandler...')
            : t('refund.confirm', 'Refunder')}
        </Button>
      </div>
    </DialogBase>
  );
}
