/**
 * OrganizationSettingsPage
 *
 * Organization portal settings page
 * - Organization profile
 * - Notification preferences
 * - Contact information
 * - Billing settings
 */

import { useState, useEffect } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Input,
  Switch,
} from '@xaheen/ds';
import { useT } from '@xaheen/i18n';

const MOBILE_BREAKPOINT = 768;

export function OrganizationSettingsPage() {
  const t = useT();
  const [isSaving, setIsSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  // Settings state
  const [settings, setSettings] = useState({
    orgName: 'Skien IL',
    orgNumber: '987654321',
    email: 'post@skien-il.no',
    phone: '35 50 12 34',
    address: 'Idrettsveien 123',
    postalCode: '3700',
    city: 'Skien',
    // Notifications
    emailBookingConfirm: true,
    emailBookingReminder: true,
    emailInvoice: true,
    smsReminder: false,
    // Billing
    invoiceEmail: 'faktura@skien-il.no',
    paymentTerms: '30',
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const updateSetting = (key: string, value: string | boolean) => {
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
            {t('org.settings')}
          </Heading>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
            {t('org.settingsDesc')}
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
          {isSaving ? t('common.saving') : t('common.save')}
        </Button>
      </div>

      {/* Organization Profile */}
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          Organisasjonsprofil
        </Heading>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 'var(--ds-spacing-4)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 500 }}>Navn</label>
              <Input
                value={settings.orgName}
                onChange={(e) => updateSetting('orgName', e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 500 }}>Org.nr</label>
              <Input
                value={settings.orgNumber}
                onChange={(e) => updateSetting('orgNumber', e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 'var(--ds-spacing-4)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 500 }}>E-post</label>
              <Input
                type="email"
                value={settings.email}
                onChange={(e) => updateSetting('email', e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 500 }}>Telefon</label>
              <Input
                value={settings.phone}
                onChange={(e) => updateSetting('phone', e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 500 }}>Adresse</label>
            <Input
              value={settings.address}
              onChange={(e) => updateSetting('address', e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr', gap: 'var(--ds-spacing-4)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 500 }}>Postnr</label>
              <Input
                value={settings.postalCode}
                onChange={(e) => updateSetting('postalCode', e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 500 }}>Sted</label>
              <Input
                value={settings.city}
                onChange={(e) => updateSetting('city', e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          Varsler
        </Heading>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
          {[
            { key: 'emailBookingConfirm', label: 'Bookingbekreftelser', description: 'Motta bekreftelse ved nye bookinger' },
            { key: 'emailBookingReminder', label: 'Påminnelser', description: 'Motta påminnelse før bookinger' },
            { key: 'emailInvoice', label: 'Fakturaer', description: 'Motta fakturaer på e-post' },
            { key: 'smsReminder', label: 'SMS-påminnelser', description: 'Motta påminnelser via SMS' },
          ].map(item => (
            <div key={item.key} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'var(--ds-spacing-3)',
              borderRadius: 'var(--ds-border-radius-md)',
              backgroundColor: 'var(--ds-color-neutral-surface-hover)',
            }}>
              <div>
                <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 500 }}>{item.label}</Paragraph>
                <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                  {item.description}
                </Paragraph>
              </div>
              <Switch
                aria-label={item.label}
                checked={settings[item.key as keyof typeof settings] as boolean}
                onChange={(e) => updateSetting(item.key, e.target.checked)}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Billing */}
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          Fakturering
        </Heading>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 'var(--ds-spacing-4)' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 500 }}>Faktura e-post</label>
            <Input
              type="email"
              value={settings.invoiceEmail}
              onChange={(e) => updateSetting('invoiceEmail', e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 500 }}>Betalingsfrist (dager)</label>
            <Input
              type="number"
              value={settings.paymentTerms}
              onChange={(e) => updateSetting('paymentTerms', e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
