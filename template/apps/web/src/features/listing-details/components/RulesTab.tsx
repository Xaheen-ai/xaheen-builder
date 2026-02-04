/**
 * RulesTab Component
 *
 * Displays listing rules and regulations as cards with colored icons.
 * Matches Digilist design with category badges.
 */

import * as React from 'react';
import { Heading, Paragraph } from '@xaheen/ds';
import type { Rule, ListingType } from '../types';
import { createPresenter } from '../presenters/listingTypePresenter';

// =============================================================================
// Icons
// =============================================================================

function LockIcon({ size = 20 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function SparklesIcon({ size = 20 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
      <path d="M5 19l1 3 1-3 3-1-3-1-1-3-1 3-3 1 3 1z" />
    </svg>
  );
}

function UtensilsIcon({ size = 20 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
  );
}

function WrenchIcon({ size = 20 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

function CalendarIcon({ size = 20 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ShieldIcon({ size = 20 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function VolumeOffIcon({ size = 20 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

function AlertCircleIcon({ size = 20 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

// =============================================================================
// Category Configuration
// =============================================================================

interface CategoryConfig {
  icon: React.ComponentType<{ size?: number }>;
  bgColor: string;
  iconColor: string;
  label: string;
}

const categoryConfigs: Record<string, CategoryConfig> = {
  safety: {
    icon: LockIcon,
    bgColor: '#FEE2E2',
    iconColor: '#DC2626',
    label: 'Sikkerhet',
  },
  cleaning: {
    icon: SparklesIcon,
    bgColor: '#DBEAFE',
    iconColor: '#2563EB',
    label: 'Renhold',
  },
  food: {
    icon: UtensilsIcon,
    bgColor: '#FEF3C7',
    iconColor: '#D97706',
    label: 'Mat og drikke',
  },
  noise: {
    icon: VolumeOffIcon,
    bgColor: '#F3E8FF',
    iconColor: '#9333EA',
    label: 'Støy',
  },
  cancellation: {
    icon: CalendarIcon,
    bgColor: '#DBEAFE',
    iconColor: '#2563EB',
    label: 'Booking',
  },
  equipment: {
    icon: WrenchIcon,
    bgColor: '#D1FAE5',
    iconColor: '#059669',
    label: 'Utstyr og inventar',
  },
  general: {
    icon: AlertCircleIcon,
    bgColor: '#F3F4F6',
    iconColor: '#6B7280',
    label: 'Generelt',
  },
  other: {
    icon: ShieldIcon,
    bgColor: '#F3F4F6',
    iconColor: '#6B7280',
    label: 'Annet',
  },
};

// Helper to detect category from rule title/content
function detectCategory(rule: Rule): string {
  const text = `${rule.title} ${rule.content}`.toLowerCase();

  if (text.includes('lås') || text.includes('sikkerhet') || text.includes('nødutgang') || text.includes('brann')) return 'safety';
  if (text.includes('rydde') || text.includes('renhold') || text.includes('rengjør') || text.includes('søppel')) return 'cleaning';
  if (text.includes('mat') || text.includes('drikke') || text.includes('spise')) return 'food';
  if (text.includes('støy') || text.includes('musikk') || text.includes('ro')) return 'noise';
  if (text.includes('avbestill') || text.includes('kanseller') || text.includes('booking')) return 'cancellation';
  if (text.includes('utstyr') || text.includes('inventar') || text.includes('behandl')) return 'equipment';

  return rule.category || 'general';
}

// Check if rule is required
function isRequired(rule: Rule): boolean {
  const text = `${rule.title} ${rule.content}`.toLowerCase();
  return text.includes('må') || text.includes('påkrevd') || text.includes('skal') ||
         text.includes('senest') || text.includes('alltid') || rule.category === 'safety' ||
         rule.category === 'cancellation';
}

// =============================================================================
// Props
// =============================================================================

export interface RulesTabProps {
  rules: Rule[];
  listingType: ListingType;
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function RulesTab({
  rules,
  listingType,
  className,
}: RulesTabProps): React.ReactElement {
  const presenter = React.useMemo(() => createPresenter(listingType), [listingType]);

  if (rules.length === 0) {
    return (
      <div
        className={className}
        style={{
          textAlign: 'center',
          padding: 'var(--ds-spacing-8)',
          color: 'var(--ds-color-neutral-text-subtle)',
        }}
      >
        <AlertCircleIcon size={32} />
        <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-4)', fontStyle: 'italic' }}>
          {presenter.getEmptyState('rules')}
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
        Regler og retningslinjer
      </Heading>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
        {rules.map((rule: Rule) => {
          const category = detectCategory(rule);
          const config = categoryConfigs[category] ?? categoryConfigs.general ?? {
            icon: AlertCircleIcon,
            bgColor: '#F3F4F6',
            iconColor: '#6B7280',
            label: 'Generelt',
          };
          const IconComponent = config.icon;
          const required = isRequired(rule);

          return (
            <div
              key={rule.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--ds-spacing-4)',
                padding: 'var(--ds-spacing-4)',
                backgroundColor: 'var(--ds-color-neutral-background-default)',
                borderRadius: 'var(--ds-border-radius-lg)',
                border: '1px solid var(--ds-color-neutral-border-subtle)',
              }}
            >
              {/* Icon circle */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--ds-border-radius-full)',
                  backgroundColor: config.bgColor,
                  color: config.iconColor,
                  flexShrink: 0,
                }}
              >
                <IconComponent size={22} />
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', flexWrap: 'wrap' }}>
                  <Paragraph
                    data-size="sm"
                    style={{
                      margin: 0,
                      fontWeight: 'var(--ds-font-weight-medium)',
                      color: 'var(--ds-color-neutral-text-default)',
                    }}
                  >
                    {rule.title}
                  </Paragraph>
                  {required && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
                        backgroundColor: 'var(--ds-color-neutral-surface-default)',
                        border: '1px solid var(--ds-color-neutral-border-default)',
                        borderRadius: 'var(--ds-border-radius-full)',
                        fontSize: 'var(--ds-font-size-xs)',
                        color: 'var(--ds-color-neutral-text-subtle)',
                        fontWeight: 'var(--ds-font-weight-medium)',
                      }}
                    >
                      Påkrevd
                    </span>
                  )}
                </div>
                <Paragraph
                  data-size="xs"
                  style={{
                    margin: 0,
                    marginTop: 'var(--ds-spacing-1)',
                    color: 'var(--ds-color-neutral-text-subtle)',
                  }}
                >
                  {rule.content || config.label}
                </Paragraph>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RulesTab;
