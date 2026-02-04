/**
 * Login Page - Web App
 *
 * Uses reusable login components from @xaheen/ds.
 * Supports OAuth (Vipps, ID-porten, Microsoft), email/password, and demo login.
 */
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LoginLayout,
  LoginOption,
  IdPortenIcon,
  MicrosoftIcon,
  VippsIcon,
  PlatformIcon,
  AutomationIcon,
  ShieldCheckIcon,
} from '@xaheen/ds';
import { useAuth } from '../hooks/useAuth';

const DEV_AUTH = import.meta.env.VITE_DEV_AUTH === 'true' || import.meta.env.DEV;

export function LoginPage(): React.ReactElement {
  const { isAuthenticated, isLoading, login, loginWithPassword, loginAsDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
      await loginWithPassword(email, password);
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
      await loginAsDemo();
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Demo-innlogging feilet');
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    {
      icon: <PlatformIcon size={20} />,
      title: 'Komplett plattform',
      description: 'Booking, betaling, kalender og rapportering i én løsning',
    },
    {
      icon: <AutomationIcon size={20} />,
      title: 'Automatisering',
      description: 'Regelbasert godkjenning reduserer manuelt arbeid',
    },
    {
      icon: <ShieldCheckIcon size={20} />,
      title: 'GDPR-klar & Sikker',
      description: 'Full etterlevelse av personvernregler og norske standarder',
    },
  ];

  const integrations = ['BankID', 'Vipps', 'Visma', 'RCO', 'ISO 27001', 'ISO 27701'];

  const footerLinks = [
    { href: 'https://digilist.no/personvern', label: 'Personvern' },
    { href: 'https://digilist.no/cookies', label: 'Vilkår for bruk' },
    { href: 'https://digilist.no/#book-demo', label: 'Kontakt support' },
  ];

  return (
    <LoginLayout
      brandName="DIGILIST"
      brandTagline="ENKEL BOOKING"
      logoHref="/"
      title="Logg inn"
      subtitle="Velg innloggingsmetode for å fortsette."
      panelTitle="Booking"
      panelSubtitle="En helhetlig bookingløsning"
      panelDescription="Skybasert plattform for booking av kommunale anlegg og ressurser med moderne design, betaling og rapportering."
      features={features}
      integrations={integrations}
      footerLinks={footerLinks}
      copyright="© 2026 Digilist. Alle rettigheter reservert."
    >
      {/* OAuth Buttons */}
      <LoginOption
        icon={<VippsIcon />}
        title="Vipps"
        description="Rask og enkel innlogging med Vipps"
        onClick={() => login('vipps')}
      />
      <LoginOption
        icon={<IdPortenIcon />}
        title="ID-porten"
        description="Personlig innlogging med BankID"
        onClick={() => login('idporten')}
      />
      <LoginOption
        icon={<MicrosoftIcon />}
        title="Microsoft"
        description="For ansatte med organisasjonskonto"
        onClick={() => login('microsoft')}
      />

      {/* Divider + Email/Password — shown in dev mode or always if needed */}
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

          {/* Demo Login Button */}
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

      {/* Error display */}
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
