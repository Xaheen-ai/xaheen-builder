import { createContext, useContext } from 'react';

// Backoffice-specific user type
export interface BackofficeUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'saksbehandler';
}

export type BackofficeRole = 'admin' | 'saksbehandler';

export interface AuthContextType {
  user: BackofficeUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSaksbehandler: boolean;
  login: (provider?: 'idporten' | 'microsoft' | 'vipps') => void;
  logout: () => Promise<void>;
  checkRole: (role: BackofficeRole) => boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
