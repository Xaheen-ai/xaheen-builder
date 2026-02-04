/**
 * Google Places Autocomplete Hook
 * Handles loading the Google Maps script and providing autocomplete functionality
 */

import { useEffect, useRef, useState, useCallback } from 'react';

// Extend window to include google types
declare global {
  interface Window {
    google?: typeof google;
    initGoogleMaps?: () => void;
  }
}

export interface PlaceResult {
  address: string;
  city?: string | undefined;
  postalCode?: string | undefined;
  municipality?: string | undefined;
  country?: string | undefined;
  latitude?: number | undefined;
  longitude?: number | undefined;
  placeId?: string | undefined;
}

interface UseGooglePlacesOptions {
  apiKey?: string;
  country?: string; // Restrict to country (e.g., 'no' for Norway)
  types?: string[]; // Address types to return
}

const GOOGLE_MAPS_SCRIPT_ID = 'google-maps-script';

// Check if script is already loaded
function isGoogleMapsLoaded(): boolean {
  return typeof window !== 'undefined' && !!window.google?.maps?.places;
}

// Load Google Maps script
function loadGoogleMapsScript(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (isGoogleMapsLoaded()) {
      resolve();
      return;
    }

    // Check if script tag already exists
    const existingScript = document.getElementById(GOOGLE_MAPS_SCRIPT_ID);
    if (existingScript) {
      // Script exists but not loaded yet, wait for it
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Google Maps')));
      return;
    }

    // Create callback for script load
    window.initGoogleMaps = () => {
      resolve();
    };

    // Create and append script
    const script = document.createElement('script');
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error('Failed to load Google Maps script'));

    document.head.appendChild(script);
  });
}

// Parse address components from Google Place result
function parseAddressComponents(
  components: google.maps.GeocoderAddressComponent[] | undefined
): Partial<PlaceResult> {
  if (!components) return {};
  const result: Partial<PlaceResult> = {};

  for (const component of components) {
    const types = component.types;

    if (types.includes('street_number')) {
      result.address = (result.address || '') + component.long_name;
    }
    if (types.includes('route')) {
      result.address = component.long_name + ' ' + (result.address || '');
    }
    if (types.includes('postal_code')) {
      result.postalCode = component.long_name;
    }
    if (types.includes('postal_town') || types.includes('locality')) {
      result.city = component.long_name;
    }
    if (types.includes('administrative_area_level_2')) {
      result.municipality = component.long_name;
    }
    if (types.includes('country')) {
      result.country = component.long_name;
    }
  }

  // Trim the address
  if (result.address) {
    result.address = result.address.trim();
  }

  return result;
}

export function useGooglePlaces(options: UseGooglePlacesOptions = {}) {
  const {
    apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY as string,
    country = 'no',
    types = ['address'],
  } = options;

  const [isLoaded, setIsLoaded] = useState(isGoogleMapsLoaded());
  const [error, setError] = useState<Error | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Load script on mount
  useEffect(() => {
    if (!apiKey) {
      setError(new Error('Google Places API key is missing'));
      return;
    }

    if (isGoogleMapsLoaded()) {
      setIsLoaded(true);
      return;
    }

    loadGoogleMapsScript(apiKey)
      .then(() => setIsLoaded(true))
      .catch((err) => setError(err));
  }, [apiKey]);

  // Initialize autocomplete
  const initAutocomplete = useCallback(
    (
      input: HTMLInputElement,
      onPlaceSelect: (place: PlaceResult) => void
    ) => {
      if (!isLoaded || !window.google?.maps?.places) {
        return;
      }

      inputRef.current = input;

      // Create autocomplete instance
      const autocomplete = new window.google.maps.places.Autocomplete(input, {
        componentRestrictions: { country },
        types,
        fields: ['address_components', 'geometry', 'place_id', 'formatted_address'],
      });

      autocompleteRef.current = autocomplete;

      // Listen for place selection
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();

        if (!place.address_components) {
          return;
        }

        const parsed = parseAddressComponents(place.address_components);
        const result: PlaceResult = {
          address: parsed.address || place.formatted_address || '',
          city: parsed.city,
          postalCode: parsed.postalCode,
          municipality: parsed.municipality,
          country: parsed.country,
          latitude: place.geometry?.location?.lat(),
          longitude: place.geometry?.location?.lng(),
          placeId: place.place_id,
        };

        onPlaceSelect(result);
      });
    },
    [isLoaded, country, types]
  );

  // Cleanup
  useEffect(() => {
    return () => {
      if (autocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
  }, []);

  return {
    isLoaded,
    error,
    initAutocomplete,
  };
}

export default useGooglePlaces;
