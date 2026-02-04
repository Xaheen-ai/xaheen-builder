import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext, type AuthContextType, type BackofficeUser, type BackofficeRole } from '../hooks/useAuth';
import { useAuth as useSdkAuth } from '@xaheen/sdk';

/**
 * Mock Authentication Users — only used when VITE_USE_MOCK_AUTH is enabled.
 */
const MOCK_ADMIN_USER: BackofficeUser = {
  id: 'kari-nordmann-001',
  name: 'Kari Nordmann',
  email: 'admin@skien.kommune.no',
  role: 'admin',
};

const MOCK_USER: BackofficeUser = {
  id: '01a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c',
  name: 'Ola Hansen',
  email: 'ola.hansen@kommune.no',
  role: 'saksbehandler',
};

const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH !== 'false';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [mockUser, setMockUser] = useState<BackofficeUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // SDK auth — always initialized
  const sdk = useSdkAuth({ appId: 'minside' });

  // Determine effective user: mock or SDK
  const user: BackofficeUser | null = useMemo(() => {
    if (USE_MOCK_AUTH) {
      return mockUser;
    }

    if (!sdk.user) return null;

    return {
      id: sdk.user.id,
      name: sdk.user.name || sdk.user.email,
      email: sdk.user.email,
      role: (sdk.user.role === 'admin' ? 'admin' : 'saksbehandler') as BackofficeRole,
    };
  }, [mockUser, sdk.user]);

  // Check for existing session on mount
  useEffect(() => {
    if (USE_MOCK_AUTH) {
      const savedUser = localStorage.getItem('minside_user') || localStorage.getItem('backoffice_mock_user');
      if (savedUser) {
        try {
          setMockUser(JSON.parse(savedUser));
        } catch { /* ignore */ }
      }
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((provider: 'idporten' | 'microsoft' | 'vipps' = 'idporten') => {
    if (USE_MOCK_AUTH) {
      const selectedUser = provider === 'microsoft' ? MOCK_ADMIN_USER : MOCK_USER;
      localStorage.setItem('minside_user', JSON.stringify(selectedUser));
      setMockUser(selectedUser);
      navigate('/');
      return;
    }

    // Real OAuth via SDK
    sdk.signInWithOAuth(provider);
  }, [navigate, sdk]);

  const logout = useCallback(async () => {
    if (USE_MOCK_AUTH) {
      localStorage.removeItem('backoffice_mock_user');
      localStorage.removeItem('minside_user');
      setMockUser(null);
      navigate('/login');
      return;
    }

    await sdk.signOut();
    navigate('/login');
  }, [navigate, sdk]);

  const checkRole = useCallback(
    (role: BackofficeRole): boolean => {
      if (!user) return false;
      if (role === 'admin') return user.role === 'admin';
      if (role === 'saksbehandler')
        return user.role === 'admin' || user.role === 'saksbehandler';
      return true;
    },
    [user]
  );

  const effectiveIsLoading = USE_MOCK_AUTH ? isLoading : (isLoading || sdk.isLoading);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isLoading: effectiveIsLoading,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      isSaksbehandler:
        user?.role === 'admin' || user?.role === 'saksbehandler',
      login,
      logout,
      checkRole,
    }),
    [user, effectiveIsLoading, login, logout, checkRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
