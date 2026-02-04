import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DesignsystemetProvider, DialogProvider, ErrorBoundary } from '@xaheen/ds';
import { I18nProvider } from '@xaheen/i18n';
import { useState, useCallback, createContext, useContext } from 'react';

import { AuthProvider } from './providers/AuthProvider';
import { RealtimeProvider } from './providers/RealtimeProvider';
import { ThemeProvider, useTheme } from './providers/ThemeProvider';
import { AccountContextProvider, useAccountContext } from './providers/AccountContextProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AccountSelectionModal } from './components/AccountSelectionModal';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './routes/login';
import { AuthCallbackPage } from './routes/auth-callback';
import { DashboardPage } from './routes/dashboard';
import { CalendarPage } from './routes/calendar';
import { BookingsPage } from './routes/bookings';
import { BillingPage } from './routes/billing';
import { MessagesPage } from './routes/messages';
import { SettingsPage } from './routes/settings';
// Organization pages
import { OrganizationDashboardPage, OrganizationBookingsPage, OrganizationInvoicesPage, OrganizationMembersPage, SeasonRentalPage, OrganizationSettingsPage, OrganizationActivityPage } from './routes/org';
import { UserPreferencesPage } from './routes/preferences';
import { NotificationsPage } from './routes/notifications';
import { HelpPage } from './routes/help';

// Notification Center Context
interface NotificationCenterContextValue {
  openNotificationCenter: () => void;
  closeNotificationCenter: () => void;
  isOpen: boolean;
}

const NotificationCenterContext = createContext<NotificationCenterContextValue | null>(null);

export function useNotificationCenter(): NotificationCenterContextValue {
  const context = useContext(NotificationCenterContext);
  if (!context) {
    throw new Error('useNotificationCenter must be used within NotificationCenterProvider');
  }
  return context;
}

function NotificationCenterProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openNotificationCenter = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeNotificationCenter = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <NotificationCenterContext.Provider value={{ openNotificationCenter, closeNotificationCenter, isOpen }}>
      {children}
    </NotificationCenterContext.Provider>
  );
}

/**
 * Account Selection Wrapper
 * Displays the AccountSelectionModal when user hasn't selected an account yet
 * and hasn't chosen to remember their choice.
 *
 * Edge case handling:
 * - If rememberChoice is true (from localStorage), the modal is skipped
 * - The persisted context (personal/organization) is automatically restored
 *   by AccountContextProvider when rememberChoice is true
 */
function AccountSelectionWrapper({ children }: { children: React.ReactNode }) {
  const { hasSelectedAccount, rememberChoice } = useAccountContext();

  // Show modal only if:
  // 1. User hasn't selected an account yet (hasSelectedAccount = false)
  // 2. User hasn't chosen to remember their choice (rememberChoice = false)
  // If rememberChoice is true, skip modal and use persisted context
  const showModal = !hasSelectedAccount && !rememberChoice;

  return (
    <>
      <AccountSelectionModal open={showModal} />
      {children}
    </>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AppWithTheme />
    </ThemeProvider>
  );
}

function AppWithTheme() {
  const { colorScheme } = useTheme();
  
  return (
    <I18nProvider>
      <DesignsystemetProvider theme="digilist" colorScheme={colorScheme} size="md">
      <DialogProvider>
      <ErrorBoundary>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <NotificationCenterProvider>
          <AuthProvider>
            <AccountContextProvider>
            <AccountSelectionWrapper>
            <RealtimeProvider
              wsUrl={import.meta.env.VITE_WS_URL}
              tenantId={import.meta.env.VITE_TENANT_ID}
            >
            <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              {/* Personal context routes */}
              <Route index element={<ProtectedRoute requiredContext="personal"><DashboardPage /></ProtectedRoute>} />
              <Route path="bookings" element={<ProtectedRoute requiredContext="personal"><BookingsPage /></ProtectedRoute>} />
              <Route path="billing" element={<ProtectedRoute requiredContext="personal"><BillingPage /></ProtectedRoute>} />
              <Route path="calendar" element={<ProtectedRoute requiredContext="personal"><CalendarPage /></ProtectedRoute>} />
              <Route path="messages" element={<ProtectedRoute requiredContext="personal"><MessagesPage /></ProtectedRoute>} />

              {/* Shared routes (any context) */}
              <Route path="settings" element={<SettingsPage />} />
              <Route path="preferences" element={<UserPreferencesPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="help" element={<HelpPage />} />

              {/* Organization portal routes */}
              <Route path="org" element={<ProtectedRoute requiredContext="organization"><OrganizationDashboardPage /></ProtectedRoute>} />
              <Route path="org/bookings" element={<ProtectedRoute requiredContext="organization"><OrganizationBookingsPage /></ProtectedRoute>} />
              <Route path="org/invoices" element={<ProtectedRoute requiredContext="organization"><OrganizationInvoicesPage /></ProtectedRoute>} />
              <Route path="org/members" element={<ProtectedRoute requiredContext="organization"><OrganizationMembersPage /></ProtectedRoute>} />
              <Route path="org/season-rental" element={<ProtectedRoute requiredContext="organization"><SeasonRentalPage /></ProtectedRoute>} />
              <Route path="org/settings" element={<ProtectedRoute requiredContext="organization"><OrganizationSettingsPage /></ProtectedRoute>} />
              <Route path="org/activity" element={<ProtectedRoute requiredContext="organization"><OrganizationActivityPage /></ProtectedRoute>} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </RealtimeProvider>
            </AccountSelectionWrapper>
            </AccountContextProvider>
          </AuthProvider>
        </NotificationCenterProvider>
      </BrowserRouter>
      </ErrorBoundary>
      </DialogProvider>
      </DesignsystemetProvider>
    </I18nProvider>
  );
}
