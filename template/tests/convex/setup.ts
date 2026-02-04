/**
 * Convex Test Setup
 *
 * Utilities for testing Convex backend functions.
 * Uses convex-test for unit testing Convex queries and mutations.
 */

import { vi } from 'vitest';

// Mock Convex context for testing
export interface MockConvexContext {
    db: MockDatabase;
    auth: MockAuth;
}

export interface MockDatabase {
    get: ReturnType<typeof vi.fn>;
    insert: ReturnType<typeof vi.fn>;
    patch: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    query: ReturnType<typeof vi.fn>;
}

export interface MockAuth {
    getUserIdentity: ReturnType<typeof vi.fn>;
}

// In-memory data store for tests
export class TestDataStore {
    private data: Map<string, Map<string, unknown>> = new Map();
    private idCounter = 0;

    constructor() {
        this.reset();
    }

    reset(): void {
        this.data = new Map();
        this.idCounter = 0;
        // Initialize tables
        const tables = [
            'tenants',
            'users',
            'organizations',
            'resources',
            'bookings',
            'roles',
            'userRoles',
            'tenantUsers',
            'bookingAudit',
            'blocks',
            'payments',
            'oauthStates',
            'sessions',
        ];
        tables.forEach((t) => this.data.set(t, new Map()));
    }

    generateId(table: string): string {
        return `${table}_${++this.idCounter}`;
    }

    insert(table: string, doc: Record<string, unknown>): string {
        const id = this.generateId(table);
        const tableData = this.data.get(table);
        if (!tableData) throw new Error(`Table ${table} not found`);

        tableData.set(id, {
            _id: id,
            _creationTime: Date.now(),
            ...doc,
        });
        return id;
    }

    get(id: string): unknown | null {
        for (const tableData of this.data.values()) {
            if (tableData.has(id)) {
                return tableData.get(id);
            }
        }
        return null;
    }

    patch(id: string, updates: Record<string, unknown>): void {
        for (const tableData of this.data.values()) {
            if (tableData.has(id)) {
                const existing = tableData.get(id) as Record<string, unknown>;
                tableData.set(id, { ...existing, ...updates });
                return;
            }
        }
        throw new Error(`Document ${id} not found`);
    }

    delete(id: string): void {
        for (const tableData of this.data.values()) {
            if (tableData.has(id)) {
                tableData.delete(id);
                return;
            }
        }
    }

    query(table: string): QueryBuilder {
        const tableData = this.data.get(table);
        if (!tableData) throw new Error(`Table ${table} not found`);
        return new QueryBuilder(Array.from(tableData.values()));
    }

    // Seed helpers
    seedTenant(data: Partial<TenantData> = {}): string {
        return this.insert('tenants', {
            name: data.name ?? 'Test Tenant',
            slug: data.slug ?? 'test-tenant',
            domain: data.domain,
            status: data.status ?? 'active',
            settings: data.settings ?? { locale: 'nb-NO', currency: 'NOK' },
            seatLimits: data.seatLimits ?? { maxUsers: 10 },
            featureFlags: data.featureFlags ?? {},
            enabledCategories: data.enabledCategories ?? ['LOKALER'],
        });
    }

    seedUser(data: Partial<UserData> = {}): string {
        return this.insert('users', {
            tenantId: data.tenantId,
            email: data.email ?? `user${this.idCounter}@test.com`,
            name: data.name ?? 'Test User',
            role: data.role ?? 'user',
            status: data.status ?? 'active',
            metadata: data.metadata ?? {},
        });
    }

    seedResource(data: Partial<ResourceData> = {}): string {
        return this.insert('resources', {
            tenantId: data.tenantId,
            name: data.name ?? 'Test Resource',
            slug: data.slug ?? `resource-${this.idCounter}`,
            categoryKey: data.categoryKey ?? 'LOKALER',
            status: data.status ?? 'draft',
            timeMode: data.timeMode ?? 'PERIOD',
            features: data.features ?? [],
            requiresApproval: data.requiresApproval ?? false,
            capacity: data.capacity ?? 1,
            images: data.images ?? [],
            pricing: data.pricing ?? {},
            metadata: data.metadata ?? {},
        });
    }

    seedBooking(data: Partial<BookingData> = {}): string {
        return this.insert('bookings', {
            tenantId: data.tenantId,
            resourceId: data.resourceId,
            userId: data.userId,
            startTime: data.startTime ?? Date.now(),
            endTime: data.endTime ?? Date.now() + 3600000,
            status: data.status ?? 'confirmed',
            totalPrice: data.totalPrice ?? 0,
            currency: data.currency ?? 'NOK',
            version: data.version ?? 1,
            submittedAt: data.submittedAt ?? Date.now(),
            metadata: data.metadata ?? {},
        });
    }

    seedRole(data: Partial<RoleData> = {}): string {
        return this.insert('roles', {
            tenantId: data.tenantId,
            name: data.name ?? 'Test Role',
            description: data.description,
            permissions: data.permissions ?? [],
            isDefault: data.isDefault ?? false,
            isSystem: data.isSystem ?? false,
        });
    }

    seedOrganization(data: Partial<OrganizationData> = {}): string {
        return this.insert('organizations', {
            tenantId: data.tenantId,
            name: data.name ?? 'Test Organization',
            slug: data.slug ?? `org-${this.idCounter}`,
            type: data.type ?? 'organization',
            parentId: data.parentId,
            metadata: data.metadata ?? {},
        });
    }

    seedAmenityGroup(data: Partial<AmenityGroupData> = {}): string {
        return this.insert('amenityGroups', {
            tenantId: data.tenantId,
            name: data.name ?? 'Test Amenity Group',
            description: data.description,
            icon: data.icon,
            isActive: data.isActive ?? true,
            displayOrder: data.displayOrder ?? 0,
        });
    }

    seedAmenity(data: Partial<AmenityData> = {}): string {
        return this.insert('amenities', {
            tenantId: data.tenantId,
            name: data.name ?? 'Test Amenity',
            description: data.description,
            icon: data.icon,
            groupId: data.groupId,
            isActive: data.isActive ?? true,
            isHighlighted: data.isHighlighted ?? false,
            displayOrder: data.displayOrder ?? 0,
        });
    }

    seedAddon(data: Partial<AddonData> = {}): string {
        return this.insert('addons', {
            tenantId: data.tenantId,
            name: data.name ?? 'Test Addon',
            description: data.description,
            icon: data.icon,
            category: data.category,
            price: data.price ?? 100,
            priceType: data.priceType ?? 'fixed',
            maxQuantity: data.maxQuantity,
            isActive: data.isActive ?? true,
        });
    }

    seedPricingGroup(data: Partial<PricingGroupData> = {}): string {
        return this.insert('pricingGroups', {
            tenantId: data.tenantId,
            name: data.name ?? 'Test Pricing Group',
            description: data.description,
            isActive: data.isActive ?? true,
            isDefault: data.isDefault ?? false,
            priority: data.priority ?? 0,
        });
    }

    seedResourcePricing(data: Partial<ResourcePricingData> = {}): string {
        return this.insert('resourcePricing', {
            tenantId: data.tenantId,
            resourceId: data.resourceId,
            pricingGroupId: data.pricingGroupId,
            basePrice: data.basePrice ?? 100,
            pricePerHour: data.pricePerHour,
            minDuration: data.minDuration,
            maxDuration: data.maxDuration,
            currency: data.currency ?? 'NOK',
            isActive: data.isActive ?? true,
        });
    }

    seedPayment(data: Partial<PaymentData> = {}): string {
        const now = Date.now();
        return this.insert('payments', {
            tenantId: data.tenantId ?? 'tenants_0',
            bookingId: data.bookingId,
            userId: data.userId,
            provider: data.provider ?? 'vipps',
            reference: data.reference ?? `xala-test-${now}`,
            externalId: data.externalId,
            amount: data.amount ?? 10000,
            currency: data.currency ?? 'NOK',
            description: data.description,
            status: data.status ?? 'created',
            redirectUrl: data.redirectUrl,
            capturedAmount: data.capturedAmount,
            refundedAmount: data.refundedAmount,
            metadata: data.metadata,
            createdAt: data.createdAt ?? now,
            updatedAt: data.updatedAt ?? now,
        });
    }

    seedOAuthState(data: Partial<OAuthStateData> = {}): string {
        const now = Date.now();
        return this.insert('oauthStates', {
            state: data.state ?? crypto.randomUUID(),
            provider: data.provider ?? 'vipps',
            appOrigin: data.appOrigin ?? 'http://localhost:5173',
            returnPath: data.returnPath ?? '/',
            appId: data.appId ?? 'web',
            signicatSessionId: data.signicatSessionId,
            createdAt: data.createdAt ?? now,
            expiresAt: data.expiresAt ?? now + 10 * 60 * 1000,
            consumed: data.consumed ?? false,
        });
    }

    seedSession(data: Partial<SessionData> = {}): string {
        const now = Date.now();
        return this.insert('sessions', {
            userId: data.userId ?? 'users_0',
            token: data.token ?? crypto.randomUUID(),
            appId: data.appId ?? 'web',
            provider: data.provider ?? 'password',
            expiresAt: data.expiresAt ?? now + 7 * 24 * 60 * 60 * 1000,
            lastActiveAt: data.lastActiveAt ?? now,
            isActive: data.isActive ?? true,
        });
    }
}

// Query builder for filtering
class QueryBuilder {
    private items: unknown[];
    private filters: Array<(item: unknown) => boolean> = [];
    private indexFilter: ((item: unknown) => boolean) | null = null;

    constructor(items: unknown[]) {
        this.items = items;
    }

    withIndex(
        _indexName: string,
        filterFn: (q: IndexQueryBuilder) => IndexQueryBuilder
    ): QueryBuilder {
        const builder = new IndexQueryBuilder();
        filterFn(builder);
        this.indexFilter = builder.build();
        return this;
    }

    filter(
        filterFn: (q: FilterQueryBuilder) => FilterExpression
    ): QueryBuilder {
        const builder = new FilterQueryBuilder();
        const expression = filterFn(builder);
        this.filters.push(expression.evaluate.bind(expression));
        return this;
    }

    async first(): Promise<unknown | null> {
        const results = await this.collect();
        return results[0] ?? null;
    }

    async collect(): Promise<unknown[]> {
        let results = this.items;

        if (this.indexFilter) {
            results = results.filter(this.indexFilter);
        }

        for (const filter of this.filters) {
            results = results.filter(filter);
        }

        return results;
    }
}

class IndexQueryBuilder {
    private conditions: Array<{ field: string; value: unknown }> = [];

    eq(field: string, value: unknown): IndexQueryBuilder {
        this.conditions.push({ field, value });
        return this;
    }

    build(): (item: unknown) => boolean {
        return (item: unknown) => {
            const record = item as Record<string, unknown>;
            return this.conditions.every((c) => record[c.field] === c.value);
        };
    }
}

class FilterQueryBuilder {
    field(name: string): FieldAccessor {
        return new FieldAccessor(name);
    }

    eq(accessor: FieldAccessor, value: unknown): FilterExpression {
        return new FilterExpression((item) => {
            const record = item as Record<string, unknown>;
            return record[accessor.fieldName] === value;
        });
    }

    neq(accessor: FieldAccessor, value: unknown): FilterExpression {
        return new FilterExpression((item) => {
            const record = item as Record<string, unknown>;
            return record[accessor.fieldName] !== value;
        });
    }

    and(...expressions: FilterExpression[]): FilterExpression {
        return new FilterExpression((item) =>
            expressions.every((e) => e.evaluate(item))
        );
    }

    or(...expressions: FilterExpression[]): FilterExpression {
        return new FilterExpression((item) =>
            expressions.some((e) => e.evaluate(item))
        );
    }

    gte(accessor: FieldAccessor, value: unknown): FilterExpression {
        return new FilterExpression((item) => {
            const record = item as Record<string, unknown>;
            return (record[accessor.fieldName] as number) >= (value as number);
        });
    }

    lte(accessor: FieldAccessor, value: unknown): FilterExpression {
        return new FilterExpression((item) => {
            const record = item as Record<string, unknown>;
            return (record[accessor.fieldName] as number) <= (value as number);
        });
    }

    gt(accessor: FieldAccessor, value: unknown): FilterExpression {
        return new FilterExpression((item) => {
            const record = item as Record<string, unknown>;
            return (record[accessor.fieldName] as number) > (value as number);
        });
    }

    lt(accessor: FieldAccessor, value: unknown): FilterExpression {
        return new FilterExpression((item) => {
            const record = item as Record<string, unknown>;
            return (record[accessor.fieldName] as number) < (value as number);
        });
    }
}

class FieldAccessor {
    constructor(public fieldName: string) {}
}

class FilterExpression {
    constructor(private predicate: (item: unknown) => boolean) {}

    evaluate(item: unknown): boolean {
        return this.predicate(item);
    }
}

// Create mock context from data store
export function createMockContext(store: TestDataStore): MockConvexContext {
    return {
        db: {
            get: vi.fn((id: string) => Promise.resolve(store.get(id))),
            insert: vi.fn((table: string, doc: Record<string, unknown>) =>
                Promise.resolve(store.insert(table, doc))
            ),
            patch: vi.fn((id: string, updates: Record<string, unknown>) => {
                store.patch(id, updates);
                return Promise.resolve();
            }),
            delete: vi.fn((id: string) => {
                store.delete(id);
                return Promise.resolve();
            }),
            query: vi.fn((table: string) => store.query(table)),
        },
        auth: {
            getUserIdentity: vi.fn(() => Promise.resolve(null)),
        },
    };
}

// Type definitions for seed data
interface TenantData {
    name: string;
    slug: string;
    domain?: string;
    status: string;
    settings: Record<string, unknown>;
    seatLimits: Record<string, unknown>;
    featureFlags: Record<string, unknown>;
    enabledCategories: string[];
}

interface UserData {
    tenantId?: string;
    email: string;
    name?: string;
    role: string;
    status: string;
    metadata: Record<string, unknown>;
}

interface ResourceData {
    tenantId?: string;
    name: string;
    slug: string;
    categoryKey: string;
    status: string;
    timeMode: string;
    features: unknown[];
    requiresApproval: boolean;
    capacity?: number;
    images: unknown[];
    pricing: Record<string, unknown>;
    metadata: Record<string, unknown>;
}

interface BookingData {
    tenantId?: string;
    resourceId: string;
    userId: string;
    startTime: number;
    endTime: number;
    status: string;
    totalPrice: number;
    currency: string;
    version: number;
    submittedAt: number;
    metadata: Record<string, unknown>;
}

interface RoleData {
    tenantId?: string;
    name: string;
    description?: string;
    permissions: string[];
    isDefault: boolean;
    isSystem: boolean;
}

interface OrganizationData {
    tenantId?: string;
    name: string;
    slug: string;
    type: string;
    parentId?: string;
    metadata: Record<string, unknown>;
}

interface AmenityGroupData {
    tenantId?: string;
    name: string;
    description?: string;
    icon?: string;
    isActive: boolean;
    displayOrder: number;
}

interface AmenityData {
    tenantId?: string;
    name: string;
    description?: string;
    icon?: string;
    groupId?: string;
    isActive: boolean;
    isHighlighted: boolean;
    displayOrder: number;
}

interface AddonData {
    tenantId?: string;
    name: string;
    description?: string;
    icon?: string;
    category?: string;
    price: number;
    priceType?: string;
    maxQuantity?: number;
    isActive: boolean;
}

interface PricingGroupData {
    tenantId?: string;
    name: string;
    description?: string;
    isActive: boolean;
    isDefault: boolean;
    priority: number;
}

interface ResourcePricingData {
    tenantId?: string;
    resourceId: string;
    pricingGroupId?: string;
    basePrice: number;
    pricePerHour?: number;
    minDuration?: number;
    maxDuration?: number;
    currency: string;
    isActive: boolean;
}

interface PaymentData {
    tenantId?: string;
    bookingId?: string;
    userId?: string;
    provider: string;
    reference: string;
    externalId?: string;
    amount: number;
    currency: string;
    description?: string;
    status: string;
    redirectUrl?: string;
    capturedAmount?: number;
    refundedAmount?: number;
    metadata?: Record<string, unknown>;
    createdAt: number;
    updatedAt: number;
}

interface OAuthStateData {
    state: string;
    provider: string;
    appOrigin: string;
    returnPath: string;
    appId: string;
    signicatSessionId?: string;
    createdAt: number;
    expiresAt: number;
    consumed: boolean;
}

interface SessionData {
    userId: string;
    token: string;
    appId?: string;
    provider: string;
    expiresAt: number;
    lastActiveAt: number;
    isActive: boolean;
}

export type {
    TenantData,
    UserData,
    ResourceData,
    BookingData,
    RoleData,
    OrganizationData,
    AmenityGroupData,
    AmenityData,
    AddonData,
    PricingGroupData,
    ResourcePricingData,
    PaymentData,
    OAuthStateData,
    SessionData,
};
