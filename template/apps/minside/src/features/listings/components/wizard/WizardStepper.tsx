/**
 * Wizard Stepper
 * Horizontal step indicator for the listing wizard
 * Adapted from BookingStepper pattern
 */

import { Heading, Paragraph, CheckIcon } from '@xaheen/ds';
import type { WizardStep } from '../../types';

export interface WizardStepperProps {
  steps: WizardStep[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  title?: string;
  showStepCounter?: boolean;
  errors?: Record<string, string[]>;
}

// Step icons
function BasicsIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function LocationIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function CapacityIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ContentIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="17" y1="10" x2="3" y2="10" />
      <line x1="21" y1="6" x2="3" y2="6" />
      <line x1="21" y1="14" x2="3" y2="14" />
      <line x1="17" y1="18" x2="3" y2="18" />
    </svg>
  );
}

function ClockIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function BookingIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function MediaIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function ReviewIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function getStepIcon(stepId: string, size: number = 20) {
  switch (stepId) {
    case 'basics':
      return <BasicsIcon size={size} />;
    case 'location':
      return <LocationIcon size={size} />;
    case 'capacity':
      return <CapacityIcon size={size} />;
    case 'content':
      return <ContentIcon size={size} />;
    case 'openingHours':
      return <ClockIcon size={size} />;
    case 'bookingConfig':
      return <BookingIcon size={size} />;
    case 'media':
      return <MediaIcon size={size} />;
    case 'review':
      return <ReviewIcon size={size} />;
    default:
      return null;
  }
}

const styles = {
  container: {
    backgroundColor: 'var(--ds-color-neutral-background-default)',
    borderRadius: 'var(--ds-border-radius-lg)',
    border: '1px solid var(--ds-color-neutral-border-subtle)',
    padding: 'var(--ds-spacing-5)',
  },
  header: {
    display: 'flex' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 'var(--ds-spacing-5)',
    paddingBottom: 'var(--ds-spacing-4)',
    borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
  },
  stepsContainer: {
    display: 'flex' as const,
    alignItems: 'flex-start' as const,
  },
  stepWrapper: (isLast: boolean) => ({
    flex: isLast ? '0 0 auto' : 1,
    display: 'flex' as const,
    alignItems: 'flex-start' as const,
  }),
  stepButton: (isClickable: boolean) => ({
    display: 'flex' as const,
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    gap: 'var(--ds-spacing-2)',
    cursor: isClickable ? 'pointer' : 'default',
    minWidth: '80px',
    padding: 'var(--ds-spacing-1)',
    borderRadius: 'var(--ds-border-radius-md)',
    transition: 'background-color 0.2s ease',
    backgroundColor: 'transparent',
    border: 'none',
  }),
  circle: (state: 'completed' | 'active' | 'future' | 'error') => ({
    width: '48px',
    height: '48px',
    borderRadius: 'var(--ds-border-radius-full)',
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor:
      state === 'error'
        ? 'var(--ds-color-danger-surface-default)'
        : state === 'active'
        ? 'var(--ds-color-accent-base-default)'
        : state === 'completed'
        ? 'var(--ds-color-success-surface-default)'
        : 'var(--ds-color-neutral-surface-default)',
    color:
      state === 'error'
        ? 'var(--ds-color-danger-text-default)'
        : state === 'active'
        ? 'var(--ds-color-neutral-background-default)'
        : state === 'completed'
        ? 'var(--ds-color-success-text-default)'
        : 'var(--ds-color-neutral-text-subtle)',
    border:
      state === 'error'
        ? '2px solid var(--ds-color-danger-border-default)'
        : state === 'active'
        ? '2px solid var(--ds-color-accent-base-default)'
        : state === 'completed'
        ? '2px solid var(--ds-color-success-border-default)'
        : '2px solid var(--ds-color-neutral-border-subtle)',
    transition: 'all 0.3s ease',
    boxShadow:
      state === 'active'
        ? '0 4px 12px var(--ds-color-accent-surface-default)'
        : state === 'completed'
        ? '0 2px 6px var(--ds-color-success-surface-default)'
        : 'none',
    fontWeight: 600,
    fontSize: 'var(--ds-font-size-sm)',
  }),
  label: (state: 'completed' | 'active' | 'future' | 'error') => ({
    margin: 0,
    color:
      state === 'error'
        ? 'var(--ds-color-danger-text-default)'
        : state === 'active'
        ? 'var(--ds-color-accent-text-default)'
        : state === 'completed'
        ? 'var(--ds-color-success-text-default)'
        : 'var(--ds-color-neutral-text-subtle)',
    fontWeight:
      state === 'active' || state === 'error'
        ? 'var(--ds-font-weight-semibold)'
        : state === 'completed'
        ? 'var(--ds-font-weight-medium)'
        : 'var(--ds-font-weight-regular)',
    textAlign: 'center' as const,
    maxWidth: '90px',
    lineHeight: 1.4,
  }),
  line: (state: 'completed' | 'active' | 'future') => ({
    flex: 1,
    height: '3px',
    backgroundColor:
      state === 'completed'
        ? 'var(--ds-color-success-border-default)'
        : 'var(--ds-color-neutral-border-subtle)',
    marginTop: '24px',
    marginLeft: 'var(--ds-spacing-2)',
    marginRight: 'var(--ds-spacing-2)',
    borderRadius: 'var(--ds-border-radius-full)',
    transition: 'background-color 0.3s ease',
  }),
};

export function WizardStepper({
  steps,
  currentStep,
  onStepClick,
  title = 'Opprett utleieobjekt',
  showStepCounter = true,
  errors = {},
}: WizardStepperProps) {
  const getStepState = (index: number, stepId: string): 'completed' | 'active' | 'future' | 'error' => {
    if (errors[stepId]?.length) return 'error';
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'active';
    return 'future';
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <Heading level={3} data-size="xs" style={{ margin: 0 }}>
          {title}
        </Heading>
        {showStepCounter && (
          <Paragraph
            data-size="sm"
            style={{
              margin: 0,
              color: 'var(--ds-color-neutral-text-subtle)',
              backgroundColor: 'var(--ds-color-neutral-surface-default)',
              padding: 'var(--ds-spacing-1) var(--ds-spacing-3)',
              borderRadius: 'var(--ds-border-radius-full)',
              fontWeight: 'var(--ds-font-weight-medium)',
            }}
          >
            Steg {currentStep + 1} av {steps.length}
          </Paragraph>
        )}
      </div>

      {/* Steps */}
      <div style={styles.stepsContainer}>
        {steps.map((step, index) => {
          const state = getStepState(index, step.id);
          const isLast = index === steps.length - 1;
          const isClickable = onStepClick && index < currentStep;
          const icon = getStepIcon(step.id);

          return (
            <div key={step.id} style={styles.stepWrapper(isLast)}>
              {/* Step circle and label */}
              <div
                onClick={isClickable ? () => onStepClick(index) : undefined}
                role={isClickable ? 'button' : undefined}
                tabIndex={isClickable ? 0 : undefined}
                onKeyDown={
                  isClickable
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onStepClick(index);
                        }
                      }
                    : undefined
                }
                style={styles.stepButton(!!isClickable)}
              >
                {/* Circle with icon or number */}
                <div style={styles.circle(state === 'error' ? 'error' : state)}>
                  {state === 'completed' ? (
                    <CheckIcon size={22} />
                  ) : icon ? (
                    icon
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                {/* Label */}
                <Paragraph data-size="xs" style={styles.label(state === 'error' ? 'error' : state)}>
                  {step.labelNorwegian}
                </Paragraph>
              </div>

              {/* Connecting line */}
              {!isLast && (
                <div style={styles.line(state === 'error' ? 'future' : state)} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
