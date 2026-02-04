/**
 * Login Page - Minside (User Dashboard)
 *
 * Uses reusable login components from @xaheen/ds.
 * Supports OAuth, email/password (dev mode), and demo login.
 */
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LoginLayout,
  LoginOption,
  IdPortenIcon,
  MicrosoftIcon,
  PlatformIcon,
  AutomationIcon,
  ShieldCheckIcon,
} from '@xaheen/ds';
import { useT } from '@xaheen/i18n';
import { useAuth as useSdkAuth } from '@xaheen/sdk';
import { useAuth } from '../hooks/useAuth';

// Simple Vipps icon
function VippsIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#FF5B24" />
      <path
        d="M7 8L12 16L17 8"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const DEV_AUTH = import.meta.env.VITE_DEV_AUTH === 'true' || import.meta.env.DEV;

export function LoginPage(): React.ReactElement {
  const { isAuthenticated, isLoading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const t = useT();

  // SDK auth for email/password and demo login
  const sdk = useSdkAuth({ appId: 'minside' });

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
  const urlError = new URLSearchParams(location.search).get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(urlError);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, from]);

  if (isLoading) {
    return <></>;
  }

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);
    try {
      await sdk.signIn(email, password);
      window.location.reload();
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Innlogging feilet');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoginError(null);
    setIsSubmitting(true);
    try {
      await sdk.signInAsDemo();
      window.location.reload();
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Demo-innlogging feilet');
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    {
      icon: <PlatformIcon size={20} />,
      title: t('auth.completePlatform'),
      description: t('auth.completePlatformDesc'),
    },
    {
      icon: <AutomationIcon size={20} />,
      title: t('auth.automation'),
      description: t('auth.automationDesc'),
    },
    {
      icon: <ShieldCheckIcon size={20} />,
      title: t('auth.gdprSecure'),
      description: t('auth.gdprSecureDesc'),
    },
  ];

  const integrations = ['BankID', 'Vipps', 'Visma', 'RCO', 'ISO 27001', 'ISO 27701'];

  const footerLinks = [
    { href: 'https://digilist.no/personvern', label: t('auth.privacy') },
    { href: 'https://digilist.no/cookies', label: t('auth.terms') },
    { href: 'https://digilist.no/#book-demo', label: t('auth.contactSupport') },
  ];

  return (
    <LoginLayout
      brandName="DIGILIST"
      brandTagline="ENKEL BOOKING"
      title={t('auth.login')}
      subtitle={t('auth.selectMethod')}
      panelTitle="MIN SIDE"
      panelSubtitle={t('auth.holisticSolution')}
      panelDescription={t('auth.platformDesc')}
      features={features}
      integrations={integrations}
      footerLinks={footerLinks}
      copyright={t('auth.copyright')}
    >
      <LoginOption
        icon={<IdPortenIcon />}
        title={t('auth.idporten')}
        description={t('auth.idportenDesc')}
        onClick={() => login('idporten')}
      />
      <LoginOption
        icon={<VippsIcon />}
        title="Vipps"
        description="Rask innlogging med Vipps"
        onClick={() => login('vipps')}
      />
      <LoginOption
        icon={<MicrosoftIcon />}
        title={t('auth.microsoft')}
        description={t('auth.microsoftDesc')}
        onClick={() => login('microsoft')}
      />

      {DEV_AUTH && (
        <>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            margin: '1.5rem 0',
            color: 'var(--ds-color-neutral-text-subtle, #666)',
            fontSize: '0.875rem',
          }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--ds-color-neutral-border-default, #ddd)' }} />
            <span>eller</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--ds-color-neutral-border-default, #ddd)' }} />
          </div>

          <form onSubmit={handlePasswordLogin} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input
              type="email"
              placeholder="E-post"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--ds-color-neutral-border-default, #ccc)',
                fontSize: '1rem',
                background: 'var(--ds-color-neutral-background-default, #fff)',
                color: 'var(--ds-color-neutral-text-default, #000)',
              }}
            />
            <input
              type="password"
              placeholder="Passord"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--ds-color-neutral-border-default, #ccc)',
                fontSize: '1rem',
                background: 'var(--ds-color-neutral-background-default, #fff)',
                color: 'var(--ds-color-neutral-text-default, #000)',
              }}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '0.75rem',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--ds-color-accent-surface-default, #0064B4)',
                color: '#fff',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.6 : 1,
              }}
            >
              {isSubmitting ? 'Logger inn...' : 'Logg inn med e-post'}
            </button>
          </form>

          <button
            onClick={handleDemoLogin}
            disabled={isSubmitting}
            style={{
              marginTop: '0.75rem',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid var(--ds-color-neutral-border-default, #ccc)',
              background: 'transparent',
              color: 'var(--ds-color-neutral-text-default, #333)',
              fontSize: '0.875rem',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              width: '100%',
              opacity: isSubmitting ? 0.6 : 1,
            }}
          >
            Hurtig demo-innlogging
          </button>
        </>
      )}

      {loginError && (
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem',
          borderRadius: '8px',
          background: 'var(--ds-color-danger-surface-default, #fde8e8)',
          color: 'var(--ds-color-danger-text-default, #c53030)',
          fontSize: '0.875rem',
        }}>
          {loginError}
        </div>
      )}
    </LoginLayout>
  );
}
