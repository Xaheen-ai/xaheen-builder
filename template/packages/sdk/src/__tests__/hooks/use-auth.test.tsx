/**
 * useAuth Hook Tests
 *
 * Tests for the unified auth hook using Convex mutations.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { ConvexProvider } from 'convex/react';
import {
    mockConvexClient,
    mockAuthSuccessResponse,
} from '../mocks/convex';

// Mock convex/react module
vi.mock('convex/react', async () => {
    const actual = await vi.importActual('convex/react');
    return {
        ...actual,
        useMutation: vi.fn(),
    };
});

import { useMutation } from 'convex/react';
import { useAuth } from '@/hooks/use-auth';

// Test wrapper with ConvexProvider
const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => (
        <ConvexProvider client={mockConvexClient as never}>
            {children}
        </ConvexProvider>
    );
};

describe('useAuth', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('should start with no user when localStorage is empty', () => {
        const mockMutation = vi.fn();
        vi.mocked(useMutation).mockReturnValue(mockMutation as never);

        const { result } = renderHook(() => useAuth(), {
            wrapper: createWrapper(),
        });

        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('should restore user from localStorage on mount', () => {
        const storedUser = { id: 'u1', email: 'test@example.com', name: 'Test' };
        localStorage.setItem('xaheen_user', JSON.stringify(storedUser));

        const mockMutation = vi.fn();
        vi.mocked(useMutation).mockReturnValue(mockMutation as never);

        const { result } = renderHook(() => useAuth(), {
            wrapper: createWrapper(),
        });

        expect(result.current.user).toEqual(storedUser);
        expect(result.current.isAuthenticated).toBe(true);
    });

    it('should sign in with password via Convex mutation', async () => {
        const mockSignIn = vi.fn().mockResolvedValue(mockAuthSuccessResponse);
        const mockDemo = vi.fn();
        vi.mocked(useMutation)
            .mockReturnValueOnce(mockSignIn as never)
            .mockReturnValueOnce(mockDemo as never);

        const { result } = renderHook(() => useAuth(), {
            wrapper: createWrapper(),
        });

        await act(async () => {
            await result.current.signIn('test@example.com', 'password123');
        });

        expect(mockSignIn).toHaveBeenCalledWith({
            email: 'test@example.com',
            password: 'password123',
        });
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.user?.email).toBe('test@example.com');
    });

    it('should handle sign in failure', async () => {
        const mockSignIn = vi.fn().mockResolvedValue({
            success: false,
            error: 'Invalid credentials',
        });
        const mockDemo = vi.fn();
        vi.mocked(useMutation)
            .mockReturnValueOnce(mockSignIn as never)
            .mockReturnValueOnce(mockDemo as never);

        const { result } = renderHook(() => useAuth(), {
            wrapper: createWrapper(),
        });

        await act(async () => {
            try {
                await result.current.signIn('wrong@example.com', 'bad');
            } catch {
                // Expected
            }
        });

        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.error?.message).toBe('Invalid credentials');
    });

    it('should sign in as demo via Convex mutation', async () => {
        const mockSignIn = vi.fn();
        const mockDemo = vi.fn().mockResolvedValue(mockAuthSuccessResponse);
        vi.mocked(useMutation)
            .mockReturnValueOnce(mockSignIn as never)
            .mockReturnValueOnce(mockDemo as never);

        const { result } = renderHook(() => useAuth(), {
            wrapper: createWrapper(),
        });

        await act(async () => {
            await result.current.signInAsDemo();
        });

        expect(mockDemo).toHaveBeenCalledWith({});
        expect(result.current.isAuthenticated).toBe(true);
    });

    it('should sign out and clear localStorage', async () => {
        const storedUser = { id: 'u1', email: 'test@example.com', name: 'Test' };
        localStorage.setItem('xaheen_user', JSON.stringify(storedUser));
        localStorage.setItem('xaheen_session_token', 'token');

        const mockMutation = vi.fn();
        vi.mocked(useMutation).mockReturnValue(mockMutation as never);

        const { result } = renderHook(() => useAuth(), {
            wrapper: createWrapper(),
        });

        expect(result.current.isAuthenticated).toBe(true);

        act(() => {
            result.current.signOut();
        });

        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.user).toBeNull();
        expect(localStorage.getItem('xaheen_user')).toBeNull();
        expect(localStorage.getItem('xaheen_session_token')).toBeNull();
    });

    it('should expose signIn, signInAsDemo, signInWithOAuth, and signOut functions', () => {
        const mockMutation = vi.fn();
        vi.mocked(useMutation).mockReturnValue(mockMutation as never);

        const { result } = renderHook(() => useAuth(), {
            wrapper: createWrapper(),
        });

        expect(typeof result.current.signIn).toBe('function');
        expect(typeof result.current.signInAsDemo).toBe('function');
        expect(typeof result.current.signInWithOAuth).toBe('function');
        expect(typeof result.current.signOut).toBe('function');
    });
});
