/**
 * SDK Hooks for Amenities
 * 
 * Fetches amenities from the database instead of hardcoded constants.
 * Amenities are tenant-scoped and configurable from admin.
 */

import { useQuery as useConvexQuery } from "convex/react";
import { api, type TenantId } from "../convex-api";

// =============================================================================
// Types
// =============================================================================

export interface Amenity {
    id: string;
    tenantId: string;
    groupId?: string;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    displayOrder: number;
    isHighlighted: boolean;
    isActive: boolean;
}

export interface AmenityGroup {
    id: string;
    tenantId: string;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    displayOrder: number;
    isActive: boolean;
    amenities: Amenity[];
}

export interface AmenityOption {
    id: string;
    key: string;
    label: string;
    icon?: string;
}

// =============================================================================
// Hooks
// =============================================================================

/**
 * Fetch all amenities for a tenant (flat list)
 */
export function useAmenities(tenantId: string | undefined): {
    data: Amenity[] | undefined;
    isLoading: boolean;
    error: Error | null;
} {
    const result = useConvexQuery(
        api.admin.amenities.list,
        tenantId ? { tenantId: tenantId as TenantId } : "skip"
    );

    if (result === undefined) {
        return { data: undefined, isLoading: true, error: null };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const amenities: Amenity[] = (result as any[]).map((a: any) => ({
        id: a._id,
        tenantId: a.tenantId,
        groupId: a.groupId,
        name: a.name,
        slug: a.slug,
        description: a.description,
        icon: a.icon,
        displayOrder: a.displayOrder,
        isHighlighted: a.isHighlighted,
        isActive: a.isActive,
    }));

    return { data: amenities, isLoading: false, error: null };
}

/**
 * Fetch amenities grouped by their groups
 */
export function useAmenitiesGrouped(tenantId: string | undefined): {
    data: AmenityGroup[] | undefined;
    isLoading: boolean;
    error: Error | null;
} {
    const result = useConvexQuery(
        api.admin.amenities.getGrouped,
        tenantId ? { tenantId: tenantId as TenantId } : "skip"
    );

    if (result === undefined) {
        return { data: undefined, isLoading: true, error: null };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const groups: AmenityGroup[] = (result as any[]).map((g: any) => ({
        id: g._id,
        tenantId: g.tenantId,
        name: g.name,
        slug: g.slug,
        description: g.description,
        icon: g.icon,
        displayOrder: g.displayOrder,
        isActive: g.isActive,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        amenities: (g.amenities ?? []).map((a: any) => ({
            id: a._id,
            tenantId: a.tenantId,
            groupId: a.groupId,
            name: a.name,
            slug: a.slug,
            description: a.description,
            icon: a.icon,
            displayOrder: a.displayOrder,
            isHighlighted: a.isHighlighted,
            isActive: a.isActive,
        })),
    }));

    return { data: groups, isLoading: false, error: null };
}

/**
 * Get amenity options for filter checkboxes
 * Returns options in format: { id, key, label, icon }
 */
export function useAmenityOptions(tenantId: string | undefined): {
    data: AmenityOption[] | undefined;
    isLoading: boolean;
    error: Error | null;
} {
    const { data: amenities, isLoading, error } = useAmenities(tenantId);

    if (isLoading || !amenities) {
        return { data: undefined, isLoading, error };
    }

    const options: AmenityOption[] = amenities.map((amenity) => ({
        id: amenity.id,
        key: amenity.slug,
        label: amenity.name,
        icon: amenity.icon,
    }));

    return { data: options, isLoading: false, error: null };
}

/**
 * Get amenity label by key/slug
 */
export function useAmenityLabel(tenantId: string | undefined, amenityKey: string | undefined): string {
    const { data: amenities } = useAmenities(tenantId);

    if (!amenities || !amenityKey) {
        return amenityKey ?? "";
    }

    const amenity = amenities.find((a) => a.slug === amenityKey || a.id === amenityKey);
    return amenity?.name ?? amenityKey;
}
