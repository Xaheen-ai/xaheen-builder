/**
 * Listing Wizard Hook
 * Manages wizard state, step navigation, and form data persistence
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useListing,
  useCreateListing,
  useUpdateListing,
} from '@xaheen/sdk';
import type { ListingType } from '@xaheen/sdk';
import type {
  WizardStepId,
  WizardStep,
  BackofficeListing,
  CreateListingDTO,
} from '../types';
import { ALL_WIZARD_STEPS, WIZARD_STEPS_BY_TYPE } from '../types';

export interface UseListingWizardOptions {
  /** Listing ID for edit mode */
  listingId?: string;
  /** Initial listing type (for create mode) */
  initialType?: ListingType;
  /** Callback when wizard completes */
  onComplete?: (listing: BackofficeListing) => void;
}

export interface UseListingWizardReturn {
  // State
  currentStep: number;
  steps: WizardStep[];
  formData: Partial<BackofficeListing>;
  errors: Record<string, string[]>;
  isDirty: boolean;
  isLoading: boolean;
  isSaving: boolean;
  isEditMode: boolean;

  // Navigation
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  isLastStep: boolean;
  isFirstStep: boolean;

  // Data management
  updateFormData: (data: Partial<BackofficeListing>) => void;
  setFieldValue: <K extends keyof BackofficeListing>(field: K, value: BackofficeListing[K]) => void;
  setErrors: (stepId: WizardStepId, errors: string[]) => void;
  clearErrors: (stepId?: WizardStepId) => void;

  // Actions
  saveDraft: () => Promise<void>;
  publish: () => Promise<void>;
  cancel: () => void;
}

const STORAGE_KEY = 'listing-wizard-draft';

function getDefaultFormData(type?: ListingType): Partial<BackofficeListing> {
  return {
    type: type || 'SPACE',
    status: 'draft',
    name: '',
    description: '',
    pricing: {
      basePrice: 0,
      currency: 'NOK',
      unit: 'hour',
    },
  };
}

export function useListingWizard(options: UseListingWizardOptions = {}): UseListingWizardReturn {
  const { listingId, initialType, onComplete } = options;
  const navigate = useNavigate();
  const isEditMode = !!listingId;

  // SDK hooks
  const { data: existingListing, isLoading: isLoadingListing } = useListing(listingId || '', {
    enabled: isEditMode,
  });
  const createMutation = useCreateListing();
  const updateMutation = useUpdateListing();

  // Local state
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<BackofficeListing>>(() => {
    // Try to restore from localStorage for create mode
    if (!isEditMode) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // Ignore parse errors
        }
      }
    }
    return getDefaultFormData(initialType);
  });
  const [errors, setErrorsState] = useState<Record<string, string[]>>({});
  const [isDirty, setIsDirty] = useState(false);

  // Load existing listing data in edit mode
  useEffect(() => {
    if (isEditMode && existingListing?.data) {
      const listing = existingListing.data;
      setFormData({
        id: listing.id,
        name: listing.name,
        slug: listing.slug,
        type: listing.type,
        status: listing.status,
        description: listing.description,
        images: listing.images,
        capacity: listing.capacity,
        pricing: listing.pricing,
        location: listing.metadata?.location,
        content: {
          amenities: listing.metadata?.amenities,
        },
        openingHours: listing.metadata?.openingHours,
      });
    }
  }, [isEditMode, existingListing]);

  // Auto-save draft to localStorage (create mode only)
  useEffect(() => {
    if (!isEditMode && isDirty) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData, isDirty, isEditMode]);

  // Get steps based on listing type
  const steps = useMemo(() => {
    const listingType = formData.type || 'SPACE';
    const stepIds = WIZARD_STEPS_BY_TYPE[listingType] || WIZARD_STEPS_BY_TYPE.SPACE;
    return ALL_WIZARD_STEPS.filter((step) => stepIds.includes(step.id));
  }, [formData.type]);

  // Navigation helpers
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const canGoNext = currentStep < steps.length - 1;
  const canGoPrev = currentStep > 0;

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step);
    }
  }, [steps.length]);

  const nextStep = useCallback(() => {
    if (canGoNext) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [canGoNext]);

  const prevStep = useCallback(() => {
    if (canGoPrev) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [canGoPrev]);

  // Data management
  const updateFormData = useCallback((data: Partial<BackofficeListing>) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setIsDirty(true);
  }, []);

  const setFieldValue = useCallback(<K extends keyof BackofficeListing>(
    field: K,
    value: BackofficeListing[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  }, []);

  const setErrors = useCallback((stepId: WizardStepId, stepErrors: string[]) => {
    setErrorsState((prev) => ({ ...prev, [stepId]: stepErrors }));
  }, []);

  const clearErrors = useCallback((stepId?: WizardStepId) => {
    if (stepId) {
      setErrorsState((prev) => {
        const next = { ...prev };
        delete next[stepId];
        return next;
      });
    } else {
      setErrorsState({});
    }
  }, []);

  // Transform form data to API format
  const toCreateDTO = useCallback((): CreateListingDTO => {
    return {
      type: formData.type || 'SPACE',
      name: formData.name || '',
      slug: formData.slug,
      description: formData.description,
      visibility: formData.visibility,
      location: formData.location,
      capacity: formData.capacity,
      quantity: formData.quantity,
      areaSquareMeters: formData.areaSquareMeters,
      pricing: formData.pricing ? {
        basePrice: formData.pricing.basePrice,
        currency: formData.pricing.currency,
        unit: formData.pricing.unit,
      } : undefined,
      content: formData.content,
      openingHours: formData.openingHours,
      bookingConfig: formData.bookingConfig,
      seo: formData.seo,
      organizationId: formData.organizationId,
    };
  }, [formData]);

  // Save draft
  const saveDraft = useCallback(async () => {
    try {
      if (isEditMode && listingId) {
        await updateMutation.mutateAsync({
          id: listingId,
          data: toCreateDTO(),
        });
      } else {
        const result = await createMutation.mutateAsync(toCreateDTO());
        // Clear localStorage draft after successful create
        localStorage.removeItem(STORAGE_KEY);
        // Navigate to edit mode with new ID
        if (result.data?.id) {
          navigate(`/listings/${result.data.id}`, { replace: true });
        }
      }
      setIsDirty(false);
    } catch (error) {
      console.error('Failed to save draft:', error);
      throw error;
    }
  }, [isEditMode, listingId, toCreateDTO, createMutation, updateMutation, navigate]);

  // Publish listing
  const publish = useCallback(async () => {
    try {
      // First save any pending changes
      await saveDraft();
      // Then navigate back to list (publish is handled separately)
      onComplete?.(formData as BackofficeListing);
      navigate('/listings');
    } catch (error) {
      console.error('Failed to publish:', error);
      throw error;
    }
  }, [saveDraft, formData, onComplete, navigate]);

  // Cancel wizard
  const cancel = useCallback(() => {
    if (isDirty) {
      const confirmed = window.confirm('Du har ulagrede endringer. Vil du virkelig avbryte?');
      if (!confirmed) return;
    }
    // Clear draft from localStorage
    localStorage.removeItem(STORAGE_KEY);
    navigate('/listings');
  }, [isDirty, navigate]);

  return {
    // State
    currentStep,
    steps,
    formData,
    errors,
    isDirty,
    isLoading: isLoadingListing,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isEditMode,

    // Navigation
    goToStep,
    nextStep,
    prevStep,
    canGoNext,
    canGoPrev,
    isLastStep,
    isFirstStep,

    // Data management
    updateFormData,
    setFieldValue,
    setErrors,
    clearErrors,

    // Actions
    saveDraft,
    publish,
    cancel,
  };
}
