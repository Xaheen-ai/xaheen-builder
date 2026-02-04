/**
 * FormField Component
 * A wrapper for form inputs with label, description, and error message
 */
import React from 'react';
import { Label } from '@digdir/designsystemet-react';

export interface FormFieldProps {
  /** Field label */
  label?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Error message */
  error?: string | undefined;
  /** Help text / description */
  description?: string | undefined;
  /** Children (the form control) */
  children: React.ReactNode;
  /** Custom className */
  className?: string;
}

export function FormField({
  label,
  required = false,
  error,
  description,
  children,
  className,
}: FormFieldProps): React.ReactElement {
  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-1)' }}>
      {label && (
        <Label style={{ fontWeight: 'var(--ds-font-weight-medium)' }}>
          {label}
          {required && <span style={{ color: 'var(--ds-color-danger-text-default)', marginLeft: '2px' }}>*</span>}
        </Label>
      )}
      {description && (
        <span style={{
          fontSize: 'var(--ds-font-size-sm)',
          color: 'var(--ds-color-neutral-text-subtle)',
        }}>
          {description}
        </span>
      )}
      {children}
      {error && (
        <span style={{
          fontSize: 'var(--ds-font-size-sm)',
          color: 'var(--ds-color-danger-text-default)',
        }}>
          {error}
        </span>
      )}
    </div>
  );
}

export default FormField;
