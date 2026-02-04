/**
 * Login Components
 *
 * Reusable components for authentication pages including
 * SSO provider buttons, feature items, and layout components.
 */
import * as React from 'react';
import { Button, Heading, Paragraph } from '@digdir/designsystemet-react';
import { cn } from '../utils';

// =============================================================================
// LoginOption - SSO Provider Button
// =============================================================================

export interface LoginOptionProps {
  /** Icon element (typically an auth provider icon) */
  icon: React.ReactNode;
  /** Provider title (e.g., "ID-porten", "Microsoft") */
  title: string;
  /** Provider description (e.g., "Personlig innlogging med BankID") */
  description: string;
  /** Click handler for login action */
  onClick: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Custom class name */
  className?: string;
}

export function LoginOption({
  icon,
  title,
  description,
  onClick,
  disabled = false,
  className,
}: LoginOptionProps): React.ReactElement {
  return (
    <Button
      type="button"
      variant="secondary"
      onClick={onClick}
      disabled={disabled}
      className={cn('login-option', className)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--ds-spacing-4)',
        width: '100%',
        padding: 'var(--ds-spacing-4)',
        height: 'auto',
        textAlign: 'left',
        justifyContent: 'flex-start',
      }}
    >
      <div style={{ flexShrink: 0 }}>{icon}</div>
      <div>
        <div
          style={{
            fontSize: 'var(--ds-font-size-md)',
            fontWeight: 'var(--ds-font-weight-medium)',
            color: 'var(--ds-color-neutral-text-default)',
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 'var(--ds-font-size-sm)',
            color: 'var(--ds-color-neutral-text-subtle)',
            marginTop: 'var(--ds-spacing-0)',
          }}
        >
          {description}
        </div>
      </div>
    </Button>
  );
}

// =============================================================================
// FeatureItem - Marketing Feature Display
// =============================================================================

export interface FeatureItemProps {
  /** Icon element */
  icon: React.ReactNode;
  /** Feature title */
  title: string;
  /** Feature description */
  description: string;
  /** Text color variant */
  variant?: 'light' | 'dark';
  /** Custom class name */
  className?: string;
}

export function FeatureItem({
  icon,
  title,
  description,
  variant = 'light',
  className,
}: FeatureItemProps): React.ReactElement {
  const textColor = variant === 'light' 
    ? 'var(--digilist-login-overlay-text, #ffffff)' 
    : 'var(--ds-color-neutral-text-default)';
  const subtleColor = variant === 'light'
    ? 'var(--digilist-login-overlay-text-muted, rgba(255, 255, 255, 0.8))'
    : 'var(--ds-color-neutral-text-subtle)';
  const iconBg = variant === 'light'
    ? 'rgba(255, 255, 255, 0.15)'
    : 'var(--ds-color-neutral-surface-hover)';

  return (
    <div
      className={cn('feature-item', className)}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--ds-spacing-3)',
      }}
    >
      <div
        style={{
          flexShrink: 0,
          width: '36px',
          height: '36px',
          borderRadius: 'var(--ds-border-radius-md)',
          backgroundColor: iconBg,
          color: textColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </div>
      <div>
        <Paragraph
          data-size="sm"
          style={{
            fontWeight: 'var(--ds-font-weight-medium)',
            color: textColor,
            margin: 0,
          }}
        >
          {title}
        </Paragraph>
        <Paragraph
          data-size="xs"
          style={{
            color: subtleColor,
            margin: 0,
            marginTop: 'var(--ds-spacing-1)',
          }}
        >
          {description}
        </Paragraph>
      </div>
    </div>
  );
}

// =============================================================================
// IntegrationBadge - Integration/Certification Pills
// =============================================================================

export interface IntegrationBadgeProps {
  /** Integration/certification name */
  label: string;
  /** Badge variant */
  variant?: 'light' | 'dark';
  /** Custom class name */
  className?: string;
}

export function IntegrationBadge({
  label,
  variant = 'light',
  className,
}: IntegrationBadgeProps): React.ReactElement {
  const bgColor = variant === 'light'
    ? 'rgba(255, 255, 255, 0.15)'
    : 'var(--ds-color-neutral-surface-hover)';
  const textColor = variant === 'light'
    ? 'var(--digilist-login-overlay-text, #ffffff)'
    : 'var(--ds-color-neutral-text-default)';

  return (
    <span
      className={cn('integration-badge', className)}
      style={{
        padding: 'var(--ds-spacing-1) var(--ds-spacing-3)',
        backgroundColor: bgColor,
        borderRadius: 'var(--ds-border-radius-full)',
        fontSize: 'var(--ds-font-size-xs)',
        fontWeight: 'var(--ds-font-weight-medium)',
        color: textColor,
      }}
    >
      {label}
    </span>
  );
}

// =============================================================================
// LoginFooterLink - Footer Navigation Link
// =============================================================================

export interface LoginFooterLinkProps {
  /** Link URL */
  href: string;
  /** Link text */
  children: React.ReactNode;
  /** Open in new tab */
  external?: boolean;
  /** Custom class name */
  className?: string;
}

export function LoginFooterLink({
  href,
  children,
  external = true,
  className,
}: LoginFooterLinkProps): React.ReactElement {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={cn('login-footer-link', className)}
      style={{
        fontSize: 'var(--ds-font-size-sm)',
        color: 'var(--ds-color-neutral-text-subtle)',
        textDecoration: 'none',
        transition: 'color 0.2s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ds-color-accent-text-default)')}
      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ds-color-neutral-text-subtle)')}
    >
      {children}
    </a>
  );
}

// =============================================================================
// LoginLayout - Split-Screen Login Layout
// =============================================================================

export interface LoginLayoutProps {
  /** Logo element */
  logo?: React.ReactNode;
  /** Brand name */
  brandName?: string;
  /** Brand tagline */
  brandTagline?: string;
  /** URL to navigate to when clicking the logo */
  logoHref?: string;
  /** Login form title */
  title?: string;
  /** Login form subtitle */
  subtitle?: string;
  /** Login options/buttons */
  children: React.ReactNode;
  /** Right panel title */
  panelTitle?: string;
  /** Right panel subtitle */
  panelSubtitle?: string;
  /** Right panel description */
  panelDescription?: string;
  /** Feature items for right panel */
  features?: Array<{
    icon: React.ReactNode;
    title: string;
    description: string;
  }>;
  /** Integration/certification badges */
  integrations?: string[];
  /** Footer links */
  footerLinks?: Array<{
    href: string;
    label: string;
  }>;
  /** Copyright text */
  copyright?: string;
  /** Custom class name */
  className?: string;
}

export function LoginLayout({
  logo,
  brandName = 'DIGILIST',
  brandTagline = 'ENKEL BOOKING',
  logoHref,
  title = 'Logg inn',
  subtitle = 'Velg innloggingsmetode for å fortsette.',
  children,
  panelTitle = 'Backoffice',
  panelSubtitle = 'En helhetlig bookingløsning',
  panelDescription,
  features = [],
  integrations = [],
  footerLinks = [],
  copyright = `© ${new Date().getFullYear()} Digilist. Alle rettigheter reservert.`,
  className,
}: LoginLayoutProps): React.ReactElement {
  return (
    <div
      className={cn('login-layout', className)}
      style={{
        display: 'flex',
        minHeight: '100vh',
      }}
    >
      {/* Left side - Login form */}
      <div
        style={{
          width: '50%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--ds-color-neutral-background-default)',
        }}
      >
        {/* Main content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: 'var(--ds-spacing-12)',
            maxWidth: '480px',
            margin: '0 auto',
            width: '100%',
          }}
        >
          {/* Logo/Brand */}
          <div style={{ marginBottom: 'var(--ds-spacing-10)' }}>
            {logoHref ? (
              <a
                href={logoHref}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--ds-spacing-4)',
                  textDecoration: 'none',
                  cursor: 'pointer',
                }}
              >
                {logo || (
                  <img
                    src="/logo.svg"
                    alt={brandName}
                    style={{
                      height: '80px',
                      width: 'auto',
                    }}
                  />
                )}
                <div>
                  <div
                    style={{
                      fontSize: '1.75rem',
                      fontWeight: 'var(--ds-font-weight-bold)',
                      color: 'var(--ds-color-accent-base-default)',
                      lineHeight: 1.1,
                      letterSpacing: '0.05em',
                    }}
                  >
                    {brandName}
                  </div>
                  <div
                    style={{
                      fontSize: 'var(--ds-font-size-sm)',
                      color: 'var(--ds-color-neutral-text-subtle)',
                      letterSpacing: '0.1em',
                      marginTop: 'var(--ds-spacing-1)',
                    }}
                  >
                    {brandTagline}
                  </div>
                </div>
              </a>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-4)' }}>
                {logo || (
                  <img
                    src="/logo.svg"
                    alt={brandName}
                    style={{
                      height: '80px',
                      width: 'auto',
                    }}
                  />
                )}
                <div>
                  <div
                    style={{
                      fontSize: '1.75rem',
                      fontWeight: 'var(--ds-font-weight-bold)',
                      color: 'var(--ds-color-accent-base-default)',
                      lineHeight: 1.1,
                      letterSpacing: '0.05em',
                    }}
                  >
                    {brandName}
                  </div>
                  <div
                    style={{
                      fontSize: 'var(--ds-font-size-sm)',
                      color: 'var(--ds-color-neutral-text-subtle)',
                      letterSpacing: '0.1em',
                      marginTop: 'var(--ds-spacing-1)',
                    }}
                  >
                    {brandTagline}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Login section */}
          <div>
            <Heading level={1} data-size="xl" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
              {title}
            </Heading>
            <Paragraph
              data-size="md"
              style={{ color: 'var(--ds-color-neutral-text-subtle)', marginBottom: 'var(--ds-spacing-8)' }}
            >
              {subtitle}
            </Paragraph>

            {/* Login options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
              {children}
            </div>
          </div>
        </div>

        {/* Footer */}
        {(footerLinks.length > 0 || copyright) && (
          <div
            style={{
              padding: 'var(--ds-spacing-6) var(--ds-spacing-12)',
              borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
            }}
          >
            {footerLinks.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--ds-spacing-6)',
                  marginBottom: 'var(--ds-spacing-3)',
                }}
              >
                {footerLinks.map((link, index) => (
                  <React.Fragment key={link.href}>
                    {index > 0 && (
                      <span style={{ color: 'var(--ds-color-neutral-border-default)' }}>·</span>
                    )}
                    <LoginFooterLink href={link.href}>{link.label}</LoginFooterLink>
                  </React.Fragment>
                ))}
              </div>
            )}
            {copyright && (
              <Paragraph data-size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
                {copyright}
              </Paragraph>
            )}
          </div>
        )}
      </div>

      {/* Right side - Product info */}
      <div
        style={{
          width: '50%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 'var(--ds-spacing-12)',
          background: 'linear-gradient(135deg, var(--ds-color-accent-base-default) 0%, #1a3a6e 100%)',
        }}
      >
        <div style={{ maxWidth: '480px', margin: '0 auto', width: '100%' }}>
          {/* Header */}
          <div style={{ marginBottom: 'var(--ds-spacing-10)' }}>
            <Paragraph
              data-size="xs"
              style={{
                color: 'rgba(255, 255, 255, 0.7)',
                textTransform: 'uppercase',
                letterSpacing: 'var(--ds-letter-spacing-wider, 0.1em)',
                fontWeight: 'var(--ds-font-weight-medium)',
                marginBottom: 'var(--ds-spacing-3)',
              }}
            >
              {panelTitle}
            </Paragraph>
            <Heading
              level={2}
              data-size="2xl"
              style={{
                color: 'var(--digilist-login-overlay-text, #ffffff)',
                marginBottom: 'var(--ds-spacing-4)',
                lineHeight: 'var(--ds-line-height-condensed)',
              }}
            >
              {panelSubtitle}
            </Heading>
            {panelDescription && (
              <Paragraph
                data-size="md"
                style={{
                  color: 'var(--digilist-login-overlay-text-muted, rgba(255, 255, 255, 0.8))',
                  lineHeight: 1.6,
                }}
              >
                {panelDescription}
              </Paragraph>
            )}
          </div>

          {/* Features */}
          {features.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--ds-spacing-6)',
                marginBottom: 'var(--ds-spacing-10)',
              }}
            >
              {features.map((feature) => (
                <FeatureItem
                  key={feature.title}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  variant="light"
                />
              ))}
            </div>
          )}

          {/* Integrations */}
          {integrations.length > 0 && (
            <div>
              <Paragraph
                data-size="xs"
                style={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  marginBottom: 'var(--ds-spacing-3)',
                  textTransform: 'uppercase',
                  letterSpacing: 'var(--ds-letter-spacing-wide, 0.05em)',
                }}
              >
                Integrasjoner & Sertifiseringer
              </Paragraph>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 'var(--ds-spacing-2)',
                }}
              >
                {integrations.map((integration) => (
                  <IntegrationBadge key={integration} label={integration} variant="light" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginLayout;
