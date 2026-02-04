/**
 * useAuth Hook — Web App
 *
 * Thin wrapper around SDK useAuth({ appId: "web" }).
 * Provides the same interface that the rest of the web app expects.
 */

import { useAuth as useSdkAuth } from '@xaheen/sdk';

interface User {
  id: string;
  name: string;
  email: string;
}

export function useAuth() {
  const sdk = useSdkAuth({ appId: 'web' });

  const user: User | null = sdk.user
    ? {
        id: sdk.user.id,
        name: sdk.user.name || sdk.user.email,
        email: sdk.user.email,
      }
    : null;

  return {
    isAuthenticated: sdk.isAuthenticated,
    isLoading: sdk.isLoading,
    user,
    login: (provider: 'idporten' | 'microsoft' | 'vipps', _returnTo?: string) => {
      sdk.signInWithOAuth(provider);
    },
    loginWithPassword: sdk.signIn,
    loginAsDemo: sdk.signInAsDemo,
    logout: () => {
      sdk.signOut();
    },
    handleAuthCallback: (userData: User) => {
      // Legacy — kept for backward compat but no longer primary path.
      // OAuth callback is now handled by the useOAuthCallback hook.
      localStorage.setItem('xaheen_web_user', JSON.stringify(userData));
    },
  };
}
