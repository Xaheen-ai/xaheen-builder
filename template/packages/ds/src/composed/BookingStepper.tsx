/**
 * BookingStepper
 *
 * Horizontal step indicator for booking flow.
 * Shows progress through booking steps with icons and connecting lines.
 * Supports completed, active, and future step states.
 */
import * as React from 'react';
import { Heading, Paragraph } from '@digdir/designsystemet-react';
import { cn } from '../utils';
import { CheckIcon } from '../primitives/icons';
import type { BookingStep } from '../types/listing-detail';

export interface BookingStepperProps {
  /** Array of booking steps */
  steps: BookingStep[];
  /** Current step index (0-based) */
  currentStep: number;
  /** Callback when a step is clicked */
  onStepClick?: (stepIndex: number) => void;
  /** Title shown above the stepper */
  title?: string;
  /** Whether to show the step counter */
  showStepCounter?: boolean;
  /** Custom class name */
  className?: string;
}

// =============================================================================
// Step Icons
// =============================================================================

function CalendarStepIcon({ size = 20 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function DetailsStepIcon({ size = 20 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function ConfirmStepIcon({ size = 20 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function SendStepIcon({ size = 20 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function DoneStepIcon({ size = 20 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

// Map step IDs to icons
function getStepIcon(stepId: string, size: number = 20): React.ReactElement | null {
  switch (stepId) {
    case 'select':
    case 'date':
    case 'time':
      return <CalendarStepIcon size={size} />;
    case 'details':
    case 'info':
      return <DetailsStepIcon size={size} />;
    case 'confirm':
    case 'review':
      return <ConfirmStepIcon size={size} />;
    case 'send':
    case 'submit':
      return <SendStepIcon size={size} />;
    case 'done':
    case 'complete':
      return <DoneStepIcon size={size} />;
    default:
      return null;
  }
}

// =============================================================================
// Styles
// =============================================================================

const stepperStyles = {
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
  circle: (state: 'completed' | 'active' | 'future') => ({
    width: '48px',
    height: '48px',
    borderRadius: 'var(--ds-border-radius-full)',
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor:
      state === 'active'
        ? '#1E3A5F'
        : state === 'completed'
        ? '#ECFDF5'
        : '#F5F7FA',
    color:
      state === 'active'
        ? '#FFFFFF'
        : state === 'completed'
        ? '#059669'
        : '#94A3B8',
    border:
      state === 'active'
        ? '2px solid #1E3A5F'
        : state === 'completed'
        ? '2px solid #A7F3D0'
        : '2px solid #E2E8F0',
    transition: 'all 0.3s ease',
    boxShadow:
      state === 'active'
        ? '0 4px 12px rgba(30, 58, 95, 0.25)'
        : state === 'completed'
        ? '0 2px 6px rgba(5, 150, 105, 0.15)'
        : 'none',
    fontWeight: 600,
    fontSize: 'var(--ds-font-size-sm)',
  }),
  label: (state: 'completed' | 'active' | 'future') => ({
    margin: 0,
    color:
      state === 'active'
        ? '#1E3A5F'
        : state === 'completed'
        ? '#059669'
        : '#94A3B8',
    fontWeight:
      state === 'active'
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
        ? '#A7F3D0'
        : '#E2E8F0',
    marginTop: '24px',
    marginLeft: 'var(--ds-spacing-2)',
    marginRight: 'var(--ds-spacing-2)',
    borderRadius: 'var(--ds-border-radius-full)',
    transition: 'background-color 0.3s ease',
  }),
};

// =============================================================================
// Component
// =============================================================================

/**
 * BookingStepper component
 *
 * @example
 * ```tsx
 * <BookingStepper
 *   steps={[
 *     { id: 'select', label: 'Velg tidspunkter' },
 *     { id: 'details', label: 'Detaljer og vilkår' },
 *     { id: 'confirm', label: 'Bekreft' },
 *     { id: 'send', label: 'Send forespørsel' },
 *   ]}
 *   currentStep={1}
 *   onStepClick={(index) => setCurrentStep(index)}
 * />
 * ```
 */
export function BookingStepper({
  steps,
  currentStep,
  onStepClick,
  title = 'Bookingprosess',
  showStepCounter = true,
  className,
}: BookingStepperProps): React.ReactElement {
  const getStepState = (index: number): 'completed' | 'active' | 'future' => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'active';
    return 'future';
  };

  return (
    <div className={cn('booking-stepper', className)} style={stepperStyles.container}>
      {/* Header with title and step counter */}
      <div style={stepperStyles.header}>
        <Heading level={3} data-size="xs" style={{ margin: 0 }}>
          {title}
        </Heading>
        {showStepCounter && (
          <Paragraph
            data-size="sm"
            style={{
              margin: 0,
              color: '#64748B',
              backgroundColor: '#F1F5F9',
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
      <div style={stepperStyles.stepsContainer}>
        {steps.map((step, index) => {
          const state = getStepState(index);
          const isLast = index === steps.length - 1;
          const isClickable = onStepClick && index < currentStep;
          const icon = getStepIcon(step.id);

          return (
            <div
              key={step.id}
              className="booking-stepper-step"
              style={stepperStyles.stepWrapper(isLast)}
            >
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
                style={stepperStyles.stepButton(!!isClickable)}
              >
                {/* Circle with icon or number */}
                <div
                  className="booking-stepper-circle"
                  data-state={state}
                  style={stepperStyles.circle(state)}
                >
                  {state === 'completed' ? (
                    <CheckIcon size={22} />
                  ) : icon ? (
                    icon
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                {/* Label */}
                <Paragraph
                  data-size="xs"
                  style={stepperStyles.label(state)}
                >
                  {step.label}
                </Paragraph>
              </div>

              {/* Connecting line */}
              {!isLast && (
                <div
                  className="booking-stepper-line"
                  style={stepperStyles.line(state)}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BookingStepper;
