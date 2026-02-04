/**
 * FaqTab Component
 *
 * Displays frequently asked questions in accordion format.
 */

import * as React from 'react';
import { Heading, Paragraph, Details } from '@xaheen/ds';
import type { FAQItem, ListingType } from '../types';
import { createPresenter } from '../presenters/listingTypePresenter';

// =============================================================================
// Icons
// =============================================================================

function HelpIcon(): React.ReactElement {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

// =============================================================================
// Props
// =============================================================================

export interface FaqTabProps {
  faq: FAQItem[];
  listingType: ListingType;
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function FaqTab({
  faq,
  listingType,
  className,
}: FaqTabProps): React.ReactElement {
  const presenter = React.useMemo(() => createPresenter(listingType), [listingType]);

  if (faq.length === 0) {
    return (
      <div
        className={className}
        style={{
          textAlign: 'center',
          padding: 'var(--ds-spacing-8)',
          color: 'var(--ds-color-neutral-text-subtle)',
        }}
      >
        <HelpIcon />
        <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-4)', fontStyle: 'italic' }}>
          {presenter.getEmptyState('faq')}
        </Paragraph>
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-4)',
      }}
    >
      <Heading level={2} data-size="sm" style={{ margin: 0 }}>
        Ofte stilte spørsmål
      </Heading>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
        {faq.map((item: FAQItem, index: number) => (
          <Details key={`${item.id}-${index}`}>
            <Details.Summary>
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                <HelpIcon />
                {item.question}
              </span>
            </Details.Summary>
            <Details.Content>
              <Paragraph
                data-size="sm"
                style={{
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  lineHeight: 'var(--ds-font-line-height-default)',
                }}
              >
                {item.answer}
              </Paragraph>
            </Details.Content>
          </Details>
        ))}
      </div>
    </div>
  );
}

export default FaqTab;
