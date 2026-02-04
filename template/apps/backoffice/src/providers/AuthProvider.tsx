import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext, type AuthContextType, type BackofficeUser, type BackofficeRole } from '../hooks/useAuth';
import { useAuth as useSdkAuth } from '@xaheen/sdk';

// =============================================================================
// Local Storage Keys
// =============================================================================

const ROLE_STORAGE_KEYS = {
  EFFECTIVE_ROLE: 'backoffice_effective_role',
  REMEMBER_CHOICE: 'backoffice_remember_role_choice',
} as const;

// =============================================================================
// Mock Users for Development
// =============================================================================

// Skien Kommune tenant ID from Convex database
const SKIEN_TENANT_ID = 'pd73zbrk04k7tnmygstv3sbbyh80frae';

const MOCK_ADMIN_USER: BackofficeUser = {
  id: 'mock-admin-001',
  name: 'Kari Nordmann',
  email: 'kari.nordmann@kommune.no',
  role: 'admin',
  grantedRoles: ['admin'],
  tenantId: SKIEN_TENANT_ID,
};

const MOCK_SAKSBEHANDLER_USER: BackofficeUser = {
  id: 'mock-saksbehandler-001',
  name: 'Ola Hansen',
  email: 'ola.hansen@kommune.no',
  role: 'saksbehandler',
  grantedRoles: ['case_handler'],
  tenantId: SKIEN_TENANT_ID,
};

const MOCK_DUAL_ROLE_USER: BackofficeUser = {
  id: 'mock-dual-001',
  name: 'Per Eriksen',
  email: 'per.eriksen@kommune.no',
  role: 'admin',
  grantedRoles: ['admin', 'case_handler'],
  tenantId: SKIEN_TENANT_ID,
};

const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH !== 'false';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [mockUser, setMockUser] = useState<BackofficeUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // SDK auth — always initialized, used when not in mock mode
  const sdk = useSdkAuth({ appId: 'backoffice' });

  // Determine effective user: mock or SDK
  const user: BackofficeUser | null = useMemo(() => {
    if (USE_MOCK_AUTH) {
      return mockUser;
    }

    if (!sdk.user) return null;

    // Map SDK user to BackofficeUser shape
    return {
      id: sdk.user.id,
      name: sdk.user.name || sdk.user.email,
      email: sdk.user.email,
      role: (sdk.user.role === 'admin' ? 'admin' : 'saksbehandler') as BackofficeRole,
      // grantedRoles come from RBAC — for now derive from role
      grantedRoles: sdk.user.role === 'admin' ? ['admin'] : ['case_handler'],
    };
  }, [USE_MOCK_AUTH, mockUser, sdk.user]);

  // Check for existing session on mount (mock mode only)
  useEffect(() => {
    if (USE_MOCK_AUTH) {
      const savedUser = localStorage.getItem('backoffice_mock_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          setMockUser(parsed);
          // Ensure tenantId is stored for SDK hooks
          if (parsed.tenantId) {
            localStorage.setItem('xaheen_backoffice_tenant_id', parsed.tenantId);
            localStorage.setItem('xaheen_backoffice_user', savedUser);
          }
        } catch { /* ignore */ }
      }
      setIsLoading(false);
    } else {
      // SDK handles loading state
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((provider: 'idporten' | 'microsoft' | 'dev-admin' | 'dev-dual' = 'idporten') => {
    if (USE_MOCK_AUTH) {
      let selectedUser: BackofficeUser;
      switch (provider) {
        case 'idporten':
        case 'dev-admin':
          selectedUser = MOCK_ADMIN_USER;
          break;
        case 'dev-dual':
          selectedUser = MOCK_DUAL_ROLE_USER;
          break;
        case 'microsoft':
        default:
          selectedUser = MOCK_SAKSBEHANDLER_USER;
          break;
      }
      localStorage.setItem('backoffice_mock_user', JSON.stringify(selectedUser));
      // Store tenantId for SDK hooks to resolve
      if (selectedUser.tenantId) {
        localStorage.setItem('xaheen_backoffice_tenant_id', selectedUser.tenantId);
        localStorage.setItem('xaheen_backoffice_user', JSON.stringify(selectedUser));
      }
      setMockUser(selectedUser);
      navigate('/');
      return;
    }

    // Real auth: map provider names to OAuth providers
    const oauthProvider = provider === 'dev-admin' ? 'idporten' :
                          provider === 'dev-dual' ? 'idporten' :
                          provider;
    sdk.signInWithOAuth(oauthProvider);
  }, [navigate, sdk]);

  const logout = useCallback(async () => {
    if (USE_MOCK_AUTH) {
      localStorage.removeItem('backoffice_mock_user');
      localStorage.removeItem('xaheen_backoffice_tenant_id');
      localStorage.removeItem('xaheen_backoffice_user');
      localStorage.removeItem(ROLE_STORAGE_KEYS.EFFECTIVE_ROLE);
      localStorage.removeItem(ROLE_STORAGE_KEYS.REMEMBER_CHOICE);
      setMockUser(null);
      navigate('/login');
      return;
    }

    // Real auth logout
    localStorage.removeItem(ROLE_STORAGE_KEYS.EFFECTIVE_ROLE);
    localStorage.removeItem(ROLE_STORAGE_KEYS.REMEMBER_CHOICE);
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
