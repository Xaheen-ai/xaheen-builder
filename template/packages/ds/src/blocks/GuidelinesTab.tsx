/**
 * GuidelinesTab
 *
 * Accordion-style expandable rules and policies.
 * Each section expands to show detailed policy text.
 */
import * as React from 'react';
import { Details, DetailsSummary, DetailsContent, Heading, Paragraph } from '@digdir/designsystemet-react';
import { cn } from '../utils';
import type { GuidelineSection } from '../types/listing-detail';

export interface GuidelinesTabProps {
  /** Array of guideline sections */
  sections: GuidelineSection[];
  /** Custom class name */
  className?: string;
}

/**
 * GuidelinesTab component
 *
 * @example
 * ```tsx
 * <GuidelinesTab
 *   sections={[
 *     {
 *       id: 'cancellation',
 *       title: 'Avbestilling',
 *       content: 'Avbestilling må skje senest 24 timer før...',
 *     },
 *     {
 *       id: 'damages',
 *       title: 'Skader',
 *       content: 'Ved skader på utstyr eller lokale...',
 *     },
 *   ]}
 * />
 * ```
 */
export function GuidelinesTab({
  sections,
  className,
}: GuidelinesTabProps): React.ReactElement {
  if (!sections.length) {
    return (
      <div className={cn('guidelines-tab', className)}>
        <Paragraph
          data-size="sm"
          style={{ color: 'var(--ds-color-neutral-text-subtle)' }}
        >
          Ingen retningslinjer tilgjengelig.
        </Paragraph>
      </div>
    );
  }

  return (
    <div className={cn('guidelines-tab', className)}>
      <div style={{ marginBottom: 'var(--ds-spacing-4)' }}>
        <Heading
          level={2}
          data-size="sm"
          style={{ margin: '0 0 var(--ds-spacing-2) 0' }}
        >
          Retningslinjer og vilkår
        </Heading>
        <Paragraph
          data-size="sm"
          style={{
            margin: 0,
            color: 'var(--ds-color-neutral-text-subtle)',
          }}
        >
          Les gjennom retningslinjene før du booker. Ved å fullføre bookingen
          aksepterer du disse vilkårene.
        </Paragraph>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
        {sections.map((section) => (
          <Details key={section.id} data-color="neutral">
            <DetailsSummary>
              <Paragraph
                data-size="sm"
                style={{
                  margin: 0,
                  fontWeight: 'var(--ds-font-weight-medium)',
                }}
              >
                {section.title}
              </Paragraph>
            </DetailsSummary>
            <DetailsContent>
              {typeof section.content === 'string' ? (
                <Paragraph
                  data-size="sm"
                  style={{
                    margin: 0,
                    color: 'var(--ds-color-neutral-text-default)',
                  }}
                >
                  {section.content}
                </Paragraph>
              ) : (
                section.content
              )}
            </DetailsContent>
          </Details>
        ))}
      </div>
    </div>
  );
}

export default GuidelinesTab;
