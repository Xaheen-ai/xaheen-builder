import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { Organization } from '@xaheen/sdk/types';
import { useOrganizations } from '@xaheen/sdk/hooks';

/**
 * Account Context Provider
 * Manages user account type (personal vs organization) and selected organization
 *
 * Features:
 * - Persist account selection in localStorage
 * - Fetch user's organizations from SDK
 * - Provide methods to switch between personal/organization mode
 * - Validate organization selection
 */

// =============================================================================
// Types
// =============================================================================

export type AccountType = 'personal' | 'organization';

/**
 * Dashboard context type for RBAC-based UI filtering
 * Used by Sidebar, ProtectedRoute, and other context-aware components
 */
export type DashboardContext = 'personal' | 'organization';

export interface AccountContextState {
  accountType: AccountType;
  selectedOrganization: Organization | null;
  organizations: Organization[];
  isLoadingOrganizations: boolean;
  hasSelectedAccount: boolean;
  rememberChoice: boolean;
  /** Message shown when user's organization membership was lost (e.g., removed from org) */
  lostOrganizationMessage: string | null;
}

export interface AccountContextValue extends AccountContextState {
  switchToPersonal: () => void;
  switchToOrganization: (organizationId: string) => void;
  getActiveAccount: () => ActiveAccount;
  markAccountAsSelected: () => void;
  setRememberChoice: (value: boolean) => void;
  /** Clear the lost organization message after it has been displayed */
  clearLostOrganizationMessage: () => void;
}

export interface ActiveAccount {
  type: AccountType;
  id: string;
  name: string;
  displayName: string;
}

// =============================================================================
// Context
// =============================================================================

const AccountContext = createContext<AccountContextValue | undefined>(undefined);

// =============================================================================
// Local Storage Keys
// =============================================================================

const STORAGE_KEYS = {
  ACCOUNT_TYPE: 'minside_account_type',
  SELECTED_ORG_ID: 'minside_selected_organization',
  HAS_SELECTED: 'minside_has_selected_account',
  REMEMBER_CHOICE: 'minside_remember_choice',
} as const;

// =============================================================================
// Provider Component
// =============================================================================

interface AccountContextProviderProps {
  children: React.ReactNode;
  userId?: string; // Optional user ID for personal account
  userName?: string; // Optional user name for personal account
}

export const AccountContextProvider: React.FC<AccountContextProviderProps> = ({
  children,
  userId = 'current-user',
  userName = 'Bruker',
}) => {
  // Fetch user's organizations from SDK
  const { data: organizationsResponse, isLoading: isLoadingOrganizations } = useOrganizations({
    status: 'active', // Only fetch active organizations
  });

  const organizations = organizationsResponse?.data ?? [];

  // State: Account type (personal or organization)
  const [accountType, setAccountType] = useState<AccountType>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.ACCOUNT_TYPE);
    return (stored === 'organization' || stored === 'personal') ? stored : 'personal';
  });

  // State: Selected organization
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(() => {
    const storedOrgId = localStorage.getItem(STORAGE_KEYS.SELECTED_ORG_ID);
    if (!storedOrgId) return null;

    // Will be validated once organizations are loaded
    return null;
  });

  // State: Remember choice preference for account selection
  // NOTE: Must be initialized before hasSelectedAccount to handle the edge case
  const [rememberChoice, setRememberChoice] = useState<boolean>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.REMEMBER_CHOICE);
    return stored === 'true';
  });

  // State: Has user made initial account selection
  // Auto-mark as selected to skip the modal - users can switch via the dropdown
  // EDGE CASE: If rememberChoice is true, automatically mark as selected
  const [hasSelectedAccount, setHasSelectedAccount] = useState<boolean>(() => {
    const storedRememberChoice = localStorage.getItem(STORAGE_KEYS.REMEMBER_CHOICE) === 'true';
    const stored = localStorage.getItem(STORAGE_KEYS.HAS_SELECTED);

    // Edge case: If rememberChoice is true, skip modal and restore persisted context
    if (storedRememberChoice) {
      localStorage.setItem(STORAGE_KEYS.HAS_SELECTED, 'true');
      return true;
    }

    if (stored === null) {
      // First time - auto-mark as selected
      localStorage.setItem(STORAGE_KEYS.HAS_SELECTED, 'true');
      return true;
    }
    return stored === 'true';
  });

  // State: Lost organization message (shown when user's org membership was lost)
  const [lostOrganizationMessage, setLostOrganizationMessage] = useState<string | null>(null);

  // =============================================================================
  // Context Validation
  // =============================================================================

  /**
   * Validates the stored context and returns the validated state.
   * - Checks if remembered orgId still exists in user's organizations
   * - Forces personal mode if no organizations available
   * - Forces personal mode if remembered org is no longer accessible
   */
  const validateContext = (
    storedAccountType: AccountType,
    storedOrgId: string | null,
    availableOrgs: Organization[]
  ): { accountType: AccountType; organization: Organization | null; forcePersonal: boolean } => {
    // Force personal if user has no organizations
    if (availableOrgs.length === 0) {
      return {
        accountType: 'personal',
        organization: null,
        forcePersonal: storedAccountType === 'organization',
      };
    }

    // If account type is personal, no org validation needed
    if (storedAccountType === 'personal') {
      return {
        accountType: 'personal',
        organization: null,
        forcePersonal: false,
      };
    }

    // Validate organization mode - check if remembered org still exists
    if (storedOrgId) {
      const org = availableOrgs.find(o => o.id === storedOrgId);
      if (org) {
        // Remembered org exists - valid
        return {
          accountType: 'organization',
          organization: org,
          forcePersonal: false,
        };
      }
    }

    // Organization mode selected but org not found - force personal
    return {
      accountType: 'personal',
      organization: null,
      forcePersonal: true,
    };
  };

  // Effect: Validate and restore context once organizations are loaded
  useEffect(() => {
    // Wait for organizations to finish loading
    if (isLoadingOrganizations) return;

    const storedAccountType = localStorage.getItem(STORAGE_KEYS.ACCOUNT_TYPE) as AccountType | null;
    const storedOrgId = localStorage.getItem(STORAGE_KEYS.SELECTED_ORG_ID);
    const currentAccountType = storedAccountType === 'organization' ? 'organization' : 'personal';

    // Validate the stored context
    const validated = validateContext(currentAccountType, storedOrgId, organizations);

    // Apply validated state
    if (validated.forcePersonal) {
      // Force personal mode - stored org no longer valid or no orgs available
      localStorage.removeItem(STORAGE_KEYS.SELECTED_ORG_ID);
      localStorage.setItem(STORAGE_KEYS.ACCOUNT_TYPE, 'personal');
      setAccountType('personal');
      setSelectedOrganization(null);

      // Edge case: Show notification that org membership was lost
      // This happens when user was removed from an organization or the org was deleted
      setLostOrganizationMessage(
        'Du har ikke lenger tilgang til den valgte organisasjonen. Du er nå i personlig modus.'
      );
    } else if (validated.accountType === 'organization' && validated.organization) {
      // Valid organization context
      setAccountType('organization');
      setSelectedOrganization(validated.organization);
    } else {
      // Personal mode (no changes needed if already personal)
      setAccountType('personal');
      setSelectedOrganization(null);
    }
  }, [isLoadingOrganizations, organizations]);

  // Method: Switch to personal account
  const switchToPersonal = () => {
    setAccountType('personal');
    setSelectedOrganization(null);
    localStorage.setItem(STORAGE_KEYS.ACCOUNT_TYPE, 'personal');
    localStorage.removeItem(STORAGE_KEYS.SELECTED_ORG_ID);
  };

  // Method: Switch to organization account
  const switchToOrganization = (organizationId: string) => {
    const org = organizations.find(o => o.id === organizationId);

    if (!org) {
      console.error(`Organization ${organizationId} not found`);
      return;
    }

    setAccountType('organization');
    setSelectedOrganization(org);
    localStorage.setItem(STORAGE_KEYS.ACCOUNT_TYPE, 'organization');
    localStorage.setItem(STORAGE_KEYS.SELECTED_ORG_ID, organizationId);
  };

  // Method: Get active account details
  const getActiveAccount = (): ActiveAccount => {
    if (accountType === 'organization' && selectedOrganization) {
      return {
        type: 'organization',
        id: selectedOrganization.id,
        name: selectedOrganization.name,
        displayName: selectedOrganization.name,
      };
    }

    return {
      type: 'personal',
      id: userId,
      name: userName,
      displayName: userName,
    };
  };

  // Method: Mark that user has made initial account selection
  const markAccountAsSelected = () => {
    setHasSelectedAccount(true);
    localStorage.setItem(STORAGE_KEYS.HAS_SELECTED, 'true');
  };

  // Method: Set remember choice preference
  const handleSetRememberChoice = (value: boolean) => {
    setRememberChoice(value);
    localStorage.setItem(STORAGE_KEYS.REMEMBER_CHOICE, String(value));
  };

  // Method: Clear the lost organization message after it has been displayed
  const clearLostOrganizationMessage = () => {
    setLostOrganizationMessage(null);
  };

  // Memoized context value
  const value = useMemo<AccountContextValue>(
    () => ({
      accountType,
      selectedOrganization,
      organizations,
      isLoadingOrganizations,
      hasSelectedAccount,
      rememberChoice,
      lostOrganizationMessage,
      switchToPersonal,
      switchToOrganization,
      getActiveAccount,
      markAccountAsSelected,
      setRememberChoice: handleSetRememberChoice,
      clearLostOrganizationMessage,
    }),
    [
      accountType,
      selectedOrganization,
      organizations,
      isLoadingOrganizations,
      hasSelectedAccount,
      rememberChoice,
      lostOrganizationMessage,
    ]
  );

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
};

// =============================================================================
// Custom Hook
// =============================================================================

export const useAccountContext = (): AccountContextValue => {
  const context = useContext(AccountContext);

  if (!context) {
    throw new Error('useAccountContext must be used within AccountContextProvider');
  }

  return context;
};
