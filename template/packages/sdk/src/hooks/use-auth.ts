/**
 * Xaheen SDK - Auth Hook
 *
 * Unified authentication hook using Convex mutations + session validation.
 * Supports password sign-in, demo sign-in, and OAuth redirect flow.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { useMutation, useAction, useQuery } from "convex/react";
import { api } from "../convex-api";
import type { AuthUser } from "../types";

// ============================================================================
// Storage key helpers — per-app isolation
// ============================================================================

function storageKeys(appId: string) {
    return {
        user: `xaheen_${appId}_user`,
        token: `xaheen_${appId}_session_token`,
        tenant: `xaheen_${appId}_tenant_id`,
    };
}

// Legacy keys for backward compat
const LEGACY_STORAGE_KEY_USER = "xaheen_user";
const LEGACY_STORAGE_KEY_TOKEN = "xaheen_session_token";
const LEGACY_STORAGE_KEY_TENANT = "xaheen_tenant_id";

// ============================================================================
// Types
// ============================================================================

interface UseAuthOptions {
    appId?: string;
}

interface UseAuthResult {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: Error | null;
    sessionToken: string | null;
    signIn: (email: string, password: string) => Promise<void>;
    signInAsDemo: () => Promise<void>;
    signInWithOAuth: (provider: string) => Promise<void>;
    signOut: () => Promise<void>;
}

// ============================================================================
// Hook
// ============================================================================

export function useAuth(options?: UseAuthOptions): UseAuthResult {
    const appId = options?.appId || "default";
    const keys = storageKeys(appId);

    const [user, setUser] = useState<AuthUser | null>(() => {
        try {
            const stored = localStorage.getItem(keys.user) ||
                localStorage.getItem(LEGACY_STORAGE_KEY_USER);
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });
    const [sessionToken, setSessionToken] = useState<string | null>(() => {
        try {
            return localStorage.getItem(keys.token) ||
                localStorage.getItem(LEGACY_STORAGE_KEY_TOKEN);
        } catch {
            return null;
        }
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    // Track whether initial session validation is done
    const initialValidationDone = useRef(false);

    const signInWithPasswordMutation = useMutation(api.auth.password.signInWithPassword);
    const signInAsDemoMutation = useMutation(api.auth.password.signInAsDemo);
    const deleteSessionMutation = useMutation(api.auth.sessions.deleteSession);
    const startOAuthAction = useAction(api.auth.start.startOAuth);

    // Validate existing session reactively via Convex query
    const sessionValidation = useQuery(
        api.auth.sessions.validateSessionByToken,
        sessionToken ? { token: sessionToken } : "skip"
    );

    // When session validation returns, update user state
    useEffect(() => {
        if (!sessionToken) {
            // No token — nothing to validate
            initialValidationDone.current = true;
            return;
        }

        if (sessionValidation === undefined) {
            // Query is still loading
            return;
        }

        initialValidationDone.current = true;

        if (sessionValidation === null) {
            // Session expired or invalid — clear everything
            setUser(null);
            setSessionToken(null);
            localStorage.removeItem(keys.user);
            localStorage.removeItem(keys.token);
            localStorage.removeItem(keys.tenant);
            // Also clear legacy keys
            localStorage.removeItem(LEGACY_STORAGE_KEY_USER);
            localStorage.removeItem(LEGACY_STORAGE_KEY_TOKEN);
            localStorage.removeItem(LEGACY_STORAGE_KEY_TENANT);
        } else {
            // Session is valid — update user from server data
            const serverUser: AuthUser = {
                id: String(sessionValidation.user.id),
                email: sessionValidation.user.email,
                name: sessionValidation.user.name || sessionValidation.user.displayName,
                avatarUrl: sessionValidation.user.avatarUrl,
                tenantId: sessionValidation.tenant?.id
                    ? String(sessionValidation.tenant.id)
                    : undefined,
                role: sessionValidation.user.role,
            };
            setUser(serverUser);
            localStorage.setItem(keys.user, JSON.stringify(serverUser));
        }
    }, [sessionValidation, sessionToken, keys.user, keys.token, keys.tenant]);

    const persistSession = useCallback(
        (authUser: AuthUser, token: string, tenantId?: string) => {
            setUser(authUser);
            setSessionToken(token);
            localStorage.setItem(keys.user, JSON.stringify(authUser));
            localStorage.setItem(keys.token, token);
            if (tenantId) {
                localStorage.setItem(keys.tenant, tenantId);
            }
        },
        [keys.user, keys.token, keys.tenant]
    );

    const signIn = useCallback(
        async (email: string, password: string) => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await signInWithPasswordMutation({
                    email,
                    password,
                    appId,
                });
                if (!result.success) {
                    throw new Error(result.error || "Invalid email or password");
                }
                const authUser: AuthUser = {
                    id: String(result.user?.id ?? ""),
                    email: result.user?.email || email,
                    name: result.user?.name || result.user?.displayName,
                    tenantId: result.tenant?.id
                        ? String(result.tenant.id)
                        : undefined,
                    role: result.user?.role,
                };
                persistSession(
                    authUser,
                    result.sessionToken!,
                    result.tenant?.id ? String(result.tenant.id) : undefined
                );
            } catch (err) {
                const e = err instanceof Error ? err : new Error("Sign in failed");
                setError(e);
                throw e;
            } finally {
                setIsLoading(false);
            }
        },
        [signInWithPasswordMutation, persistSession, appId]
    );

    const signInAsDemo = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await signInAsDemoMutation({ appId });
            if (!result.success) {
                throw new Error(result.error || "No demo users available");
            }
            const authUser: AuthUser = {
                id: String(result.user?.id ?? ""),
                email: result.user?.email || "",
                name: result.user?.name || result.user?.displayName,
                tenantId: result.tenant?.id
                    ? String(result.tenant.id)
                    : undefined,
                role: result.user?.role,
            };
            persistSession(
                authUser,
                result.sessionToken!,
                result.tenant?.id ? String(result.tenant.id) : undefined
            );
        } catch (err) {
            const e = err instanceof Error ? err : new Error("Demo sign in failed");
            setError(e);
            throw e;
        } finally {
            setIsLoading(false);
        }
    }, [signInAsDemoMutation, persistSession, appId]);

    const signInWithOAuth = useCallback(
        async (provider: string) => {
            setIsLoading(true);
            setError(null);
            try {
                const appOrigin = window.location.origin;
                const returnPath = window.location.pathname;

                const result = await startOAuthAction({
                    provider,
                    appOrigin,
                    returnPath,
                    appId,
                });

                // Redirect to OAuth provider
                window.location.href = result.authUrl;
            } catch (err) {
                const e =
                    err instanceof Error ? err : new Error("OAuth start failed");
                setError(e);
                setIsLoading(false);
                throw e;
            }
            // Don't setIsLoading(false) — page is navigating away
        },
        [startOAuthAction, appId]
    );

    const signOut = useCallback(async () => {
        // Delete server session if we have a token
        if (sessionToken) {
            try {
                await deleteSessionMutation({ token: sessionToken });
            } catch {
                // Ignore errors — session might already be expired
            }
        }

        setUser(null);
        setSessionToken(null);
        setError(null);
        localStorage.removeItem(keys.user);
        localStorage.removeItem(keys.token);
        localStorage.removeItem(keys.tenant);
        // Also clear legacy keys
        localStorage.removeItem(LEGACY_STORAGE_KEY_USER);
        localStorage.removeItem(LEGACY_STORAGE_KEY_TOKEN);
        localStorage.removeItem(LEGACY_STORAGE_KEY_TENANT);
    }, [deleteSessionMutation, sessionToken, keys.user, keys.token, keys.tenant]);

    return {
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        sessionToken,
        signIn,
        signInAsDemo,
        signInWithOAuth,
        signOut,
    };
}

// ============================================================================
// Tier 1 Adapter Hooks — digdir-compatible API surface
// ============================================================================

/**
 * Session query adapter.
 * Returns `{ data: { data: { user, token } } | null, isLoading, error }`.
 */
export function useSession() {
    const { user, isAuthenticated, isLoading, error, sessionToken } = useAuth();

    const data =
        isAuthenticated && user
            ? { data: { user, token: sessionToken ?? "" } }
            : null;

    return { data, isLoading, error };
}

/** Helper to build a mutation-shaped return value from an async function. */
function useMutationAdapter<TArgs extends unknown[], TResult = void>(
    fn: (...args: TArgs) => Promise<TResult>
) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const mutateAsync = useCallback(
        async (...args: TArgs): Promise<TResult> => {
            setIsLoading(true);
            setError(null);
            setIsSuccess(false);
            try {
                const result = await fn(...args);
                setIsSuccess(true);
                return result;
            } catch (err) {
                const e = err instanceof Error ? err : new Error(String(err));
                setError(e);
                throw e;
            } finally {
                setIsLoading(false);
            }
        },
        [fn]
    );

    const mutate = useCallback(
        (...args: TArgs) => {
            mutateAsync(...args).catch(() => {
                /* swallow — error is captured in state */
            });
        },
        [mutateAsync]
    );

    return { mutate, mutateAsync, isLoading, error, isSuccess };
}

/**
 * Login mutation adapter.
 * Accepts `{ email, password? }` and delegates to the underlying `signIn`.
 */
export function useLogin() {
    const { signIn } = useAuth();

    const loginFn = useCallback(
        async (credentials: { email: string; password?: string }) => {
            await signIn(credentials.email, credentials.password ?? "");
        },
        [signIn]
    );

    return useMutationAdapter(loginFn);
}

/**
 * Email login mutation adapter.
 * Accepts `{ email, password }` and delegates to `signIn`.
 */
export function useEmailLogin() {
    const { signIn } = useAuth();

    const loginFn = useCallback(
        async (credentials: { email: string; password: string }) => {
            await signIn(credentials.email, credentials.password);
        },
        [signIn]
    );

    return useMutationAdapter(loginFn);
}

/**
 * Logout mutation adapter.
 */
export function useLogout() {
    const { signOut } = useAuth();

    const logoutFn = useCallback(async () => {
        await signOut();
    }, [signOut]);

    return useMutationAdapter(logoutFn);
}

/**
 * Refresh-token mutation adapter (stub).
 * Convex sessions don't use refresh tokens — this is a no-op for API compat.
 */
export function useRefreshToken() {
    const noopFn = useCallback(async () => {
        // No-op: Convex manages session lifetime automatically.
    }, []);

    return useMutationAdapter(noopFn);
}

/**
 * Auth providers query adapter.
 * Returns all supported providers.
 */
export function useAuthProviders() {
    return {
        data: {
            data: [
                "password",
                "demo",
                "idporten",
                "vipps",
                "microsoft",
            ] as const,
        },
        isLoading: false,
        error: null,
    };
}
