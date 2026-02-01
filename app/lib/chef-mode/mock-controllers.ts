/**
 * Mock Controllers for Chef Mode Preview
 */

import type { PageSpec } from "~/lib/chef-mode/compiler-hook";

const MOCK_GENERATORS: Record<string, () => unknown> = {
    "*.list": () => ({ data: generateMockList(5), isLoading: false, error: null, total: 5 }),
    "*.detail": () => ({ data: generateMockEntity(), isLoading: false, error: null }),
    "*.stats": () => ({ total: 1000, active: 500, pending: 100, completed: 400 }),
    "*.form": () => ({ data: {}, errors: {}, isSubmitting: false, isDirty: false }),
};

function generateMockList(count: number): Array<Record<string, unknown>> {
    return Array.from({ length: count }, (_, i) => ({
        id: `mock-${i + 1}`, name: `Item ${i + 1}`, email: `item${i + 1}@example.com`,
        status: ["active", "pending", "inactive"][i % 3], createdAt: new Date().toISOString(),
    }));
}

function generateMockEntity(): Record<string, unknown> {
    return { id: "mock-1", name: "Sample Entity", email: "sample@example.com", status: "active", createdAt: new Date().toISOString() };
}

function matchGenerator(ref: string): (() => unknown) | null {
    if (MOCK_GENERATORS[ref]) return MOCK_GENERATORS[ref]!;
    const suffix = ref.split(".").pop();
    return suffix ? MOCK_GENERATORS[`*.${suffix}`] ?? null : null;
}

export function generateMockData(pageSpec: PageSpec): Record<string, unknown> {
    const data: Record<string, unknown> = {};
    if (!pageSpec.controllerRefs) return data;
    for (const ref of pageSpec.controllerRefs) {
        const generator = matchGenerator(ref);
        data[ref] = generator ? generator() : { data: [], isLoading: false, error: null };
    }
    return data;
}

export function createMockViewModel(controllerData: Record<string, unknown>): Record<string, unknown> {
    const vm: Record<string, unknown> = {};
    for (const [ref, data] of Object.entries(controllerData)) {
        const key = ref.split(".").pop();
        if (key && typeof data === "object" && data !== null) {
            const record = data as Record<string, unknown>;
            vm[key] = "data" in record ? record["data"] : data;
            if ("isLoading" in record) vm[`${key}Loading`] = record["isLoading"];
            if ("error" in record) vm[`${key}Error`] = record["error"];
        } else if (key) vm[key] = data;
    }
    return vm;
}

export function registerMockGenerator(pattern: string, generator: () => unknown): void {
    MOCK_GENERATORS[pattern] = generator;
}
