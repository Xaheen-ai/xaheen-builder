/**
 * FormSection Component
 * Standardized section header for forms
 * Provides consistent styling for form sections across the application
 */

import { Paragraph } from '@xaheen/ds';
import type { ReactNode } from 'react';

export interface FormSectionProps {
  title: string;
  children: ReactNode;
  description?: string;
}

export function FormSection({ title, children, description }: FormSectionProps) {
  return (
    <div>
      <Paragraph
        data-size="sm"
        style={{
          fontWeight: 'var(--ds-font-weight-semibold)',
          color: 'var(--ds-color-neutral-text-default)',
          marginBottom: 'var(--ds-spacing-3)',
        }}
      >
        {title}
      </Paragraph>
      {description && (
        <Paragraph
          data-size="sm"
          style={{
            color: 'var(--ds-color-neutral-text-subtle)',
            marginBottom: 'var(--ds-spacing-3)',
          }}
        >
          {description}
        </Paragraph>
      )}
      {children}
    </div>
  );
}
