/**
 * AdditionalServicesList
 *
 * Professional list of add-on services with elegant cards.
 * Services can be selectable for booking.
 */
import * as React from 'react';
import { Paragraph } from '@digdir/designsystemet-react';
import { cn } from '../utils';
import type { AdditionalService } from '../types/listing-detail';

export interface AdditionalServicesListProps {
  /** Array of additional services */
  services: AdditionalService[];
  /** Currently selected service IDs */
  selectedServices?: string[];
  /** Callback when a service is selected/deselected */
  onServiceSelect?: (id: string, selected: boolean) => void;
  /** Title for the section (set to empty string to hide) */
  title?: string;
  /** Whether to show prices */
  showPrices?: boolean;
  /** Custom class name */
  className?: string;
}

// Service icons based on name
function CateringIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
      <path d="M6 1v3" />
      <path d="M10 1v3" />
      <path d="M14 1v3" />
    </svg>
  );
}

function ParkingIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
    </svg>
  );
}

function TechSupportIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

function DefaultServiceIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  );
}

const serviceIconMap: Record<string, React.FC<{ size?: number }>> = {
  catering: CateringIcon,
  mat: CateringIcon,
  lunsj: CateringIcon,
  parkering: ParkingIcon,
  teknisk: TechSupportIcon,
  support: TechSupportIcon,
  hjelp: TechSupportIcon,
};

function getServiceIcon(name: string): React.FC<{ size?: number }> {
  const normalizedName = name.toLowerCase();
  for (const [key, IconComponent] of Object.entries(serviceIconMap)) {
    if (normalizedName.includes(key)) {
      return IconComponent;
    }
  }
  return DefaultServiceIcon;
}

/**
 * AdditionalServicesList component
 *
 * @example
 * ```tsx
 * <AdditionalServicesList
 *   services={[
 *     { id: '1', name: 'Ekstra tid', description: 'Forleng bookingen med 30 minutter', price: 200 },
 *     { id: '2', name: 'Utstyr', description: 'Inkluderer ballnett, musikanlegg og annet utstyr', price: 150 },
 *   ]}
 *   selectedServices={['1']}
 *   onServiceSelect={(id, selected) => console.log(id, selected)}
 * />
 * ```
 */
export function AdditionalServicesList({
  services,
  selectedServices = [],
  onServiceSelect,
  title,
  showPrices = true,
  className,
}: AdditionalServicesListProps): React.ReactElement {
  const handleClick = (service: AdditionalService) => {
    if (!onServiceSelect) return;
    const isSelected = selectedServices.includes(service.id);
    onServiceSelect(service.id, !isSelected);
  };

  return (
    <div className={cn('additional-services-list', className)}>
      {title && (
        <Paragraph
          data-size="xs"
          style={{
            margin: '0 0 var(--ds-spacing-3) 0',
            color: 'var(--ds-color-neutral-text-subtle)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: 'var(--ds-font-weight-medium)',
          }}
        >
          {title}
        </Paragraph>
      )}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--ds-spacing-3)',
        }}
      >
        {services.map((service) => {
          const isSelected = selectedServices.includes(service.id);
          const isClickable = !!onServiceSelect;
          const IconComponent = getServiceIcon(service.name);

          return (
            <div
              key={service.id}
              className="service-card"
              onClick={() => handleClick(service)}
              role={isClickable ? 'button' : undefined}
              tabIndex={isClickable ? 0 : undefined}
              onKeyDown={
                isClickable
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleClick(service);
                      }
                    }
                  : undefined
              }
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-4)',
                padding: 'var(--ds-spacing-4)',
                backgroundColor: isSelected
                  ? 'var(--ds-color-accent-surface-default)'
                  : 'var(--ds-color-neutral-background-default)',
                border: `2px solid ${
                  isSelected
                    ? 'var(--ds-color-accent-base-default)'
                    : 'var(--ds-color-neutral-border-subtle)'
                }`,
                borderRadius: 'var(--ds-border-radius-lg)',
                cursor: isClickable ? 'pointer' : 'default',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Selection indicator */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '4px',
                  height: '100%',
                  backgroundColor: isSelected
                    ? 'var(--ds-color-accent-base-default)'
                    : 'transparent',
                  transition: 'background-color 0.2s ease',
                }}
              />

              {/* Icon */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '44px',
                  height: '44px',
                  backgroundColor: isSelected
                    ? 'var(--ds-color-accent-base-default)'
                    : 'var(--ds-color-neutral-surface-default)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  color: isSelected
                    ? 'white'
                    : 'var(--ds-color-accent-base-default)',
                  flexShrink: 0,
                  transition: 'all 0.2s ease',
                }}
              >
                <IconComponent size={22} />
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <Paragraph
                  data-size="sm"
                  style={{
                    margin: 0,
                    fontWeight: 'var(--ds-font-weight-semibold)',
                    color: isSelected
                      ? 'var(--ds-color-accent-text-default)'
                      : 'var(--ds-color-neutral-text-default)',
                  }}
                >
                  {service.name}
                </Paragraph>
                {service.description && (
                  <Paragraph
                    data-size="xs"
                    style={{
                      margin: 'var(--ds-spacing-1) 0 0 0',
                      color: 'var(--ds-color-neutral-text-subtle)',
                    }}
                  >
                    {service.description}
                  </Paragraph>
                )}
              </div>

              {/* Price badge */}
              {showPrices && service.price !== undefined && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: 'var(--ds-font-size-lg)',
                      fontWeight: 'var(--ds-font-weight-bold)',
                      color: isSelected
                        ? 'var(--ds-color-accent-base-default)'
                        : 'var(--ds-color-neutral-text-default)',
                      lineHeight: 1.2,
                    }}
                  >
                    +{service.price}
                  </span>
                  <span
                    style={{
                      fontSize: 'var(--ds-font-size-xs)',
                      color: 'var(--ds-color-neutral-text-subtle)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {service.currency || 'NOK'}
                  </span>
                </div>
              )}

              {/* Checkbox indicator */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  borderRadius: 'var(--ds-border-radius-sm)',
                  border: `2px solid ${
                    isSelected
                      ? 'var(--ds-color-accent-base-default)'
                      : 'var(--ds-color-neutral-border-default)'
                  }`,
                  backgroundColor: isSelected
                    ? 'var(--ds-color-accent-base-default)'
                    : 'transparent',
                  color: 'white',
                  flexShrink: 0,
                  transition: 'all 0.2s ease',
                }}
              >
                {isSelected && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AdditionalServicesList;
