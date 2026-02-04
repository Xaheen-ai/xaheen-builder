/**
 * Listing Wizard
 * Multi-step form for creating and editing listings
 */

import { useState } from 'react';
import { Button, Heading, Paragraph, Spinner } from '@xaheen/ds';
import { useListingWizard } from '../../hooks/useListingWizard';
import { WizardStepper } from './WizardStepper';
import { BasicsStep } from './steps/BasicsStep';
import { LocationStep } from './steps/LocationStep';
import { CapacityStep } from './steps/CapacityStep';
import { ContentStep } from './steps/ContentStep';
import { OpeningHoursStep } from './steps/OpeningHoursStep';
import { BookingConfigStep } from './steps/BookingConfigStep';
import { MediaStep } from './steps/MediaStep';
import { ReviewStep } from './steps/ReviewStep';
import type { ListingType } from '@xaheen/sdk';

export interface ListingWizardProps {
  /** Listing slug for edit mode */
  slug?: string | undefined;
  /** Initial type for create mode */
  initialType?: ListingType | undefined;
}

export function ListingWizard({ slug, initialType }: ListingWizardProps) {
  // All hooks must be called before any early returns
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const wizard = useListingWizard({
    slug,
    initialType,
  });

  const {
    currentStep,
    steps,
    formData,
    errors,
    isLoading,
    isSaving,
    isEditMode,
    goToStep,
    nextStep,
    prevStep,
    canGoNext,
    canGoPrev,
    isLastStep,
    updateFormData,
    saveDraft,
    cancel,
  } = wizard;

  // Loading state
  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--ds-spacing-10)',
          gap: 'var(--ds-spacing-4)',
        }}
      >
        <Spinner aria-label="Laster..." />
        <Paragraph>Laster utleieobjekt...</Paragraph>
      </div>
    );
  }

  // Get current step component
  const currentStepId = steps[currentStep]?.id || 'basics';
  const stepErrors = currentStepId ? (errors[currentStepId] || []) : [];

  const renderStep = () => {
    switch (currentStepId) {
      case 'basics':
        return <BasicsStep data={formData} onChange={updateFormData} errors={stepErrors} />;
      case 'location':
        return <LocationStep data={formData} onChange={updateFormData} errors={stepErrors} />;
      case 'capacity':
        return <CapacityStep data={formData} onChange={updateFormData} errors={stepErrors} />;
      case 'content':
        return <ContentStep data={formData} onChange={updateFormData} errors={stepErrors} />;
      case 'openingHours':
        return <OpeningHoursStep data={formData} onChange={updateFormData} errors={stepErrors} />;
      case 'bookingConfig':
        return <BookingConfigStep data={formData} onChange={updateFormData} errors={stepErrors} />;
      case 'media':
        return <MediaStep data={formData} onChange={updateFormData} errors={stepErrors} />;
      case 'review':
        return <ReviewStep data={formData} onChange={updateFormData} errors={stepErrors} />;
      default:
        return (
          <div style={{ padding: 'var(--ds-spacing-6)', textAlign: 'center' }}>
            <Paragraph>Ukjent steg: {currentStepId}</Paragraph>
          </div>
        );
    }
  };

  const handleSaveDraft = async () => {
    setSaveStatus('idle');
    try {
      await saveDraft();
      setSaveStatus('success');
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Failed to save draft:', error);
      setSaveStatus('error');
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Page header */}
      <div style={{ marginBottom: 'var(--ds-spacing-6)' }}>
        <Heading level={1} data-size="lg" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
          {isEditMode ? 'Rediger utleieobjekt' : 'Opprett nytt utleieobjekt'}
        </Heading>
        <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          {isEditMode
            ? 'Gjør endringer i utleieobjektet og lagre'
            : 'Fyll ut informasjon om utleieobjektet. Du kan lagre som utkast og fortsette senere.'}
        </Paragraph>
      </div>

      {/* Stepper */}
      <div style={{ marginBottom: 'var(--ds-spacing-6)' }}>
        <WizardStepper
          steps={steps}
          currentStep={currentStep}
          onStepClick={goToStep}
          title={isEditMode ? 'Rediger utleieobjekt' : 'Opprett utleieobjekt'}
          errors={errors}
        />
      </div>

      {/* Step content */}
      <div
        style={{
          backgroundColor: 'var(--ds-color-neutral-background-default)',
          borderRadius: 'var(--ds-border-radius-lg)',
          border: '1px solid var(--ds-color-neutral-border-subtle)',
          padding: 'var(--ds-spacing-6)',
          marginBottom: 'var(--ds-spacing-6)',
        }}
      >
        {renderStep()}
      </div>

      {/* Save status notification */}
      {saveStatus !== 'idle' && (
        <div
          style={{
            padding: 'var(--ds-spacing-3)',
            marginBottom: 'var(--ds-spacing-4)',
            borderRadius: 'var(--ds-border-radius-md)',
            backgroundColor: saveStatus === 'success'
              ? 'var(--ds-color-success-surface-default)'
              : 'var(--ds-color-danger-surface-default)',
            border: `1px solid ${saveStatus === 'success'
              ? 'var(--ds-color-success-border-default)'
              : 'var(--ds-color-danger-border-default)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--ds-spacing-2)',
          }}
        >
          <span style={{ fontSize: 'var(--ds-font-size-heading-sm)' }}>{saveStatus === 'success' ? '✓' : '✕'}</span>
          <Paragraph
            data-size="sm"
            style={{
              margin: 0,
              color: saveStatus === 'success'
                ? 'var(--ds-color-success-text-default)'
                : 'var(--ds-color-danger-text-default)',
            }}
          >
            {saveStatus === 'success'
              ? 'Endringene er lagret'
              : 'Kunne ikke lagre. Prøv igjen.'}
          </Paragraph>
        </div>
      )}

      {/* Navigation */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 'var(--ds-spacing-4)',
          backgroundColor: 'var(--ds-color-neutral-surface-default)',
          borderRadius: 'var(--ds-border-radius-lg)',
          border: '1px solid var(--ds-color-neutral-border-subtle)',
        }}
      >
        {/* Left side - Cancel */}
        <Button type="button" variant="tertiary" onClick={cancel} disabled={isSaving}>
          Avbryt
        </Button>

        {/* Center - Save draft */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
          <Button type="button" variant="secondary" onClick={handleSaveDraft} disabled={isSaving}>
            {isSaving ? 'Lagrer...' : 'Lagre utkast'}
          </Button>
        </div>

        {/* Right side - Navigation */}
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
          {canGoPrev && (
            <Button type="button" variant="secondary" onClick={prevStep} disabled={isSaving}>
              ← Forrige
            </Button>
          )}
          {canGoNext && (
            <Button type="button" variant="primary" onClick={nextStep} disabled={isSaving}>
              Neste →
            </Button>
          )}
          {isLastStep && (
            <Button type="button" variant="primary" onClick={handleSaveDraft} disabled={isSaving}>
              {isSaving ? 'Lagrer...' : 'Fullfør'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
