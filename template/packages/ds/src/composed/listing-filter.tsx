/**
 * Listing Filter Component
 *
 * Filter component with category tabs, subcategory pills, location autocomplete,
 * facility pill toggles, price/capacity sliders with labels, sorting, and active filter chips.
 *
 * Uses Designsystemet primitives for consistent styling.
 */

import React, { forwardRef, useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
    Button,
    Textfield,
    Heading,
    Paragraph,
    Label,
    Tag,
} from '@digdir/designsystemet-react';
import { GridIcon, ListIcon, MapIcon, TableIcon, FilterIcon } from '../primitives/icons';

// =============================================================================
// Types
// =============================================================================

export interface CategoryOption {
    id: string;
    key: string;
    label: string;
    icon?: string;
    count?: number;
}

export interface SubcategoryOption {
    id: string;
    key: string;
    label: string;
    parentKey: string;
}

export interface FacilityOption {
    id: string;
    key: string;
    label: string;
    icon?: string;
}

export interface SortOption {
    id: string;
    label: string;
    field: string;
    order: 'asc' | 'desc';
}

export interface CityOption {
    name: string;
    count: number;
}

export interface ListingFilterState {
    category?: string;
    subcategories?: string[];
    facilities?: string[];
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    minCapacity?: number;
    date?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    newThisWeek?: boolean;
    requiresApproval?: boolean;
    cateringAvailable?: boolean;
}

export interface ListingFilterProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
    /** Current filter state */
    value: ListingFilterState;

    /** Filter change handler */
    onChange: (filters: ListingFilterState) => void;

    /** Category options with counts (excluding 'Alle') */
    categories: CategoryOption[];

    /** Subcategory options (filtered by selected category) */
    subcategories?: SubcategoryOption[];

    /** Facility/amenity options */
    facilities?: FacilityOption[];

    /** Sort options */
    sortOptions?: SortOption[];

    /** City options with listing counts for autocomplete */
    cities?: CityOption[];

    /** Maximum price for slider */
    maxPriceLimit?: number;

    /** View mode */
    viewMode?: 'grid' | 'list' | 'map' | 'table';

    /** View mode change handler */
    onViewModeChange?: (mode: 'grid' | 'list' | 'map' | 'table') => void;

    /** Available view modes */
    availableViews?: Array<'grid' | 'list' | 'map' | 'table'>;

    /** Total results count */
    resultsCount?: number;

    /** Results label */
    resultsLabel?: string;

    /** Show expanded filter panel */
    showFilterPanel?: boolean;

    /** Loading state */
    isLoading?: boolean;

    /** Compact mode (mobile) */
    compact?: boolean;
}

// =============================================================================
// Default Options
// =============================================================================

const DEFAULT_SORT_OPTIONS: SortOption[] = [
    { id: 'relevant', label: 'Mest relevant', field: 'relevance', order: 'desc' },
    { id: 'price-asc', label: 'Pris: Lav til høy', field: 'price', order: 'asc' },
    { id: 'price-desc', label: 'Pris: Høy til lav', field: 'price', order: 'desc' },
    { id: 'name-asc', label: 'Navn: A-Å', field: 'name', order: 'asc' },
    { id: 'newest', label: 'Nyeste først', field: 'createdAt', order: 'desc' },
];

// =============================================================================
// Styles
// =============================================================================

const styles = {
    select: {
        width: '100%',
        padding: '10px 12px',
        border: '1px solid var(--ds-color-neutral-border-default)',
        borderRadius: 'var(--ds-border-radius-md)',
        fontSize: '0.9375rem',
        backgroundColor: 'var(--ds-color-neutral-background-default)',
        color: 'var(--ds-color-neutral-text-default)',
        cursor: 'pointer',
        appearance: 'none' as const,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M3 5l3 3 3-3' fill='none' stroke='%23666' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 12px center',
        paddingRight: '32px',
    } as React.CSSProperties,
    slider: {
        width: '100%',
        height: '8px',
        borderRadius: '4px',
        accentColor: 'var(--ds-color-accent-base-default)',
        cursor: 'pointer',
        WebkitAppearance: 'none' as const,
        appearance: 'none' as const,
        background: 'var(--ds-color-neutral-border-subtle)',
        outline: 'none',
    } as React.CSSProperties,
    sectionLabel: {
        fontSize: '0.75rem',
        fontWeight: 600,
        color: 'var(--ds-color-neutral-text-subtle)',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
        marginBottom: '16px',
        paddingBottom: '8px',
        borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
    } as React.CSSProperties,
    fieldLabel: {
        display: 'block',
        fontSize: '0.8125rem',
        fontWeight: 500,
        color: 'var(--ds-color-neutral-text-default)',
        marginBottom: '6px',
    } as React.CSSProperties,
    chip: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 12px',
        backgroundColor: 'var(--ds-color-accent-surface-default)',
        color: 'var(--ds-color-accent-text-default)',
        borderRadius: '100px',
        fontSize: '0.8125rem',
        lineHeight: '1.4',
        border: '1px solid var(--ds-color-accent-border-default)',
    } as React.CSSProperties,
    chipRemove: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '18px',
        height: '18px',
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        padding: 0,
        color: 'var(--ds-color-accent-text-default)',
        borderRadius: '100px',
        fontSize: '14px',
        lineHeight: 1,
        opacity: 0.7,
    } as React.CSSProperties,
    pillBase: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 16px',
        borderRadius: '100px',
        fontSize: '0.8125rem',
        fontWeight: 500,
        lineHeight: '1.4',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        whiteSpace: 'nowrap' as const,
    } as React.CSSProperties,
    sliderLabels: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.6875rem',
        color: 'var(--ds-color-neutral-text-subtle)',
        marginTop: '4px',
    } as React.CSSProperties,
    sliderValue: {
        fontSize: '0.875rem',
        fontWeight: 600,
        color: 'var(--ds-color-accent-text-default)',
        fontVariantNumeric: 'tabular-nums',
    } as React.CSSProperties,
};

function pillStyle(active: boolean): React.CSSProperties {
    return {
        ...styles.pillBase,
        backgroundColor: active ? 'var(--ds-color-accent-base-default)' : 'var(--ds-color-neutral-background-default)',
        color: active ? 'var(--ds-color-accent-contrast-default)' : 'var(--ds-color-neutral-text-default)',
        border: active ? '1px solid var(--ds-color-accent-base-default)' : '1px solid var(--ds-color-neutral-border-default)',
        boxShadow: active ? 'none' : '0 1px 2px rgba(0,0,0,0.04)',
    };
}

// =============================================================================
// Component
// =============================================================================

export const ListingFilter = forwardRef<HTMLDivElement, ListingFilterProps>(
    ({
        value,
        onChange,
        categories,
        subcategories = [],
        facilities = [],
        sortOptions = DEFAULT_SORT_OPTIONS,
        cities = [],
        maxPriceLimit = 10000,
        viewMode = 'grid',
        onViewModeChange,
        availableViews = ['grid', 'list', 'map', 'table'],
        resultsCount,
        resultsLabel = 'resultater',
        showFilterPanel = true,
        compact = false,
        className,
        style,
        ...props
    }, ref) => {
        const [priceValue, setPriceValue] = useState(value.maxPrice ?? maxPriceLimit);
        const [isFilterExpanded, setIsFilterExpanded] = useState(false);
        const filterContentRef = useRef<HTMLDivElement>(null);
        const [filterHeight, setFilterHeight] = useState(0);

        // Measure filter content height for animation
        useEffect(() => {
            if (isFilterExpanded && filterContentRef.current) {
                setFilterHeight(filterContentRef.current.scrollHeight);
            } else {
                setFilterHeight(0);
            }
        }, [isFilterExpanded, compact]);

        // Location autocomplete state
        const [locationInput, setLocationInput] = useState(value.location ?? '');
        const [showLocationDropdown, setShowLocationDropdown] = useState(false);
        const [highlightedCityIndex, setHighlightedCityIndex] = useState(-1);
        const locationRef = useRef<HTMLDivElement>(null);

        // Sync locationInput when value.location changes externally (e.g. clear all)
        useEffect(() => {
            setLocationInput(value.location ?? '');
        }, [value.location]);

        // Close dropdown on outside click
        useEffect(() => {
            function handleClickOutside(e: MouseEvent) {
                if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
                    setShowLocationDropdown(false);
                }
            }
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, []);

        // Filtered cities for autocomplete
        const filteredCities = useMemo(() => {
            if (!locationInput.trim()) return cities;
            const q = locationInput.toLowerCase();
            return cities.filter(c => c.name.toLowerCase().includes(q));
        }, [locationInput, cities]);

        // Filter out 'ALL' category
        const displayCategories = useMemo(() =>
            categories.filter(c => c.key !== 'ALL'),
            [categories]
        );

        // Build active filter chips
        const activeFilters = useMemo(() => {
            const chips: Array<{ key: string; label: string; onRemove: () => void }> = [];

            if (value.category) {
                const cat = categories.find(c => c.key === value.category);
                chips.push({
                    key: 'category',
                    label: cat?.label ?? value.category,
                    onRemove: () => onChange({ ...value, category: undefined, subcategories: undefined }),
                });
            }
            if (value.subcategories && value.subcategories.length > 0) {
                for (const sKey of value.subcategories) {
                    const sub = subcategories.find(s => s.key === sKey);
                    chips.push({
                        key: `subcategory-${sKey}`,
                        label: sub?.label ?? sKey,
                        onRemove: () => onChange({
                            ...value,
                            subcategories: value.subcategories!.filter(k => k !== sKey),
                        }),
                    });
                }
            }
            if (value.location) {
                chips.push({
                    key: 'location',
                    label: `Sted: ${value.location}`,
                    onRemove: () => onChange({ ...value, location: undefined }),
                });
            }
            if (value.maxPrice != null && value.maxPrice < maxPriceLimit) {
                chips.push({
                    key: 'maxPrice',
                    label: `Maks ${value.maxPrice.toLocaleString('nb-NO')} kr`,
                    onRemove: () => {
                        setPriceValue(maxPriceLimit);
                        onChange({ ...value, maxPrice: undefined });
                    },
                });
            }
            if (value.minCapacity && value.minCapacity > 0) {
                chips.push({
                    key: 'capacity',
                    label: `Min ${value.minCapacity} pers.`,
                    onRemove: () => onChange({ ...value, minCapacity: undefined }),
                });
            }
            if (value.newThisWeek) {
                chips.push({
                    key: 'newThisWeek',
                    label: 'Nye denne uken',
                    onRemove: () => onChange({ ...value, newThisWeek: undefined }),
                });
            }
            if (value.facilities && value.facilities.length > 0) {
                for (const fKey of value.facilities) {
                    const fac = facilities.find(f => f.key === fKey);
                    chips.push({
                        key: `facility-${fKey}`,
                        label: fac?.label ?? fKey,
                        onRemove: () => onChange({
                            ...value,
                            facilities: value.facilities!.filter(k => k !== fKey),
                        }),
                    });
                }
            }
            if (value.sortBy && value.sortBy !== 'relevance') {
                const sortOpt = sortOptions.find(o => o.field === value.sortBy && o.order === value.sortOrder);
                if (sortOpt) {
                    chips.push({
                        key: 'sort',
                        label: sortOpt.label,
                        onRemove: () => onChange({ ...value, sortBy: undefined, sortOrder: undefined }),
                    });
                }
            }

            return chips;
        }, [value, categories, subcategories, facilities, sortOptions, maxPriceLimit, onChange]);

        const handleClearAll = useCallback(() => {
            setPriceValue(maxPriceLimit);
            setLocationInput('');
            onChange({});
        }, [maxPriceLimit, onChange]);

        // Handlers
        const handleCategoryChange = useCallback((categoryKey: string) => {
            const newCategory = value.category === categoryKey ? undefined : categoryKey;
            onChange({
                ...value,
                category: newCategory,
                subcategories: undefined,
            });
        }, [value, onChange]);

        const handleSubcategoryToggle = useCallback((subcategoryKey: string) => {
            const current = value.subcategories ?? [];
            const updated = current.includes(subcategoryKey)
                ? current.filter(k => k !== subcategoryKey)
                : [...current, subcategoryKey];
            onChange({ ...value, subcategories: updated.length > 0 ? updated : undefined });
        }, [value, onChange]);

        const handleFacilityToggle = useCallback((facilityKey: string) => {
            const current = value.facilities ?? [];
            const updated = current.includes(facilityKey)
                ? current.filter(k => k !== facilityKey)
                : [...current, facilityKey];
            onChange({ ...value, facilities: updated.length > 0 ? updated : undefined });
        }, [value, onChange]);

        const handleLocationInputChange = useCallback((input: string) => {
            setLocationInput(input);
            setHighlightedCityIndex(-1);
            if (input.trim()) {
                setShowLocationDropdown(true);
            } else {
                setShowLocationDropdown(false);
                onChange({ ...value, location: undefined });
            }
        }, [value, onChange]);

        const handleCitySelect = useCallback((cityName: string) => {
            setLocationInput(cityName);
            setShowLocationDropdown(false);
            setHighlightedCityIndex(-1);
            onChange({ ...value, location: cityName });
        }, [value, onChange]);

        const handleLocationKeyDown = useCallback((e: React.KeyboardEvent) => {
            if (!showLocationDropdown || filteredCities.length === 0) return;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setHighlightedCityIndex(prev =>
                        prev < filteredCities.length - 1 ? prev + 1 : 0
                    );
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setHighlightedCityIndex(prev =>
                        prev > 0 ? prev - 1 : filteredCities.length - 1
                    );
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (highlightedCityIndex >= 0 && highlightedCityIndex < filteredCities.length) {
                        handleCitySelect(filteredCities[highlightedCityIndex].name);
                    }
                    break;
                case 'Escape':
                    setShowLocationDropdown(false);
                    setHighlightedCityIndex(-1);
                    break;
            }
        }, [showLocationDropdown, filteredCities, highlightedCityIndex, handleCitySelect]);

        const handlePriceChange = useCallback((maxPrice: number) => {
            setPriceValue(maxPrice);
            onChange({ ...value, maxPrice: maxPrice < maxPriceLimit ? maxPrice : undefined });
        }, [value, onChange, maxPriceLimit]);

        const handleCapacityChange = useCallback((minCapacity: number) => {
            onChange({ ...value, minCapacity: minCapacity > 0 ? minCapacity : undefined });
        }, [value, onChange]);

        const handleSortChange = useCallback((sortId: string) => {
            const option = sortOptions.find(o => o.id === sortId);
            if (option) {
                onChange({ ...value, sortBy: option.field, sortOrder: option.order });
            }
        }, [value, onChange, sortOptions]);

        const handleNewThisWeekToggle = useCallback(() => {
            onChange({ ...value, newThisWeek: value.newThisWeek ? undefined : true });
        }, [value, onChange]);

        const currentSortId = sortOptions.find(
            o => o.field === value.sortBy && o.order === value.sortOrder
        )?.id ?? 'relevant';

        // View mode icons
        const viewIcons: Record<string, React.ReactNode> = {
            grid: <GridIcon size={20} />,
            list: <ListIcon size={20} />,
            map: <MapIcon size={20} />,
            table: <TableIcon size={20} />,
        };

        const viewLabels: Record<string, string> = {
            grid: 'Rutenett',
            list: 'Liste',
            map: 'Kart',
            table: 'Tabell',
        };

        return (
            <div
                ref={ref}
                className={className}
                style={style}
                {...props}
            >
                <style>{`
                    @keyframes dsFilterFadeSlideIn {
                        from { opacity: 0; transform: translateY(-8px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes dsFilterChipPop {
                        0% { opacity: 0; transform: scale(0.85); }
                        60% { transform: scale(1.05); }
                        100% { opacity: 1; transform: scale(1); }
                    }
                    @keyframes dsFilterStaggerIn {
                        from { opacity: 0; transform: translateY(12px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes dsFilterPulse {
                        0%, 100% { opacity: 0.4; }
                        50% { opacity: 0.7; }
                    }
                `}</style>

                {/* Category Pills + Results Count + View Toggle Row */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px',
                        marginBottom: '16px',
                        flexWrap: 'wrap',
                    }}
                >
                    {/* Category Pills + Active Filter Chips */}
                    <div
                        style={{
                            display: 'flex',
                            gap: '10px',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            flex: '1 1 0%',
                            minWidth: 0,
                        }}
                    >
                        {displayCategories.map((cat) => {
                            const isActive = value.category === cat.key;
                            return (
                                <Button
                                    key={cat.id}
                                    type="button"
                                    variant={isActive ? 'primary' : 'secondary'}
                                    data-size="md"
                                    onClick={() => handleCategoryChange(cat.key)}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        borderRadius: '100px',
                                    }}
                                >
                                    {cat.icon && <span style={{ fontSize: '1.1em' }}>{cat.icon}</span>}
                                    <span>{cat.label}</span>
                                    {cat.count !== undefined && (
                                        <Tag
                                            data-size="sm"
                                            style={{
                                                marginLeft: '2px',
                                                backgroundColor: isActive
                                                    ? 'rgba(255,255,255,0.2)'
                                                    : 'var(--ds-color-neutral-surface-default)',
                                            }}
                                        >
                                            {cat.count}
                                        </Tag>
                                    )}
                                </Button>
                            );
                        })}

                        {/* Active filter chips inline with categories */}
                        {activeFilters.length > 0 && (
                            <>
                                <span style={{
                                    width: '1px',
                                    height: '24px',
                                    backgroundColor: 'var(--ds-color-neutral-border-subtle)',
                                    flexShrink: 0,
                                }} />
                                {activeFilters.map((chip) => (
                                    <span key={chip.key} style={{ ...styles.chip, animation: 'dsFilterChipPop 0.25s ease both' }}>
                                        <span>{chip.label}</span>
                                        <button
                                            type="button"
                                            onClick={chip.onRemove}
                                            style={styles.chipRemove}
                                            aria-label={`Fjern filter: ${chip.label}`}
                                        >
                                            &times;
                                        </button>
                                    </span>
                                ))}
                                <button
                                    type="button"
                                    onClick={handleClearAll}
                                    style={{
                                        border: 'none',
                                        background: 'none',
                                        cursor: 'pointer',
                                        color: 'var(--ds-color-accent-text-default)',
                                        fontSize: '0.8125rem',
                                        textDecoration: 'underline',
                                        padding: '4px 8px',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    Nullstill alle
                                </button>
                            </>
                        )}
                    </div>

                    {/* Results Count + View Toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {resultsCount !== undefined && (
                            <Paragraph data-size="md" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0, whiteSpace: 'nowrap' }}>
                                {resultsCount} {resultsLabel}
                            </Paragraph>
                        )}

                        {onViewModeChange && (
                            <div
                                style={{
                                    display: 'flex',
                                    gap: '2px',
                                    backgroundColor: 'var(--ds-color-neutral-surface-default)',
                                    padding: '4px',
                                    borderRadius: 'var(--ds-border-radius-md)',
                                    border: '1px solid var(--ds-color-neutral-border-subtle)',
                                }}
                            >
                                {availableViews.map((mode) => (
                                    <Button
                                        key={mode}
                                        type="button"
                                        variant={viewMode === mode ? 'primary' : 'tertiary'}
                                        data-size="sm"
                                        onClick={() => onViewModeChange(mode)}
                                        title={viewLabels[mode]}
                                        aria-label={viewLabels[mode]}
                                        aria-pressed={viewMode === mode}
                                        style={{
                                            minWidth: '40px',
                                            padding: 'var(--ds-spacing-2)',
                                        }}
                                    >
                                        {viewIcons[mode]}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Subcategory Pills Row */}
                {value.category && subcategories.length > 0 && (
                    <div
                        style={{
                            display: 'flex',
                            gap: '8px',
                            flexWrap: 'wrap',
                            marginBottom: '16px',
                            paddingBottom: '12px',
                            borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
                            animation: 'dsFilterFadeSlideIn 0.3s ease both',
                        }}
                    >
                        {subcategories.map((sub) => {
                            const isActive = value.subcategories?.includes(sub.key) ?? false;
                            return (
                                <button
                                    key={sub.id}
                                    type="button"
                                    onClick={() => handleSubcategoryToggle(sub.key)}
                                    aria-pressed={isActive}
                                    style={pillStyle(isActive)}
                                >
                                    {sub.label}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Filter Panel */}
                {showFilterPanel && (
                    <div
                        style={{
                            backgroundColor: 'var(--ds-color-neutral-surface-default)',
                            borderRadius: '12px',
                            border: '1px solid var(--ds-color-neutral-border-subtle)',
                            marginBottom: '20px',
                            overflow: 'hidden',
                        }}
                    >
                        {/* Filter Header */}
                        <button
                            type="button"
                            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                width: '100%',
                                padding: '14px 20px',
                                backgroundColor: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                borderBottom: isFilterExpanded ? '1px solid var(--ds-color-neutral-border-subtle)' : 'none',
                            }}
                        >
                            <FilterIcon size={18} style={{ color: 'var(--ds-color-neutral-text-subtle)' }} />
                            <Heading data-size="xs" style={{ margin: 0, flex: 1, textAlign: 'left' }}>
                                Filtrer
                            </Heading>
                            {activeFilters.length > 0 && !isFilterExpanded && (
                                <Tag data-size="sm" style={{ backgroundColor: 'var(--ds-color-accent-surface-default)' }}>
                                    {activeFilters.length}
                                </Tag>
                            )}
                            <span style={{
                                transform: isFilterExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s ease',
                                color: 'var(--ds-color-neutral-text-subtle)',
                                fontSize: '12px',
                            }}>
                                &#9660;
                            </span>
                        </button>

                        {/* Filter Content — 3-column layout with dividers (animated) */}
                        <div style={{
                            maxHeight: isFilterExpanded ? `${filterHeight + 48}px` : '0px',
                            opacity: isFilterExpanded ? 1 : 0,
                            overflow: 'hidden',
                            transition: 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease',
                        }}>
                            <div ref={filterContentRef} style={{ padding: compact ? '16px' : '24px 0' }}>
                                <div style={{
                                    display: compact ? 'block' : 'flex',
                                }}>
                                    {/* Column 1: Location + Sort */}
                                    <div style={{
                                        flex: '1 1 0%',
                                        padding: compact ? '0' : '0 32px',
                                        ...(compact ? { marginBottom: '24px' } : {}),
                                    }}>
                                        <div style={styles.sectionLabel}>Sted & Sortering</div>

                                        {/* Location Autocomplete */}
                                        <div
                                            ref={locationRef}
                                            style={{ marginBottom: '20px', position: 'relative' }}
                                        >
                                            <Textfield
                                                data-size="md"
                                                label="Sted"
                                                placeholder={'Søk etter sted...'}
                                                value={locationInput}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                    handleLocationInputChange(e.target.value)
                                                }
                                                onFocus={() => {
                                                    if (cities.length > 0) setShowLocationDropdown(true);
                                                }}
                                                onKeyDown={handleLocationKeyDown}
                                                role="combobox"
                                                aria-expanded={showLocationDropdown}
                                                aria-autocomplete="list"
                                                aria-controls="location-listbox"
                                                autoComplete="off"
                                            />
                                            {showLocationDropdown && filteredCities.length > 0 && (
                                                <ul
                                                    id="location-listbox"
                                                    role="listbox"
                                                    style={{
                                                        position: 'absolute',
                                                        top: '100%',
                                                        left: 0,
                                                        right: 0,
                                                        zIndex: 10,
                                                        backgroundColor: 'var(--ds-color-neutral-background-default)',
                                                        border: '1px solid var(--ds-color-neutral-border-default)',
                                                        borderTop: 'none',
                                                        borderRadius: '0 0 8px 8px',
                                                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                                        listStyle: 'none',
                                                        margin: 0,
                                                        padding: '4px 0',
                                                        maxHeight: '220px',
                                                        overflowY: 'auto',
                                                    }}
                                                >
                                                    {filteredCities.map((city, idx) => (
                                                        <li
                                                            key={city.name}
                                                            role="option"
                                                            aria-selected={idx === highlightedCityIndex}
                                                            onMouseDown={() => handleCitySelect(city.name)}
                                                            onMouseEnter={() => setHighlightedCityIndex(idx)}
                                                            style={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                padding: '8px 14px',
                                                                cursor: 'pointer',
                                                                backgroundColor: idx === highlightedCityIndex
                                                                    ? 'var(--ds-color-accent-surface-default)'
                                                                    : 'transparent',
                                                                fontSize: '0.875rem',
                                                                color: 'var(--ds-color-neutral-text-default)',
                                                                transition: 'background-color 0.1s',
                                                            }}
                                                        >
                                                            <span style={{ fontWeight: idx === highlightedCityIndex ? 500 : 400 }}>
                                                                {city.name}
                                                            </span>
                                                            <span style={{
                                                                fontSize: '0.75rem',
                                                                color: 'var(--ds-color-neutral-text-subtle)',
                                                                backgroundColor: 'var(--ds-color-neutral-surface-default)',
                                                                padding: '2px 8px',
                                                                borderRadius: '100px',
                                                            }}>
                                                                {city.count}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>

                                        {/* Sort */}
                                        <div>
                                            <label
                                                htmlFor="filter-sort"
                                                style={styles.fieldLabel}
                                            >
                                                Sorter etter
                                            </label>
                                            <select
                                                id="filter-sort"
                                                value={currentSortId}
                                                onChange={(e) => handleSortChange(e.target.value)}
                                                style={styles.select}
                                            >
                                                {sortOptions.map((option) => (
                                                    <option key={option.id} value={option.id}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Column 2: Price + Capacity */}
                                    <div style={{
                                        flex: '1 1 0%',
                                        padding: compact ? '0' : '0 32px',
                                        borderLeft: compact ? 'none' : '1px solid var(--ds-color-neutral-border-subtle)',
                                        ...(compact ? { marginBottom: '24px' } : {}),
                                    }}>
                                        <div style={styles.sectionLabel}>Pris & Kapasitet</div>

                                        {/* Price Slider */}
                                        <div style={{ marginBottom: '24px' }}>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'baseline',
                                                marginBottom: '8px',
                                            }}>
                                                <span style={styles.fieldLabel}>Maks pris</span>
                                                <span style={styles.sliderValue}>
                                                    {priceValue.toLocaleString('nb-NO')} kr
                                                </span>
                                            </div>
                                            <input
                                                type="range"
                                                min={0}
                                                max={maxPriceLimit}
                                                step={100}
                                                value={priceValue}
                                                onChange={(e) => handlePriceChange(Number(e.target.value))}
                                                style={styles.slider}
                                                aria-label="Maks pris"
                                            />
                                            <div style={styles.sliderLabels}>
                                                <span>0 kr</span>
                                                <span>{maxPriceLimit.toLocaleString('nb-NO')} kr</span>
                                            </div>
                                        </div>

                                        {/* Capacity Slider */}
                                        <div>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'baseline',
                                                marginBottom: '8px',
                                            }}>
                                                <span style={styles.fieldLabel}>Min kapasitet</span>
                                                <span style={styles.sliderValue}>
                                                    {value.minCapacity ?? 0} pers.
                                                </span>
                                            </div>
                                            <input
                                                type="range"
                                                min={0}
                                                max={500}
                                                step={10}
                                                value={value.minCapacity ?? 0}
                                                onChange={(e) => handleCapacityChange(Number(e.target.value))}
                                                style={styles.slider}
                                                aria-label="Min kapasitet"
                                            />
                                            <div style={styles.sliderLabels}>
                                                <span>0</span>
                                                <span>500</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Column 3: Facilities + Toggles */}
                                    <div style={{
                                        flex: '1 1 0%',
                                        padding: compact ? '0' : '0 32px',
                                        borderLeft: compact ? 'none' : '1px solid var(--ds-color-neutral-border-subtle)',
                                    }}>
                                        <div style={styles.sectionLabel}>Fasiliteter & Annet</div>

                                        {facilities.length > 0 && (
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    flexWrap: 'wrap',
                                                    gap: '8px',
                                                    marginBottom: '20px',
                                                }}
                                            >
                                                {facilities.slice(0, 8).map((facility) => {
                                                    const isActive = value.facilities?.includes(facility.key) ?? false;
                                                    return (
                                                        <button
                                                            key={facility.id}
                                                            type="button"
                                                            onClick={() => handleFacilityToggle(facility.key)}
                                                            aria-pressed={isActive}
                                                            style={pillStyle(isActive)}
                                                        >
                                                            {facility.icon && <span>{facility.icon}</span>}
                                                            {facility.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* New This Week — pill toggle */}
                                        <div style={{
                                            paddingTop: facilities.length > 0 ? '12px' : '0',
                                            borderTop: facilities.length > 0 ? '1px solid var(--ds-color-neutral-border-subtle)' : 'none',
                                        }}>
                                            <button
                                                type="button"
                                                onClick={handleNewThisWeekToggle}
                                                aria-pressed={value.newThisWeek ?? false}
                                                style={{
                                                    ...pillStyle(value.newThisWeek ?? false),
                                                    ...(!(value.newThisWeek) && {
                                                        border: '1px dashed var(--ds-color-neutral-border-default)',
                                                    }),
                                                }}
                                            >
                                                <span style={{ fontSize: '14px' }}>✨</span>
                                                Nye denne uken
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
);

ListingFilter.displayName = 'ListingFilter';
