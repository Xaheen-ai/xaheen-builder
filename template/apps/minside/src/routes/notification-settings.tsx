import { Card, Heading, Paragraph, Switch, Spinner } from '@xaheen/ds';
import { useT } from '@xaheen/i18n';
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
  usePushPermission,
  usePushSubscriptionFlow,
  usePushSubscriptions,
} from '@xaheen/sdk';
import { useState, useEffect } from 'react';

/**
 * Notification Settings Page
 *
 * Allows users to configure notification preferences including:
 * - Push notification subscription
 * - Email notifications
 * - In-app notifications
 * - Booking-specific notification types
 * - Reminder timing preferences
 */
export function NotificationSettingsPage() {
  const t = useT();

  // SDK hooks for notification preferences
  const { data: preferencesData, isLoading: isLoadingPreferences } = useNotificationPreferences();
  const updatePreferencesMutation = useUpdateNotificationPreferences();

  // Push notification subscription hooks
  const { permission, isSupported, isGranted } = usePushPermission();
  const { subscribe, unsubscribe, isSubscribing } = usePushSubscriptionFlow();
  const { data: subscriptionsData, isLoading: isLoadingSubscriptions } = usePushSubscriptions();

  // Local state for form
  const [preferences, setPreferences] = useState({
    emailEnabled: true,
    pushEnabled: false,
    inAppEnabled: true,
    smsEnabled: false,
    bookingConfirmationEnabled: true,
    bookingReminderEnabled: true,
    bookingCancellationEnabled: true,
    bookingModificationEnabled: true,
    reminderTiming: {
      enabled24h: true,
      enabled1h: true,
    },
  });

  // Track if subscription exists
  const hasActiveSubscription = (subscriptionsData?.data ?? []).some((sub: { isActive?: boolean }) => sub.isActive);

  // Update local state when preferences load
  useEffect(() => {
    if (preferencesData?.data) {
      const prefs = preferencesData.data;
      setPreferences({
        emailEnabled: prefs.emailEnabled ?? true,
        pushEnabled: prefs.pushEnabled ?? false,
        inAppEnabled: prefs.inAppEnabled ?? true,
        smsEnabled: prefs.smsEnabled ?? false,
        bookingConfirmationEnabled: prefs.bookingConfirmationEnabled ?? true,
        bookingReminderEnabled: prefs.bookingReminderEnabled ?? true,
        bookingCancellationEnabled: prefs.bookingCancellationEnabled ?? true,
        bookingModificationEnabled: prefs.bookingModificationEnabled ?? true,
        reminderTiming: {
          enabled24h: prefs.reminderTiming?.enabled24h ?? true,
          enabled1h: prefs.reminderTiming?.enabled1h ?? true,
        },
      });
    }
  }, [preferencesData]);

  // Handle preference change
  const handlePreferenceChange = (key: string, value: boolean) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);

    // Save to backend
    updatePreferencesMutation.mutate({ [key]: value });
  };

  // Handle nested preference change (reminderTiming)
  const handleReminderTimingChange = (key: 'enabled24h' | 'enabled1h', value: boolean) => {
    const newReminderTiming = { ...preferences.reminderTiming, [key]: value };
    const newPreferences = { ...preferences, reminderTiming: newReminderTiming };
    setPreferences(newPreferences);

    // Save to backend
    updatePreferencesMutation.mutate({ reminderTiming: newReminderTiming });
  };

  // Handle push notification toggle
  const handlePushToggle = async (enabled: boolean) => {
    if (enabled) {
      // Subscribe to push notifications
      try {
        await subscribe();
        // Update preferences to enable push
        updatePreferencesMutation.mutate({ pushEnabled: true });
      } catch (error) {
        console.error('Failed to subscribe to push notifications:', error);
      }
    } else {
      // Unsubscribe from push notifications
      try {
        await unsubscribe();
        // Update preferences to disable push
        updatePreferencesMutation.mutate({ pushEnabled: false });
      } catch (error) {
        console.error('Failed to unsubscribe from push notifications:', error);
      }
    }
  };

  // Show loading state
  if (isLoadingPreferences || isLoadingSubscriptions) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
        <Spinner aria-label={t('common.loading')} data-size="md" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header */}
      <div>
        <Heading level={1} data-size="lg" style={{ margin: 0 }}>
          Varslingsinnstillinger
        </Heading>
        <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
          Velg hvordan du vil motta varsler om bookinger og endringer
        </Paragraph>
      </div>

      {/* Push Notifications Section */}
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        <Heading level={2} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          Push-varsler
        </Heading>

        {!isSupported ? (
          <div style={{
            padding: 'var(--ds-spacing-4)',
            backgroundColor: 'var(--ds-color-warning-surface-default)',
            borderRadius: 'var(--ds-border-radius-md)',
            borderLeft: '4px solid var(--ds-color-warning-base-default)',
          }}>
            <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-warning-text-default)' }}>
              Push-varsler støttes ikke i denne nettleseren
            </Paragraph>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
            {/* Main push toggle */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: 'var(--ds-spacing-4)',
              borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
            }}>
              <div>
                <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                  Aktiver push-varsler
                </Paragraph>
                <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Motta varsler selv når nettleseren er lukket
                </Paragraph>
                {isGranted && hasActiveSubscription && (
                  <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-success-text-default)' }}>
                    ✓ Push-varsler er aktivert
                  </Paragraph>
                )}
                {permission === 'denied' && (
                  <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-danger-text-default)' }}>
                    Push-varsler er blokkert i nettleseren. Endre innstillingene for å aktivere.
                  </Paragraph>
                )}
              </div>
              <Switch
                checked={hasActiveSubscription && preferences.pushEnabled}
                onChange={(e) => handlePushToggle(e.target.checked)}
                disabled={isSubscribing || permission === 'denied'}
                aria-label="Aktiver push-varsler"
              />
            </div>
          </div>
        )}
      </Card>

      {/* Notification Channels Section */}
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        <Heading level={2} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          Varslingskanaler
        </Heading>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
          {/* Email notifications */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: 'var(--ds-spacing-4)',
            borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
          }}>
            <div>
              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                E-postvarsler
              </Paragraph>
              <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                Motta bekreftelses-e-poster for bookinger
              </Paragraph>
            </div>
            <Switch
              checked={preferences.emailEnabled}
              onChange={(e) => handlePreferenceChange('emailEnabled', e.target.checked)}
              aria-label="E-postvarsler"
            />
          </div>

          {/* In-app notifications */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: 'var(--ds-spacing-4)',
            borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
          }}>
            <div>
              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                Varsler i appen
              </Paragraph>
              <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                Vis varsler i varslingssenteret når du er pålogget
              </Paragraph>
            </div>
            <Switch
              checked={preferences.inAppEnabled}
              onChange={(e) => handlePreferenceChange('inAppEnabled', e.target.checked)}
              aria-label="Varsler i appen"
            />
          </div>

          {/* SMS notifications */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                SMS-varsler
              </Paragraph>
              <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                Motta viktige varsler på SMS (kommer snart)
              </Paragraph>
            </div>
            <Switch
              checked={preferences.smsEnabled}
              onChange={(e) => handlePreferenceChange('smsEnabled', e.target.checked)}
              disabled={true}
              aria-label="SMS-varsler"
            />
          </div>
        </div>
      </Card>

      {/* Booking Notification Types Section */}
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        <Heading level={2} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          Bookingvarsler
        </Heading>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
          {/* Booking confirmations */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: 'var(--ds-spacing-4)',
            borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
          }}>
            <div>
              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                Bookingbekreftelser
              </Paragraph>
              <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                Motta varsel når en booking er bekreftet
              </Paragraph>
            </div>
            <Switch
              checked={preferences.bookingConfirmationEnabled}
              onChange={(e) => handlePreferenceChange('bookingConfirmationEnabled', e.target.checked)}
              aria-label="Bookingbekreftelser"
            />
          </div>

          {/* Booking reminders */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: 'var(--ds-spacing-4)',
            borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
          }}>
            <div>
              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                Påminnelser
              </Paragraph>
              <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                Motta påminnelser før bookingen starter
              </Paragraph>
            </div>
            <Switch
              checked={preferences.bookingReminderEnabled}
              onChange={(e) => handlePreferenceChange('bookingReminderEnabled', e.target.checked)}
              aria-label="Påminnelser"
            />
          </div>

          {/* Reminder timing - only show if reminders are enabled */}
          {preferences.bookingReminderEnabled && (
            <div style={{
              paddingLeft: 'var(--ds-spacing-6)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--ds-spacing-3)',
              paddingBottom: 'var(--ds-spacing-4)',
              borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                    24 timer før
                  </Paragraph>
                  <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                    Påminnelse dagen før bookingen
                  </Paragraph>
                </div>
                <Switch
                  checked={preferences.reminderTiming.enabled24h}
                  onChange={(e) => handleReminderTimingChange('enabled24h', e.target.checked)}
                  aria-label="24 timer før"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                    1 time før
                  </Paragraph>
                  <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                    Påminnelse rett før bookingen
                  </Paragraph>
                </div>
                <Switch
                  checked={preferences.reminderTiming.enabled1h}
                  onChange={(e) => handleReminderTimingChange('enabled1h', e.target.checked)}
                  aria-label="1 time før"
                />
              </div>
            </div>
          )}

          {/* Cancellations */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: 'var(--ds-spacing-4)',
            borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
          }}>
            <div>
              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                Kanselleringer
              </Paragraph>
              <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                Motta varsel når en booking er kansellert
              </Paragraph>
            </div>
            <Switch
              checked={preferences.bookingCancellationEnabled}
              onChange={(e) => handlePreferenceChange('bookingCancellationEnabled', e.target.checked)}
              aria-label="Kanselleringer"
            />
          </div>

          {/* Modifications */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                Endringer
              </Paragraph>
              <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                Motta varsel når en booking er endret
              </Paragraph>
            </div>
            <Switch
              checked={preferences.bookingModificationEnabled}
              onChange={(e) => handlePreferenceChange('bookingModificationEnabled', e.target.checked)}
              aria-label="Endringer"
            />
          </div>
        </div>
      </Card>

      {/* Save indicator */}
      {updatePreferencesMutation.isPending && (
        <div style={{
          position: 'fixed',
          bottom: 'var(--ds-spacing-6)',
          right: 'var(--ds-spacing-6)',
          padding: 'var(--ds-spacing-4)',
          backgroundColor: 'var(--ds-color-brand-1-surface-default)',
          borderRadius: 'var(--ds-border-radius-md)',
          boxShadow: 'var(--ds-shadow-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--ds-spacing-3)',
        }}>
          <Spinner data-size="sm" aria-hidden="true" />
          <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-brand-1-text-default)' }}>
            Lagrer innstillinger...
          </Paragraph>
        </div>
      )}
    </div>
  );
}
