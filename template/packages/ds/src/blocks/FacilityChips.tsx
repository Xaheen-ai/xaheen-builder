/**
 * FacilityChips
 *
 * Professional grid of facility cards with icons.
 * Used to display available facilities for a listing.
 */
import * as React from 'react';
import { cn } from '../utils';
import type { Facility } from '../types/listing-detail';

export interface FacilityChipsProps {
  /** Array of facilities to display */
  facilities: Facility[];
  /** Maximum number of visible facilities */
  maxVisible?: number;
  /** Label for "show more" button */
  showMoreLabel?: string;
  /** Callback when "show more" is clicked */
  onShowMore?: () => void;
  /** Custom class name */
  className?: string;
}

// Enhanced icon components for facilities
function ProjectorIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="6" cy="12" r="2" />
      <line x1="10" y1="12" x2="18" y2="12" />
    </svg>
  );
}

function BoardIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="8" y1="8" x2="16" y2="8" />
      <line x1="8" y1="12" x2="14" y2="12" />
    </svg>
  );
}

function WifiIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.55a11 11 0 0 1 14.08 0" />
      <path d="M1.42 9a16 16 0 0 1 21.16 0" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <circle cx="12" cy="20" r="1" fill="currentColor" />
    </svg>
  );
}

function VideoIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" />
    </svg>
  );
}

function CoffeeIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 8h1a4 4 0 0 1 0 8h-1" />
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" />
      <path d="M6 2v2" />
      <path d="M10 2v2" />
      <path d="M14 2v2" />
    </svg>
  );
}

function AirConditionerIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="8" rx="2" />
      <path d="M6 16v2" />
      <path d="M10 16v4" />
      <path d="M14 16v2" />
      <path d="M18 16v4" />
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

function AccessibilityIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="4" r="2" />
      <path d="M12 6v6" />
      <path d="M8 8h8" />
      <path d="M8 20l4-8 4 8" />
    </svg>
  );
}

function KitchenIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
  );
}

function DefaultIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4l2 2" />
    </svg>
  );
}

// Map of facility labels to icons
const facilityIconMap: Record<string, React.FC<{ size?: number }>> = {
  projektor: ProjectorIcon,
  tavle: BoardIcon,
  whiteboard: BoardIcon,
  wifi: WifiIcon,
  videokonferanse: VideoIcon,
  video: VideoIcon,
  kaffe: CoffeeIcon,
  kaffemaskin: CoffeeIcon,
  te: CoffeeIcon,
  klima: AirConditionerIcon,
  klimaanlegg: AirConditionerIcon,
  aircondition: AirConditionerIcon,
  parkering: ParkingIcon,
  hc: AccessibilityIcon,
  rullestol: AccessibilityIcon,
  kjøkken: KitchenIcon,
  kitchen: KitchenIcon,
};

/**
 * Get icon component for a facility based on its label
 */
function getFacilityIcon(label: string): React.FC<{ size?: number }> {
  const normalizedLabel = label.toLowerCase();
  for (const [key, IconComponent] of Object.entries(facilityIconMap)) {
    if (normalizedLabel.includes(key)) {
      return IconComponent;
    }
  }
  return DefaultIcon;
}

/**
 * FacilityChips component
 *
 * @example
 * ```tsx
 * <FacilityChips
 *   facilities={[
 *     { id: '1', label: 'Projektor' },
 *     { id: '2', label: 'WiFi' },
 *   ]}
 * />
 * ```
 */
export function FacilityChips({
  facilities,
  maxVisible,
  showMoreLabel,
  onShowMore,
  className,
}: FacilityChipsProps): React.ReactElement {
  const visibleFacilities = maxVisible
    ? facilities.slice(0, maxVisible)
    : facilities;
  const hiddenCount = maxVisible
    ? Math.max(0, facilities.length - maxVisible)
    : 0;

  return (
    <div
      className={cn('facility-chips', className)}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 'var(--ds-spacing-3)',
      }}
    >
      {visibleFacilities.map((facility) => {
        const IconComponent = getFacilityIcon(facility.label);
        return (
          <div
            key={facility.id}
            className="facility-chip"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-3)',
              padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
              backgroundColor: 'var(--ds-color-neutral-background-default)',
              border: '1px solid var(--ds-color-neutral-border-subtle)',
              borderRadius: 'var(--ds-border-radius-lg)',
              transition: 'all 0.2s ease',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                backgroundColor: 'var(--ds-color-accent-surface-default)',
                borderRadius: 'var(--ds-border-radius-md)',
                color: 'var(--ds-color-accent-base-default)',
                flexShrink: 0,
              }}
            >
              <IconComponent size={18} />
            </div>
            <span
              style={{
                fontSize: 'var(--ds-font-size-sm)',
                fontWeight: 'var(--ds-font-weight-medium)',
                color: 'var(--ds-color-neutral-text-default)',
              }}
            >
              {facility.label}
            </span>
          </div>
        );
      })}
      {hiddenCount > 0 && (
        <div
          className="facility-chip facility-chip-more"
          onClick={onShowMore}
          role={onShowMore ? 'button' : undefined}
          tabIndex={onShowMore ? 0 : undefined}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--ds-spacing-2)',
            padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
            backgroundColor: 'var(--ds-color-neutral-surface-default)',
            border: '1px dashed var(--ds-color-neutral-border-default)',
            borderRadius: 'var(--ds-border-radius-lg)',
            cursor: onShowMore ? 'pointer' : 'default',
            transition: 'all 0.2s ease',
            fontSize: 'var(--ds-font-size-sm)',
            fontWeight: 'var(--ds-font-weight-medium)',
            color: 'var(--ds-color-neutral-text-subtle)',
          }}
        >
          {showMoreLabel || `+${hiddenCount} mer`}
        </div>
      )}
    </div>
  );
}

export default FacilityChips;
