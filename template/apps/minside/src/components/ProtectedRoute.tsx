import { Navigate, useLocation } from 'react-router-dom';
import { Spinner, Heading, Paragraph } from '@xaheen/ds';
import { useAuth, type BackofficeRole } from '../hooks/useAuth';
import { useAccountContext, type DashboardContext } from '../providers/AccountContextProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: BackofficeRole;
  requiredContext?: DashboardContext;
}

export function ProtectedRoute({ children, requiredRole, requiredContext }: ProtectedRouteProps) {
  const { isLoading, isAuthenticated, checkRole } = useAuth();
  const { accountType, isLoadingOrganizations } = useAccountContext();
  const location = useLocation();

  // Show loading state while auth or account context is being determined
  if (isLoading || (requiredContext && isLoadingOrganizations)) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: 'var(--ds-color-neutral-background-default)',
        }}
      >
        <Spinner aria-label="Laster..." data-size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && !checkRole(requiredRole)) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          gap: 'var(--ds-spacing-4)',
          padding: 'var(--ds-spacing-6)',
          textAlign: 'center',
        }}
      >
        <Heading
          level={1}
          data-size="lg"
          style={{ color: 'var(--ds-color-danger-text-default)' }}
        >
          Ingen tilgang
        </Heading>
        <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
          Du har ikke tilgang til denne siden.
          <br />
          Kontakt administrator hvis du mener dette er feil.
        </Paragraph>
      </div>
    );
  }

  // Context validation: Check if current account context matches required context
  // If wrong context, redirect to current context's home page instead of showing an error
  if (requiredContext && accountType !== requiredContext) {
    // Redirect messages for optional toast notification on destination page
    const redirectMessages: Record<DashboardContext, string> = {
      personal: 'Denne siden krever personlig modus. Du har blitt omdirigert.',
      organization: 'Denne siden krever organisasjonsmodus. Du har blitt omdirigert.',
    };

    // Redirect to current context's home (not the required context's home)
    const redirectTo = accountType === 'organization' ? '/org' : '/';
    const message = redirectMessages[requiredContext];

    return (
      <Navigate
        to={redirectTo}
        state={{ contextRedirectMessage: message, from: location }}
        replace
      />
    );
  }

  return <>{children}</>;
}
