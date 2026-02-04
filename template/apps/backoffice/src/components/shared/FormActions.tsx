/**
 * FormActions Component
 * Standardized action button group for forms
 * Provides consistent layout and styling for submit/cancel actions
 */

import { Button } from '@xaheen/ds';

export interface FormActionsProps {
  /** Text for the primary submit button */
  submitText: string;
  /** Text for the secondary cancel button */
  cancelText?: string;
  /** Callback for cancel button */
  onCancel: () => void;
  /** Whether the form is currently submitting */
  isSubmitting?: boolean;
  /** Optional loading text to show during submission */
  submittingText?: string;
}

export function FormActions({
  submitText,
  cancelText = 'Avbryt',
  onCancel,
  isSubmitting = false,
  submittingText = 'Lagrer...',
}: FormActionsProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 'var(--ds-spacing-3)',
        paddingTop: 'var(--ds-spacing-3)',
        borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
      }}
    >
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? submittingText : submitText}
      </Button>
      <Button
        type="button"
        variant="secondary"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        {cancelText}
      </Button>
    </div>
  );
}
