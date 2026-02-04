/**
 * Wizard Validation
 * Validation logic for each wizard step
 */

import type {
  BackofficeListing,
  WizardStepId,
  StepValidationResult,
  ValidationError,
} from '../types';

/**
 * Validates the Basics step
 */
function validateBasicsStep(data: Partial<BackofficeListing>): StepValidationResult {
  const errors: ValidationError[] = [];

  if (!data.name?.trim()) {
    errors.push({ field: 'name', message: 'Navn er påkrevd' });
  } else if (data.name.length < 3) {
    errors.push({ field: 'name', message: 'Navn må være minst 3 tegn' });
  }

  if (!data.type) {
    errors.push({ field: 'type', message: 'Type er påkrevd' });
  }

  if (!data.description?.trim()) {
    errors.push({ field: 'description', message: 'Kort beskrivelse er påkrevd' });
  } else if (data.description.length < 20) {
    errors.push({ field: 'description', message: 'Beskrivelse må være minst 20 tegn' });
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validates the Location step
 */
function validateLocationStep(data: Partial<BackofficeListing>): StepValidationResult {
  const errors: ValidationError[] = [];
  const location = data.location;

  if (!location?.address?.trim()) {
    errors.push({ field: 'location.address', message: 'Adresse er påkrevd' });
  }

  // City is optional but recommended
  // Municipality is optional
  // Coordinates are optional

  return { isValid: errors.length === 0, errors };
}

/**
 * Validates the Capacity step
 */
function validateCapacityStep(data: Partial<BackofficeListing>): StepValidationResult {
  const errors: ValidationError[] = [];

  // Capacity validation depends on type
  if (data.type === 'SPACE' || data.type === 'EVENT') {
    if (data.capacity === undefined || data.capacity === null) {
      errors.push({ field: 'capacity', message: 'Kapasitet er påkrevd for denne typen' });
    } else if (data.capacity <= 0) {
      errors.push({ field: 'capacity', message: 'Kapasitet må være større enn 0' });
    }
  }

  if (data.type === 'RESOURCE' || data.type === 'VEHICLE') {
    if (data.quantity === undefined || data.quantity === null) {
      errors.push({ field: 'quantity', message: 'Antall er påkrevd for denne typen' });
    } else if (data.quantity <= 0) {
      errors.push({ field: 'quantity', message: 'Antall må være større enn 0' });
    }
  }

  // Area is optional
  if (data.areaSquareMeters !== undefined && data.areaSquareMeters < 0) {
    errors.push({ field: 'areaSquareMeters', message: 'Areal kan ikke være negativt' });
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validates the Content step
 */
function validateContentStep(_data: Partial<BackofficeListing>): StepValidationResult {
  // Full description is recommended but not required
  // Amenities, FAQ, and Rules are all optional
  return { isValid: true, errors: [] };
}

/**
 * Validates the Opening Hours step
 */
function validateOpeningHoursStep(data: Partial<BackofficeListing>): StepValidationResult {
  const errors: ValidationError[] = [];
  const openingHours = data.openingHours;

  // For SPACE type, opening hours are recommended
  if (data.type === 'SPACE' && !openingHours) {
    // Not an error, just a recommendation
  }

  // Validate that if hours are set, they make sense
  if (openingHours) {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
    for (const day of days) {
      const hours = openingHours[day];
      if (hours) {
        // Check that close time is after open time (simple string comparison works for HH:MM format)
        if (hours.close <= hours.open && hours.close !== '00:00') {
          errors.push({
            field: `openingHours.${day}`,
            message: `Stengetid må være etter åpningstid for ${day}`,
          });
        }
      }
    }
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validates the Booking Config step
 */
function validateBookingConfigStep(data: Partial<BackofficeListing>): StepValidationResult {
  const errors: ValidationError[] = [];
  const config = data.bookingConfig;

  if (!config) {
    // Use defaults, not an error
    return { isValid: true, errors };
  }

  if (config.slotDurationMinutes !== undefined && config.slotDurationMinutes < 15) {
    errors.push({ field: 'bookingConfig.slotDurationMinutes', message: 'Booking-intervall må være minst 15 minutter' });
  }

  if (config.minLeadTimeHours !== undefined && config.minLeadTimeHours < 0) {
    errors.push({ field: 'bookingConfig.minLeadTimeHours', message: 'Varsel kan ikke være negativt' });
  }

  if (config.maxAdvanceDays !== undefined && config.maxAdvanceDays < 1) {
    errors.push({ field: 'bookingConfig.maxAdvanceDays', message: 'Maks fremtidig booking må være minst 1 dag' });
  }

  if (config.depositPercent !== undefined && (config.depositPercent < 0 || config.depositPercent > 100)) {
    errors.push({ field: 'bookingConfig.depositPercent', message: 'Depositum må være mellom 0 og 100%' });
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validates the Media step
 */
function validateMediaStep(data: Partial<BackofficeListing>): StepValidationResult {
  const errors: ValidationError[] = [];

  // At least one image is recommended for publishing
  if (!data.images?.length && !data.media?.length) {
    errors.push({ field: 'media', message: 'Minst ett bilde anbefales' });
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validates the Review step (final validation)
 */
function validateReviewStep(data: Partial<BackofficeListing>): StepValidationResult {
  const errors: ValidationError[] = [];

  // Run all required validations
  const basicsResult = validateBasicsStep(data);
  if (!basicsResult.isValid) {
    errors.push(...basicsResult.errors);
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validates a specific step
 */
export function validateStep(stepId: WizardStepId, data: Partial<BackofficeListing>): StepValidationResult {
  switch (stepId) {
    case 'basics':
      return validateBasicsStep(data);
    case 'location':
      return validateLocationStep(data);
    case 'capacity':
      return validateCapacityStep(data);
    case 'content':
      return validateContentStep(data);
    case 'openingHours':
      return validateOpeningHoursStep(data);
    case 'bookingConfig':
      return validateBookingConfigStep(data);
    case 'media':
      return validateMediaStep(data);
    case 'review':
      return validateReviewStep(data);
    default:
      return { isValid: true, errors: [] };
  }
}

/**
 * Validates all steps and returns a map of errors by step
 */
export function validateAllSteps(
  steps: { id: WizardStepId }[],
  data: Partial<BackofficeListing>
): Record<WizardStepId, string[]> {
  const errorsByStep: Record<string, string[]> = {};

  for (const step of steps) {
    const result = validateStep(step.id, data);
    if (!result.isValid) {
      errorsByStep[step.id] = result.errors.map((e) => e.message);
    }
  }

  return errorsByStep as Record<WizardStepId, string[]>;
}

/**
 * Checks if a listing is ready to publish
 */
export function canPublish(data: Partial<BackofficeListing>): { canPublish: boolean; missingFields: string[] } {
  const missingFields: string[] = [];

  // Required fields for publishing
  if (!data.name?.trim()) missingFields.push('Navn');
  if (!data.type) missingFields.push('Type');
  if (!data.description?.trim()) missingFields.push('Beskrivelse');

  // Type-specific requirements
  if (data.type === 'SPACE' || data.type === 'EVENT') {
    if (!data.capacity) missingFields.push('Kapasitet');
    if (!data.location?.address) missingFields.push('Adresse');
  }

  if (!data.images?.length && !data.media?.length) {
    missingFields.push('Bilder');
  }

  return {
    canPublish: missingFields.length === 0,
    missingFields,
  };
}
