/**
 * FAQTab
 *
 * Frequently asked questions with expandable answers.
 * Uses Accordion component for question/answer format.
 */
import * as React from 'react';
import { Details, DetailsSummary, DetailsContent, Heading, Paragraph } from '@digdir/designsystemet-react';
import { cn } from '../utils';
import type { FAQItem } from '../types/listing-detail';

export interface FAQTabProps {
  /** Array of FAQ items */
  items: FAQItem[];
  /** Custom class name */
  className?: string;
}

/**
 * FAQTab component
 *
 * @example
 * ```tsx
 * <FAQTab
 *   items={[
 *     {
 *       id: 'booking',
 *       question: 'Hvordan booker jeg?',
 *       answer: 'Du kan booke ved å velge tidspunkter i kalenderen...',
 *     },
 *     {
 *       id: 'cancellation',
 *       question: 'Hva er avbestillingsregler?',
 *       answer: 'Avbestilling må skje senest 24 timer før...',
 *     },
 *   ]}
 * />
 * ```
 */
export function FAQTab({
  items,
  className,
}: FAQTabProps): React.ReactElement {
  if (!items.length) {
    return (
      <div className={cn('faq-tab', className)}>
        <Paragraph
          data-size="sm"
          style={{ color: 'var(--ds-color-neutral-text-subtle)' }}
        >
          Ingen ofte stilte spørsmål tilgjengelig.
        </Paragraph>
      </div>
    );
  }

  return (
    <div className={cn('faq-tab', className)}>
      <div style={{ marginBottom: 'var(--ds-spacing-4)' }}>
        <Heading
          level={2}
          data-size="sm"
          style={{ margin: '0 0 var(--ds-spacing-2) 0' }}
        >
          Ofte stilte spørsmål
        </Heading>
        <Paragraph
          data-size="sm"
          style={{
            margin: 0,
            color: 'var(--ds-color-neutral-text-subtle)',
          }}
        >
          Finn svar på de vanligste spørsmålene om denne fasiliteten.
        </Paragraph>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
        {items.map((item) => (
          <Details key={item.id} data-color="neutral">
            <DetailsSummary>
              <Paragraph
                data-size="sm"
                style={{
                  margin: 0,
                  fontWeight: 'var(--ds-font-weight-medium)',
                  color: 'var(--ds-color-accent-text-default)',
                }}
              >
                {item.question}
              </Paragraph>
            </DetailsSummary>
            <DetailsContent>
              {typeof item.answer === 'string' ? (
                <Paragraph
                  data-size="sm"
                  style={{
                    margin: 0,
                    color: 'var(--ds-color-neutral-text-default)',
                  }}
                >
                  {item.answer}
                </Paragraph>
              ) : (
                item.answer
              )}
            </DetailsContent>
          </Details>
        ))}
      </div>
    </div>
  );
}

export default FAQTab;
