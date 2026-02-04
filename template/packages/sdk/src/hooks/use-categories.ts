/**
 * SDK Hooks for Categories
 * 
 * Fetches categories from the database instead of hardcoded constants.
 * Categories are tenant-scoped and configurable from admin.
 */

import { useQuery as useConvexQuery } from "convex/react";
import { api, type TenantId } from "../convex-api";

// =============================================================================
// Types
// =============================================================================

export interface Category {
    id: string;
    tenantId: string;
    parentId?: string;
    key: string;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    color?: string;
    sortOrder?: number;
    settings?: Record<string, unknown>;
    isActive: boolean;
}

export interface CategoryWithSubcategories extends Category {
    subcategories: Category[];
}

export interface CategoryOption {
    id: string;
    label: string;
    value: string;
}

// =============================================================================
// Hooks
// =============================================================================

/**
 * Fetch all categories for a tenant (flat list)
 */
export function useCategories(tenantId: string | undefined): {
    data: Category[] | undefined;
    isLoading: boolean;
    error: Error | null;
} {
    const result = useConvexQuery(
        api.admin.categories.list,
        tenantId ? { tenantId: tenantId as TenantId } : "skip"
    );

    if (result === undefined) {
        return { data: undefined, isLoading: true, error: null };
    }

    const categories: Category[] = (result as Array<{
        _id: string;
        tenantId: string;
        parentId?: string;
        key?: string;
        name: string;
        slug: string;
        description?: string;
        icon?: string;
        color?: string;
        sortOrder?: number;
        settings?: Record<string, unknown>;
        isActive: boolean;
    }>).map((c) => ({
        id: c._id,
        tenantId: c.tenantId,
        parentId: c.parentId,
        key: c.key ?? c.slug,
        name: c.name,
        slug: c.slug,
        description: c.description,
        icon: c.icon,
        color: c.color,
        sortOrder: c.sortOrder,
        settings: c.settings,
        isActive: c.isActive,
    }));

    return { data: categories, isLoading: false, error: null };
}

/**
 * Fetch category tree (categories with their subcategories)
 */
export function useCategoryTree(tenantId: string | undefined): {
    data: CategoryWithSubcategories[] | undefined;
    isLoading: boolean;
    error: Error | null;
} {
    const result = useConvexQuery(
        api.admin.categories.getTree,
        tenantId ? { tenantId: tenantId as TenantId } : "skip"
    );

    if (result === undefined) {
        return { data: undefined, isLoading: true, error: null };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tree: CategoryWithSubcategories[] = (result as any[]).map((c: any) => ({
        id: c._id,
        tenantId: c.tenantId,
        parentId: c.parentId,
        key: c.key ?? c.slug,
        name: c.name,
        slug: c.slug,
        description: c.description,
        icon: c.icon,
        color: c.color,
        sortOrder: c.sortOrder,
        settings: c.settings,
        isActive: c.isActive,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        subcategories: (c.subcategories ?? []).map((sub: any) => ({
            id: sub._id,
            tenantId: sub.tenantId,
            parentId: sub.parentId,
            key: sub.key ?? sub.slug,
            name: sub.name,
            slug: sub.slug,
            description: sub.description,
            icon: sub.icon,
            color: sub.color,
            sortOrder: sub.sortOrder,
            settings: sub.settings,
            isActive: sub.isActive,
        })),
    }));

    return { data: tree, isLoading: false, error: null };
}

/**
 * Get category options for filter dropdowns
 * Returns options in format: { id: 'ALL', label: 'Alle typer' }, { id: 'LOKALER', label: 'Lokaler' }, ...
 */
export function useCategoryOptions(tenantId: string | undefined): {
    data: CategoryOption[] | undefined;
    isLoading: boolean;
    error: Error | null;
} {
    const { data: categories, isLoading, error } = useCategoryTree(tenantId);

    if (isLoading || !categories) {
        return { data: undefined, isLoading, error };
    }

    const options: CategoryOption[] = [
        { id: "ALL", label: "Alle typer", value: "ALL" },
        ...categories.map((cat) => ({
            id: cat.key,
            label: cat.name,
            value: cat.key,
        })),
    ];

    return { data: options, isLoading: false, error: null };
}

/**
 * Get category label by key
 */
export function useCategoryLabel(tenantId: string | undefined, categoryKey: string | undefined): string {
    const { data: categories } = useCategoryTree(tenantId);

    if (!categories || !categoryKey) {
        return categoryKey ?? "Annet";
    }

    const category = categories.find((c) => c.key === categoryKey);
    return category?.name ?? categoryKey;
}
