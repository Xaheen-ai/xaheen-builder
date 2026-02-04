/**
 * BookingStepperHeader Component
 * Displays the current step in the booking flow with pill-style tab indicators
 * Matches the main page tabs layout
 */

import * as React from 'react';

export interface BookingStep {
  id: string;
  label: string;
  icon?: 'calendar' | 'pricing' | 'confirm' | 'success';
}

export interface BookingStepperHeaderProps {
  steps: BookingStep[];
  currentStep: number;
  listingTitle?: string;
  isMobile?: boolean;
  onStepClick?: (stepIndex: number) => void;
}

export function BookingStepperHeader({
  steps,
  currentStep,
  listingTitle: _listingTitle,
  isMobile = false,
  onStepClick,
}: BookingStepperHeaderProps): React.ReactElement {
  return (
    <div
      className="booking-tabs-container"
      style={{
        backgroundColor: 'var(--ds-color-neutral-surface-default)',
        borderRadius: 'var(--ds-border-radius-lg)',
        padding: 'var(--ds-spacing-1)',
        border: '1px solid var(--ds-color-neutral-border-subtle)',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <div
        role="tablist"
        aria-label="Booking steps"
        style={{
          display: 'flex',
          gap: 'var(--ds-spacing-1)',
          minWidth: 'max-content',
        }}
      >
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const isClickable = index <= currentStep;

          return (
            <button
              key={step.id}
              type="button"
              role="tab"
              id={`booking-tab-${step.id}`}
              aria-selected={isActive}
              disabled={!isClickable}
              onClick={() => isClickable && onStepClick?.(index)}
              className="booking-tab-button"
              style={{
                flex: 1,
                minWidth: isMobile ? '60px' : '80px',
                padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
                borderRadius: 'var(--ds-border-radius-md)',
                border: 'none',
                cursor: isClickable ? 'pointer' : 'default',
                fontSize: 'var(--ds-font-size-sm)',
                fontWeight: isActive ? 'var(--ds-font-weight-semibold)' : 'var(--ds-font-weight-medium)',
                transition: 'all 0.2s ease',
                backgroundColor: isActive
                  ? '#1E3A5F'
                  : isCompleted
                    ? 'rgba(30, 58, 95, 0.5)'
                    : 'transparent',
                color: isActive
                  ? 'white'
                  : isCompleted
                    ? 'rgba(255, 255, 255, 0.8)'
                    : '#64748B',
                textAlign: 'center',
                boxShadow: isActive ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--ds-spacing-2)',
                opacity: !isClickable ? 0.5 : 1,
              }}
            >
              {/* Step number badge */}
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '20px',
                  height: '20px',
                  borderRadius: 'var(--ds-border-radius-full)',
                  backgroundColor: isActive || isCompleted
                    ? 'rgba(255, 255, 255, 0.2)'
                    : 'rgba(100, 116, 139, 0.2)',
                  color: isActive || isCompleted
                    ? 'white'
                    : '#64748B',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                }}
              >
                {isCompleted ? '✓' : index + 1}
              </span>
              {/* Label - show on desktop, hide on mobile */}
              {!isMobile && step.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
