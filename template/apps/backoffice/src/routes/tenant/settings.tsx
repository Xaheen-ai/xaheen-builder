/**
 * TenantSettingsPage
 *
 * TenantAdmin page for managing tenant configuration
 * - General settings
 * - Feature toggles
 * - Module configuration
 * - Integration settings
 */

/* eslint-disable digdir/prefer-ds-components, digdir/no-hardcoded-typography -- Complex settings form */

import { useState, useEffect } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Input,
  Select,
  Switch,
} from '@xaheen/ds';

const MOBILE_BREAKPOINT = 768;

export function TenantSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  // Settings state
  const [settings, setSettings] = useState({
    tenantName: 'Skien Kommune',
    tenantSlug: 'skien',
    defaultLanguage: 'nb',
    timezone: 'Europe/Oslo',
    currency: 'NOK',
    bookingEnabled: true,
    seasonalLeaseEnabled: true,
    organizationPortalEnabled: true,
    publicListingsEnabled: true,
    reviewsEnabled: true,
    paymentEnabled: false,
    vippsIntegration: false,
    emailNotifications: true,
    smsNotifications: false,
    maxBookingAdvanceDays: '90',
    defaultCancellationHours: '24',
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        gap: 'var(--ds-spacing-4)',
      }}>
        <div>
          <Heading level={1} data-size="lg" style={{ margin: 0 }}>
            Tenant-innstillinger
          </Heading>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
            Konfigurer innstillinger for hele plattformen
          </Paragraph>
        </div>
        <Button 
          type="button" 
          variant="primary" 
          data-size="md" 
          onClick={handleSave}
          disabled={isSaving}
          style={{ minHeight: '44px' }}
        >
          {isSaving ? 'Lagrer...' : 'Lagre endringer'}
        </Button>
      </div>

      {/* General Settings */}
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          Generelle innstillinger
        </Heading>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 'var(--ds-spacing-4)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 500 }}>Tenant-navn</label>
              <Input
                value={settings.tenantName}
                onChange={(e) => updateSetting('tenantName', e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 500 }}>Slug (URL)</label>
              <Input
                value={settings.tenantSlug}
                onChange={(e) => updateSetting('tenantSlug', e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 'var(--ds-spacing-4)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 500 }}>Språk</label>
              <Select
                value={settings.defaultLanguage}
                onChange={(e) => updateSetting('defaultLanguage', e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="nb">Norsk (bokmål)</option>
                <option value="nn">Norsk (nynorsk)</option>
                <option value="en">English</option>
              </Select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 500 }}>Tidssone</label>
              <Select
                value={settings.timezone}
                onChange={(e) => updateSetting('timezone', e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="Europe/Oslo">Europe/Oslo (CET)</option>
                <option value="UTC">UTC</option>
              </Select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 500 }}>Valuta</label>
              <Select
                value={settings.currency}
                onChange={(e) => updateSetting('currency', e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="NOK">NOK</option>
                <option value="EUR">EUR</option>
                <option value="SEK">SEK</option>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* Feature Toggles */}
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          Funksjoner
        </Heading>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
          {[
            { key: 'bookingEnabled', label: 'Booking aktivert', description: 'Tillat brukere å booke lokaler' },
            { key: 'seasonalLeaseEnabled', label: 'Sesongbooking aktivert', description: 'Tillat organisasjoner å søke om faste tider' },
            { key: 'organizationPortalEnabled', label: 'Organisasjonsportal', description: 'Aktiver portal for organisasjoner' },
            { key: 'publicListingsEnabled', label: 'Offentlig visnting', description: 'Vis lokaler offentlig' },
            { key: 'reviewsEnabled', label: 'Anmeldelser', description: 'Tillat brukere å legge igjen anmeldelser' },
          ].map(feature => (
            <div key={feature.key} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'var(--ds-spacing-3)',
              borderRadius: 'var(--ds-border-radius-md)',
              backgroundColor: 'var(--ds-color-neutral-surface-hover)',
            }}>
              <div>
                <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 500 }}>{feature.label}</Paragraph>
                <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {feature.description}
                </Paragraph>
              </div>
              <Switch
                checked={settings[feature.key as keyof typeof settings] as boolean}
                onChange={(checked: boolean) => updateSetting(feature.key, checked)}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Integrations */}
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          Integrasjoner
        </Heading>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
          {[
            { key: 'paymentEnabled', label: 'Betaling', description: 'Aktiver online betaling' },
            { key: 'vippsIntegration', label: 'Vipps', description: 'Integrasjon med Vipps for betaling' },
            { key: 'emailNotifications', label: 'E-postvarsler', description: 'Send varsler via e-post' },
            { key: 'smsNotifications', label: 'SMS-varsler', description: 'Send varsler via SMS' },
          ].map(integration => (
            <div key={integration.key} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'var(--ds-spacing-3)',
              borderRadius: 'var(--ds-border-radius-md)',
              backgroundColor: 'var(--ds-color-neutral-surface-hover)',
            }}>
              <div>
                <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 500 }}>{integration.label}</Paragraph>
                <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {integration.description}
                </Paragraph>
              </div>
              <Switch
                checked={settings[integration.key as keyof typeof settings] as boolean}
                onChange={(checked: boolean) => updateSetting(integration.key, checked)}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Booking Rules */}
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          Bookingregler
        </Heading>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 'var(--ds-spacing-4)' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 500 }}>
              Maks. forhåndsbooking (dager)
            </label>
            <Input
              type="number"
              value={settings.maxBookingAdvanceDays}
              onChange={(e) => updateSetting('maxBookingAdvanceDays', e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 500 }}>
              Avbudsvarsel (timer før)
            </label>
            <Input
              type="number"
              value={settings.defaultCancellationHours}
              onChange={(e) => updateSetting('defaultCancellationHours', e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
