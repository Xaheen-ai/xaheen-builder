/**
 * UserPreferencesPage
 *
 * User portal preferences page
 * - Notification settings
 * - Privacy preferences
 * - Display settings
 * - Account management
 */

import { useState, useEffect } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Switch,
  Select,
} from '@xaheen/ds';
import { useT } from '@xaheen/i18n';

const MOBILE_BREAKPOINT = 768;

export function UserPreferencesPage() {
  const t = useT();
  const [isSaving, setIsSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  // Preferences state
  const [prefs, setPrefs] = useState({
    // Notifications
    emailBooking: true,
    emailReminder: true,
    emailNewsletter: false,
    smsReminder: true,
    pushNotifications: true,
    // Privacy
    showProfile: true,
    shareActivity: false,
    allowAnalytics: true,
    // Display
    theme: 'system',
    language: 'no',
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const updatePref = (key: string, value: string | boolean) => {
    setPrefs(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const notificationSettings = [
    { key: 'emailBooking', label: 'Bookingbekreftelser', description: 'Motta e-post ved nye bookinger' },
    { key: 'emailReminder', label: 'E-post påminnelser', description: 'Påminnelse 24 timer før booking' },
    { key: 'emailNewsletter', label: 'Nyhetsbrev', description: 'Motta nyheter og tilbud' },
    { key: 'smsReminder', label: 'SMS-påminnelser', description: 'Motta påminnelse via SMS' },
    { key: 'pushNotifications', label: 'Push-varsler', description: 'Sanntidsvarsler i nettleseren' },
  ];

  const privacySettings = [
    { key: 'showProfile', label: 'Vis profil', description: 'La andre brukere se profilen din' },
    { key: 'shareActivity', label: 'Del aktivitet', description: 'Del bookinghistorikk med organisasjonen' },
    { key: 'allowAnalytics', label: 'Anonyme analyser', description: 'Hjelp oss forbedre tjenesten' },
  ];

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
            {t('settings.preferences')}
          </Heading>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
            {t('settings.preferencesDesc')}
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

      {/* Notifications */}
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          Varsler
        </Heading>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
          {notificationSettings.map(item => (
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
                checked={prefs[item.key as keyof typeof prefs] as boolean}
                onChange={(e) => updatePref(item.key, e.target.checked)}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Privacy */}
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          Personvern
        </Heading>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
          {privacySettings.map(item => (
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
                checked={prefs[item.key as keyof typeof prefs] as boolean}
                onChange={(e) => updatePref(item.key, e.target.checked)}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Display */}
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          Visning
        </Heading>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 'var(--ds-spacing-4)' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 500 }}>Tema</label>
            <Select
              value={prefs.theme}
              onChange={(e) => updatePref('theme', e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="system">Følg system</option>
              <option value="light">Lyst</option>
              <option value="dark">Mørkt</option>
            </Select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 500 }}>Språk</label>
            <Select
              value={prefs.language}
              onChange={(e) => updatePref('language', e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="no">Norsk</option>
              <option value="en">English</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card style={{ padding: 'var(--ds-spacing-5)', border: '1px solid var(--ds-color-danger-border-default)' }}>
        <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)', color: 'var(--ds-color-danger-text-default)' }}>
          Faresone
        </Heading>
        <Paragraph data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)', color: 'var(--ds-color-neutral-text-subtle)' }}>
          Disse handlingene kan ikke angres.
        </Paragraph>
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', flexWrap: 'wrap' }}>
          <Button type="button" variant="secondary" data-size="md" style={{ minHeight: '44px' }}>
            Eksporter data
          </Button>
          <Button type="button" variant="secondary" data-size="md" style={{ minHeight: '44px', color: 'var(--ds-color-danger-text-default)' }}>
            Slett konto
          </Button>
        </div>
      </Card>
    </div>
  );
}
