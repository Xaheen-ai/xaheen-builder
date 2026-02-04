/**
 * Listing Wizard Hook
 * Manages wizard state, step navigation, and form data persistence
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useListingBySlug,
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
import { validateStep, validateAllSteps } from '../utils/wizard-validation';

export interface UseListingWizardOptions {
  /** Listing slug for edit mode */
  slug?: string | undefined;
  /** Initial listing type (for create mode) */
  initialType?: ListingType | undefined;
  /** Callback when wizard completes */
  onComplete?: ((listing: BackofficeListing) => void) | undefined;
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
  validateCurrentStep: () => boolean;
  validateAll: () => boolean;
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
  const { slug, initialType, onComplete } = options;
  const navigate = useNavigate();
  const isEditMode = !!slug;

  // SDK hooks - fetch by slug for edit mode
  const { data: existingListing, isLoading: isLoadingListing } = useListingBySlug(slug || '', {
    enabled: isEditMode,
  });
  const createMutation = useCreateListing();
  const updateMutation = useUpdateListing();

  // Track if we've loaded the existing listing data to prevent infinite loops
  const hasLoadedExistingData = useRef(false);

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

  // Load existing listing data in edit mode (only once)
  useEffect(() => {
    if (isEditMode && existingListing?.data && !hasLoadedExistingData.current) {
      hasLoadedExistingData.current = true;
      const listing = existingListing.data;
      const newData: Partial<BackofficeListing> = {
        id: listing.id,
        name: listing.name,
        slug: listing.slug,
        type: listing.type,
        status: listing.status,
        images: listing.images,
        pricing: listing.pricing,
      };
      // Only add optional fields if they have values
      if (listing.description) newData.description = listing.description;
      if (listing.capacity !== undefined) newData.capacity = listing.capacity;
      if (listing.metadata?.location) newData.location = listing.metadata.location;
      if (listing.metadata?.amenities) {
        newData.content = { amenities: listing.metadata.amenities };
      }
      if (listing.metadata?.openingHours) {
        newData.openingHours = listing.metadata.openingHours;
      }
      setFormData(newData);
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
      // Optional: validate current step when leaving (but allow going back/forward)
      const currentStepId = steps[currentStep]?.id;
      if (currentStepId && step > currentStep) {
        // Only validate when moving forward
        const result = validateStep(currentStepId, formData);
        if (!result.isValid) {
          setErrorsState((prev) => ({
            ...prev,
            [currentStepId]: result.errors.map((e) => e.message),
          }));
          // Still allow navigation but show errors
        }
      }
      setCurrentStep(step);
    }
  }, [steps.length, currentStep, steps, formData]);

  const nextStep = useCallback(() => {
    if (canGoNext) {
      // Validate current step before proceeding
      const currentStepId = steps[currentStep]?.id;
      if (currentStepId) {
        const result = validateStep(currentStepId, formData);
        if (!result.isValid) {
          // Set errors for current step
          setErrorsState((prev) => ({
            ...prev,
            [currentStepId]: result.errors.map((e) => e.message),
          }));
          return; // Don't proceed if validation fails
        }
        // Clear errors for this step if validation passes
        setErrorsState((prev) => {
          const next = { ...prev };
          delete next[currentStepId];
          return next;
        });
      }
      setCurrentStep((prev) => prev + 1);
    }
  }, [canGoNext, currentStep, steps, formData]);

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

  // Validate current step and return true if valid
  const validateCurrentStep = useCallback(() => {
    const currentStepId = steps[currentStep]?.id;
    if (!currentStepId) return true;

    const result = validateStep(currentStepId, formData);
    if (!result.isValid) {
      setErrorsState((prev) => ({
        ...prev,
        [currentStepId]: result.errors.map((e) => e.message),
      }));
      return false;
    }
    // Clear errors for this step
    setErrorsState((prev) => {
      const next = { ...prev };
      delete next[currentStepId];
      return next;
    });
    return true;
  }, [currentStep, steps, formData]);

  // Validate all steps and return true if all valid
  const validateAll = useCallback(() => {
    const allErrors = validateAllSteps(steps, formData);
    const hasErrors = Object.keys(allErrors).length > 0;
    setErrorsState(allErrors);
    return !hasErrors;
  }, [steps, formData]);

  // Transform form data to API format
  const toCreateDTO = useCallback((): CreateListingDTO => {
    const dto: CreateListingDTO = {
      type: formData.type || 'SPACE',
      name: formData.name || '',
    };
    // Only add optional fields if they have values
    if (formData.slug) dto.slug = formData.slug;
    if (formData.description) dto.description = formData.description;
    if (formData.visibility) dto.visibility = formData.visibility;
    if (formData.location) dto.location = formData.location;
    if (formData.capacity !== undefined) dto.capacity = formData.capacity;
    if (formData.quantity !== undefined) dto.quantity = formData.quantity;
    if (formData.areaSquareMeters !== undefined) dto.areaSquareMeters = formData.areaSquareMeters;
    if (formData.pricing) {
      dto.pricing = {
        basePrice: formData.pricing.basePrice,
        currency: formData.pricing.currency,
        unit: formData.pricing.unit,
      };
    }
    if (formData.content) dto.content = formData.content;
    if (formData.openingHours) dto.openingHours = formData.openingHours;
    if (formData.bookingConfig) dto.bookingConfig = formData.bookingConfig;
    if (formData.seo) dto.seo = formData.seo;
    if (formData.organizationId) dto.organizationId = formData.organizationId;
    return dto;
  }, [formData]);

  // Save draft
  const saveDraft = useCallback(async () => {
    // Prevent duplicate saves
    if (createMutation.isPending || updateMutation.isPending) {
      return;
    }

    try {
      // Use the ID from form data (set during edit mode load or after first create)
      const listingId = formData.id;

      if (listingId) {
        // Update existing listing
        await updateMutation.mutateAsync({
          id: listingId,
          data: toCreateDTO(),
        });
      } else {
        // Create new listing
        const result = await createMutation.mutateAsync(toCreateDTO());

        // Clear localStorage draft after successful create
        localStorage.removeItem(STORAGE_KEY);

        // Update form data with new ID and slug (so next save is an update)
        if (result.data) {
          setFormData((prev) => ({
            ...prev,
            id: result.data.id,
            slug: result.data.slug,
          }));

          // Navigate to edit mode with new slug (replace to prevent back button issues)
          if (result.data.slug) {
            navigate(`/listings/${result.data.slug}`, { replace: true });
          }
        }
      }
      setIsDirty(false);
    } catch (error) {
      console.error('Failed to save draft:', error);
      throw error;
    }
  }, [formData.id, toCreateDTO, createMutation, updateMutation, navigate]);

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
    validateCurrentStep,
    validateAll,
  };
}
