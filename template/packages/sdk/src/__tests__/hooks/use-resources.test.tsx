/**
 * useResources Hook Tests
 *
 * Tests for the Convex resources hooks with mocked Convex client.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { ConvexProvider } from 'convex/react';
import type { Resource } from '@/types';
import {
    mockResources,
    MOCK_TENANT_ID,
    MOCK_RESOURCE_ID,
    mockConvexClient,
} from '../mocks/convex';

// Mock convex/react module
vi.mock('convex/react', async () => {
    const actual = await vi.importActual('convex/react');
    return {
        ...actual,
        useQuery: vi.fn(),
        useMutation: vi.fn(),
    };
});

// Import after mocking
import { useQuery, useMutation } from 'convex/react';
import {
    useResources,
    useResource,
    useCreateResource,
    useUpdateResource,
    useDeleteResource,
    usePublishResource,
    useUnpublishResource,
} from '@/hooks/use-resources';

// Test wrapper with ConvexProvider
const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => (
        <ConvexProvider client={mockConvexClient as never}>
            {children}
        </ConvexProvider>
    );
};

describe('useResources', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return loading state initially', () => {
        vi.mocked(useQuery).mockReturnValue(undefined);

        const { result } = renderHook(
            () => useResources({ tenantId: MOCK_TENANT_ID }),
            { wrapper: createWrapper() }
        );

        expect(result.current.isLoading).toBe(true);
        expect(result.current.resources).toEqual([]);
        expect(result.current.error).toBeNull();
    });

    it('should return resources when loaded', async () => {
        vi.mocked(useQuery).mockReturnValue(mockResources);

        const { result } = renderHook(
            () => useResources({ tenantId: MOCK_TENANT_ID }),
            { wrapper: createWrapper() }
        );

        expect(result.current.isLoading).toBe(false);
        expect(result.current.resources).toHaveLength(2);
        expect(result.current.resources[0].name).toBe('Meeting Room A');
        expect(result.current.resources[1].name).toBe('Conference Room B');
    });

    it('should map Convex data to Resource type correctly', () => {
        vi.mocked(useQuery).mockReturnValue(mockResources);

        const { result } = renderHook(
            () => useResources({ tenantId: MOCK_TENANT_ID }),
            { wrapper: createWrapper() }
        );

        const resource = result.current.resources[0];
        expect(resource).toMatchObject({
            id: expect.any(String),
            tenantId: expect.any(String),
            name: 'Meeting Room A',
            slug: 'meeting-room-a',
            categoryKey: 'LOKALER',
            status: 'published',
            capacity: 20,
        });
        expect(resource.createdAt).toBeDefined();
        expect(resource.updatedAt).toBeDefined();
    });

    it('should filter by categoryKey', () => {
        vi.mocked(useQuery).mockReturnValue(mockResources);

        renderHook(
            () =>
                useResources({
                    tenantId: MOCK_TENANT_ID,
                    categoryKey: 'LOKALER',
                }),
            { wrapper: createWrapper() }
        );

        expect(useQuery).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ categoryKey: 'LOKALER' })
        );
    });

    it('should filter by status', () => {
        vi.mocked(useQuery).mockReturnValue(mockResources);

        renderHook(
            () =>
                useResources({
                    tenantId: MOCK_TENANT_ID,
                    status: 'published',
                }),
            { wrapper: createWrapper() }
        );

        expect(useQuery).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ status: 'published' })
        );
    });

    it('should respect limit parameter', () => {
        vi.mocked(useQuery).mockReturnValue(mockResources);

        renderHook(
            () =>
                useResources({
                    tenantId: MOCK_TENANT_ID,
                    limit: 10,
                }),
            { wrapper: createWrapper() }
        );

        expect(useQuery).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ limit: 10 })
        );
    });
});

describe('useResource', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return loading state for valid resource ID', () => {
        vi.mocked(useQuery).mockReturnValue(undefined);

        const { result } = renderHook(
            () => useResource(MOCK_RESOURCE_ID),
            { wrapper: createWrapper() }
        );

        expect(result.current.isLoading).toBe(true);
        expect(result.current.resource).toBeNull();
    });

    it('should return resource when loaded', () => {
        vi.mocked(useQuery).mockReturnValue({
            ...mockResources[0],
            amenities: [],
            addons: [],
            pricing: [],
        });

        const { result } = renderHook(
            () => useResource(MOCK_RESOURCE_ID),
            { wrapper: createWrapper() }
        );

        expect(result.current.isLoading).toBe(false);
        expect(result.current.resource).not.toBeNull();
        expect(result.current.resource?.name).toBe('Meeting Room A');
    });

    it('should skip query when resourceId is undefined', () => {
        vi.mocked(useQuery).mockReturnValue(undefined);

        const { result } = renderHook(() => useResource(undefined), {
            wrapper: createWrapper(),
        });

        expect(result.current.isLoading).toBe(false);
        expect(result.current.resource).toBeNull();
        expect(useQuery).toHaveBeenCalledWith(expect.anything(), 'skip');
    });
});

describe('useCreateResource', () => {
    it('should return createResource mutation function', () => {
        const mockMutation = vi.fn().mockResolvedValue({ id: 'new-resource-id' });
        vi.mocked(useMutation).mockReturnValue(mockMutation as never);

        const { result } = renderHook(() => useCreateResource(), {
            wrapper: createWrapper(),
        });

        expect(result.current.createResource).toBeDefined();
        expect(typeof result.current.createResource).toBe('function');
    });
});

describe('useUpdateResource', () => {
    it('should return updateResource mutation function', () => {
        const mockMutation = vi.fn().mockResolvedValue({ success: true });
        vi.mocked(useMutation).mockReturnValue(mockMutation as never);

        const { result } = renderHook(() => useUpdateResource(), {
            wrapper: createWrapper(),
        });

        expect(result.current.updateResource).toBeDefined();
        expect(typeof result.current.updateResource).toBe('function');
    });
});

describe('useDeleteResource', () => {
    it('should return deleteResource mutation function', () => {
        const mockMutation = vi.fn().mockResolvedValue({ success: true });
        vi.mocked(useMutation).mockReturnValue(mockMutation as never);

        const { result } = renderHook(() => useDeleteResource(), {
            wrapper: createWrapper(),
        });

        expect(result.current.deleteResource).toBeDefined();
        expect(typeof result.current.deleteResource).toBe('function');
    });

    it('should call mutation with correct resource ID', async () => {
        const mockMutation = vi.fn().mockResolvedValue({ success: true });
        vi.mocked(useMutation).mockReturnValue(mockMutation as never);

        const { result } = renderHook(() => useDeleteResource(), {
            wrapper: createWrapper(),
        });

        await result.current.deleteResource(MOCK_RESOURCE_ID);

        expect(mockMutation).toHaveBeenCalledWith({ id: MOCK_RESOURCE_ID });
    });
});

describe('usePublishResource', () => {
    it('should return publishResource mutation function', () => {
        const mockMutation = vi.fn().mockResolvedValue({ success: true });
        vi.mocked(useMutation).mockReturnValue(mockMutation as never);

        const { result } = renderHook(() => usePublishResource(), {
            wrapper: createWrapper(),
        });

        expect(result.current.publishResource).toBeDefined();
    });

    it('should call mutation with correct resource ID', async () => {
        const mockMutation = vi.fn().mockResolvedValue({ success: true });
        vi.mocked(useMutation).mockReturnValue(mockMutation as never);

        const { result } = renderHook(() => usePublishResource(), {
            wrapper: createWrapper(),
        });

        await result.current.publishResource(MOCK_RESOURCE_ID);

        expect(mockMutation).toHaveBeenCalledWith({ id: MOCK_RESOURCE_ID });
    });
});

describe('useUnpublishResource', () => {
    it('should return unpublishResource mutation function', () => {
        const mockMutation = vi.fn().mockResolvedValue({ success: true });
        vi.mocked(useMutation).mockReturnValue(mockMutation as never);

        const { result } = renderHook(() => useUnpublishResource(), {
            wrapper: createWrapper(),
        });

        expect(result.current.unpublishResource).toBeDefined();
    });

    it('should call mutation with correct resource ID', async () => {
        const mockMutation = vi.fn().mockResolvedValue({ success: true });
        vi.mocked(useMutation).mockReturnValue(mockMutation as never);

        const { result } = renderHook(() => useUnpublishResource(), {
            wrapper: createWrapper(),
        });

        await result.current.unpublishResource(MOCK_RESOURCE_ID);

        expect(mockMutation).toHaveBeenCalledWith({ id: MOCK_RESOURCE_ID });
    });
});
