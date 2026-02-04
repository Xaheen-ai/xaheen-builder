import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DesignsystemetProvider, DialogProvider, ErrorBoundary } from '@xaheen/ds';
import { I18nProvider } from '@xaheen/i18n';

import { AuthProvider } from './providers/AuthProvider';
import { BackofficeRoleProvider } from './providers/BackofficeRoleProvider';
import { ToastProvider } from './providers/ToastProvider';
import { RealtimeProvider } from './providers/RealtimeProvider';
import { ThemeProvider, useTheme } from './providers/ThemeProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './routes/login';
import { AuthCallbackPage } from './routes/auth-callback';
import { RoleSelectionPage } from './routes/role-selection';
import { DashboardPage } from './routes/dashboard';
import { ListingsPage, ListingEditPage, ListingDetailPage } from './routes/listings';
import { CalendarPage } from './routes/calendar';
import { BookingsPage } from './routes/bookings';
import { SeasonsListPage, SeasonDetailPage, SeasonFormPage } from './routes/seasons';
import { MessagesPage } from './routes/messages';
import { OrganizationsListPage, OrganizationDetailPage, OrganizationFormPage } from './routes/organizations';
import { UsersPage } from './routes/users';
import { ReportsPage } from './routes/reports';
import { AuditPage } from './routes/audit';
import { ReviewModerationPage } from './routes/reviews';
import { SettingsPage } from './routes/settings';
import { initSentry } from './lib/sentry';
// New Saksbehandler pages
import { WorkQueuePage } from './routes/work-queue';
import { SeasonApplicationsReviewPage } from './routes/season-applications';
import { AllocationPlannerPage } from './routes/allocation-planner';
import { DecisionFormsPage } from './routes/decision-forms';
import { AuditTimelinePage } from './routes/audit-timeline';
// New Admin pages
import { ListingWizardPage } from './routes/listing-wizard';
import { PricingRulesPage } from './routes/pricing-rules';
import { UsersManagementPage } from './routes/users-management';
import { AdminReportsPage } from './routes/admin-reports';
// New TenantAdmin pages
import { TenantSettingsPage } from './routes/tenant/settings';
import { TenantBrandingPage } from './routes/tenant/branding';
import { TenantAuditLogPage } from './routes/tenant/audit-log';

// Initialize Sentry error tracking before React rendering
initSentry();

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
      <ToastProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthProvider>
          <BackofficeRoleProvider>
          <RealtimeProvider
            wsUrl={import.meta.env.VITE_WS_URL}
            tenantId={import.meta.env.VITE_TENANT_ID}
          >
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/role-selection" element={<RoleSelectionPage />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="listings" element={<ListingsPage />} />
              <Route path="listings/new" element={<ListingEditPage />} />
              <Route path="listings/:slug" element={<ListingEditPage />} />
              <Route path="listings/:slug/view" element={<ListingDetailPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="requests" element={<Navigate to="/bookings" replace />} />
              <Route path="bookings" element={<BookingsPage />} />
              <Route path="seasons" element={<SeasonsListPage />} />
              <Route path="seasons/new" element={<SeasonFormPage />} />
              <Route path="seasons/:id" element={<SeasonDetailPage />} />
              <Route path="seasons/:id/edit" element={<SeasonFormPage />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route
                path="reviews/moderation"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <ReviewModerationPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="audit"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AuditPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="organizations"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <OrganizationsListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="organizations/new"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <OrganizationFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="organizations/:id"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <OrganizationDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="organizations/:id/edit"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <OrganizationFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="users"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <UsersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="settings"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
              
              {/* Saksbehandler routes */}
              <Route
                path="work-queue"
                element={
                  <ProtectedRoute requiredRole="case_handler">
                    <WorkQueuePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="season-applications"
                element={
                  <ProtectedRoute requiredRole="case_handler">
                    <SeasonApplicationsReviewPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="allocation-planner"
                element={
                  <ProtectedRoute requiredRole="case_handler">
                    <AllocationPlannerPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="decision-forms"
                element={
                  <ProtectedRoute requiredRole="case_handler">
                    <DecisionFormsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="audit-timeline"
                element={
                  <ProtectedRoute requiredRole="case_handler">
                    <AuditTimelinePage />
                  </ProtectedRoute>
                }
              />
              
              {/* Admin routes */}
              <Route
                path="listings/wizard"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <ListingWizardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="listings/wizard/:id"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <ListingWizardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="pricing-rules"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <PricingRulesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="users-management"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <UsersManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin-reports"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminReportsPage />
                  </ProtectedRoute>
                }
              />
              
              {/* TenantAdmin routes */}
              <Route
                path="tenant/settings"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <TenantSettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="tenant/branding"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <TenantBrandingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="tenant/audit-log"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <TenantAuditLogPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </RealtimeProvider>
          </BackofficeRoleProvider>
        </AuthProvider>
      </BrowserRouter>
      </ToastProvider>
      </ErrorBoundary>
      </DialogProvider>
      </DesignsystemetProvider>
    </I18nProvider>
  );
}
