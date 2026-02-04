/**
 * PriceSummaryCard
 *
 * A card showing price summary for bookings with calculation breakdown.
 */
import * as React from 'react';
import { Heading, Paragraph } from '@digdir/designsystemet-react';
import { cn } from '../utils';

export interface PriceLineItem {
  /** Label for the line item */
  label: string;
  /** Quantity (e.g., number of hours) */
  quantity?: number;
  /** Unit price */
  unitPrice?: number;
  /** Total for this line */
  total: number;
  /** Whether this is a discount (shown in green, subtracted) */
  isDiscount?: boolean;
}

export interface PriceSummaryCardProps {
  /** Title of the card */
  title?: string;
  /** Base price per unit */
  basePrice: number;
  /** Price unit (e.g., 'time', 'dag') */
  priceUnit?: string;
  /** Currency code */
  currency?: string;
  /** Line items for breakdown */
  lineItems?: PriceLineItem[];
  /** Total price */
  total: number;
  /** Whether to show VAT info */
  showVat?: boolean;
  /** VAT percentage */
  vatPercentage?: number;
  /** Custom class name */
  className?: string;
  /** CTA button text */
  ctaText?: string;
  /** CTA button handler */
  onCtaClick?: () => void;
  /** Whether CTA is disabled */
  ctaDisabled?: boolean;
}

/**
 * PriceSummaryCard component
 *
 * @example
 * ```tsx
 * <PriceSummaryCard
 *   basePrice={450}
 *   priceUnit="time"
 *   lineItems={[
 *     { label: 'Møterom booking', quantity: 3, unitPrice: 450, total: 1350 },
 *     { label: 'Catering', total: 250 },
 *   ]}
 *   total={1600}
 *   ctaText="Bestill nå"
 *   onCtaClick={() => {}}
 * />
 * ```
 */
export function PriceSummaryCard({
  title = 'Prissammendrag',
  basePrice,
  priceUnit = 'time',
  currency = 'kr',
  lineItems = [],
  total,
  showVat = true,
  vatPercentage = 25,
  className,
  ctaText,
  onCtaClick,
  ctaDisabled = false,
}: PriceSummaryCardProps): React.ReactElement {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('nb-NO').format(price);
  };

  return (
    <div
      className={cn('price-summary-card', className)}
      style={{
        backgroundColor: 'var(--ds-color-neutral-surface-default)',
        border: '1px solid var(--ds-color-neutral-border-subtle)',
        borderRadius: 'var(--ds-border-radius-lg)',
        overflow: 'hidden',
      }}
    >
      {/* Header with base price */}
      <div
        style={{
          padding: 'var(--ds-spacing-4)',
          borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
          background: 'linear-gradient(135deg, var(--ds-color-accent-surface-default) 0%, var(--ds-color-accent-surface-hover) 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--ds-spacing-2)' }}>
          <Heading level={3} data-size="lg" style={{ margin: 0, color: 'var(--ds-color-accent-text-default)' }}>
            {formatPrice(basePrice)} {currency}
          </Heading>
          <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-accent-text-subtle)' }}>
            / {priceUnit}
          </Paragraph>
        </div>
      </div>

      {/* Line items breakdown */}
      {lineItems.length > 0 && (
        <div
          style={{
            padding: 'var(--ds-spacing-4)',
            borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
          }}
        >
          <Paragraph
            data-size="xs"
            style={{
              margin: 0,
              marginBottom: 'var(--ds-spacing-3)',
              color: 'var(--ds-color-neutral-text-subtle)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: 'var(--ds-font-weight-medium)',
            }}
          >
            {title}
          </Paragraph>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
            {lineItems.map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-default)' }}>
                  {item.label}
                  {item.quantity && item.unitPrice && (
                    <span style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                      {' '}({item.quantity} × {formatPrice(item.unitPrice)} {currency})
                    </span>
                  )}
                </Paragraph>
                <Paragraph
                  data-size="sm"
                  style={{
                    margin: 0,
                    fontWeight: 'var(--ds-font-weight-medium)',
                    color: item.isDiscount
                      ? 'var(--ds-color-success-text-default)'
                      : 'var(--ds-color-neutral-text-default)',
                  }}
                >
                  {item.isDiscount ? '-' : ''}{formatPrice(item.total)} {currency}
                </Paragraph>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Total section */}
      <div
        style={{
          padding: 'var(--ds-spacing-4)',
          backgroundColor: 'var(--ds-color-neutral-surface-hover)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Paragraph
            data-size="md"
            style={{
              margin: 0,
              fontWeight: 'var(--ds-font-weight-semibold)',
              color: 'var(--ds-color-neutral-text-default)',
            }}
          >
            Total
          </Paragraph>
          <Heading level={4} data-size="md" style={{ margin: 0, color: 'var(--ds-color-neutral-text-default)' }}>
            {formatPrice(total)} {currency}
          </Heading>
        </div>
        {showVat && (
          <Paragraph
            data-size="xs"
            style={{
              margin: 0,
              marginTop: 'var(--ds-spacing-1)',
              color: 'var(--ds-color-neutral-text-subtle)',
              textAlign: 'right',
            }}
          >
            Inkl. {vatPercentage}% MVA
          </Paragraph>
        )}
      </div>

      {/* CTA Button */}
      {ctaText && onCtaClick && (
        <div style={{ padding: 'var(--ds-spacing-4)', paddingTop: 0 }}>
          <button
            type="button"
            onClick={onCtaClick}
            disabled={ctaDisabled}
            style={{
              width: '100%',
              padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
              backgroundColor: ctaDisabled
                ? 'var(--ds-color-neutral-surface-hover)'
                : 'var(--ds-color-accent-base-default)',
              color: ctaDisabled
                ? 'var(--ds-color-neutral-text-subtle)'
                : 'var(--ds-color-accent-contrast-default)',
              border: 'none',
              borderRadius: 'var(--ds-border-radius-md)',
              fontSize: 'var(--ds-font-size-md)',
              fontWeight: 'var(--ds-font-weight-semibold)',
              cursor: ctaDisabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!ctaDisabled) {
                e.currentTarget.style.backgroundColor = 'var(--ds-color-accent-base-hover)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = 'var(--ds-shadow-md)';
              }
            }}
            onMouseLeave={(e) => {
              if (!ctaDisabled) {
                e.currentTarget.style.backgroundColor = 'var(--ds-color-accent-base-default)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            {ctaText}
          </button>
        </div>
      )}
    </div>
  );
}

export default PriceSummaryCard;
