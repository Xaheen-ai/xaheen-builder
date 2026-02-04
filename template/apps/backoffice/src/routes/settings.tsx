/**
 * Settings Page - Complete Tenant Configuration
 * Manage tenant settings, integrations, and system configuration
 */

/* eslint-disable digdir/prefer-ds-components, digdir/require-interactive-labels -- Complex settings form */

import { useState, useRef } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Spinner,
  Tabs,
  Stack,
  FormField,
  Textfield,
  Select,
  Switch,
  Badge,
  Alert,
  SaveIcon,
  CheckCircleIcon,
  UserIcon,
  CameraIcon,
  CopyIcon,
  InfoIcon,
} from '@xaheen/ds';
import {
  useTenantSettings,
  useUpdateTenantSettings,
  useIntegrationSettings,
  useUpdateIntegration,
  useCurrentUser,
  useUpdateCurrentUser,
  useUploadUserAvatar,
  type Address,
} from '@xaheen/sdk';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Queries
  const { data: settingsData, isLoading } = useTenantSettings();
  const settings = settingsData?.data;

  const { data: integrationsData } = useIntegrationSettings();
  const integrations = integrationsData?.data;

  const { data: currentUserData, isLoading: isLoadingUser } = useCurrentUser();
  const currentUser = currentUserData?.data;

  // Mutations
  const updateSettingsMutation = useUpdateTenantSettings();
  const updateIntegrationMutation = useUpdateIntegration();
  const updateProfileMutation = useUpdateCurrentUser();
  const uploadAvatarMutation = useUploadUserAvatar();

  const [formData, setFormData] = useState({
    general: {
      name: '',
      locale: 'nb',
      timezone: 'Europe/Oslo',
      currency: 'NOK',
      dateFormat: 'dd.MM.yyyy',
      timeFormat: '24h',
    },
    booking: {
      autoConfirm: false,
      requireApproval: true,
      allowCancellation: true,
      cancellationDeadlineHours: 24,
      maxAdvanceBookingDays: 90,
      minAdvanceBookingHours: 2,
      bufferTimeMinutes: 0,
    },
    notifications: {
      emailEnabled: true,
      smsEnabled: false,
      pushEnabled: false,
      bookingConfirmation: true,
      bookingReminder: true,
      reminderHoursBefore: 24,
    },
    branding: {
      logo: '',
      primaryColor: '#1A56DB',
      secondaryColor: '#6B7280',
      favicon: '',
    },
  });

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    nationalId: '',
    invoiceAddress: {
      street: '',
      city: '',
      postalCode: '',
      country: 'Norge',
    } as Address,
    residenceAddress: {
      street: '',
      city: '',
      postalCode: '',
      country: 'Norge',
    } as Address,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Load settings into form
  useState(() => {
    if (settings) {
      setFormData({
        general: settings.general || formData.general,
        booking: settings.booking || formData.booking,
        notifications: settings.notifications || formData.notifications,
        branding: settings.branding || formData.branding,
      });
    }
  });

  // Load current user into profile form
  useState(() => {
    if (currentUser) {
      setProfileData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        dateOfBirth: currentUser.dateOfBirth || '',
        nationalId: currentUser.nationalId || '',
        invoiceAddress: currentUser.invoiceAddress || { street: '', city: '', postalCode: '', country: 'Norge' },
        residenceAddress: currentUser.residenceAddress || { street: '', city: '', postalCode: '', country: 'Norge' },
      });
      if (currentUser.avatar) {
        setAvatarPreview(currentUser.avatar);
      }
    }
  });

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateSettingsMutation.mutateAsync(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleIntegrationToggle = async (provider: string, enabled: boolean) => {
    try {
      await updateIntegrationMutation.mutateAsync({ provider, data: { enabled } });
    } catch (error) {
      console.error(`Failed to toggle ${provider}:`, error);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateProfileMutation.mutateAsync(profileData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload avatar
    setIsUploadingAvatar(true);
    try {
      await uploadAvatarMutation.mutateAsync({
        id: currentUser.id,
        file,
        options: { compress: true },
      });
    } catch (error) {
      console.error('Failed to upload avatar:', error);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleCopyResidenceToInvoice = () => {
    setProfileData(prev => ({
      ...prev,
      invoiceAddress: { ...prev.residenceAddress },
    }));
  };

  if (isLoading || isLoadingUser) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
        <Spinner data-size="lg" aria-label="Laster..." />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-5)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Heading level={2} data-size="md">
            Innstillinger
          </Heading>
          <Paragraph
            data-size="sm"
            style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-1)' }}
          >
            Konfigurer systemet og tredjepartsintegrasjoner
          </Paragraph>
        </div>
        {saveSuccess && (
          <Alert style={{ maxWidth: '400px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
              <CheckCircleIcon />
              Innstillingene ble lagret
            </div>
          </Alert>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="profile">Min profil</Tabs.Tab>
          <Tabs.Tab value="addresses">Adresser</Tabs.Tab>
          <Tabs.Tab value="general">Generelt</Tabs.Tab>
          <Tabs.Tab value="booking">Booking</Tabs.Tab>
          <Tabs.Tab value="notifications">Varsler</Tabs.Tab>
          <Tabs.Tab value="integrations">Integrasjoner</Tabs.Tab>
          <Tabs.Tab value="branding">Visuelle profil</Tabs.Tab>
        </Tabs.List>

        {/* Profile Settings */}
        <Tabs.Panel value="profile">
          <Stack spacing={4}>
            {/* Avatar Section */}
            <Card>
              <Stack spacing={5}>
                <div>
                  <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
                    Profilbilde
                  </Heading>
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    Last opp et profilbilde som vises i systemet
                  </Paragraph>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-4)' }}>
                  <div style={{
                    position: 'relative',
                    width: '120px',
                    height: '120px',
                    borderRadius: 'var(--ds-border-radius-full)',
                    overflow: 'hidden',
                    backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <UserIcon style={{ fontSize: 'var(--ds-font-size-heading-lg)', color: 'var(--ds-color-neutral-text-subtle)' }} />
                    )}
                  </div>

                  <Stack spacing={2}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      style={{ display: 'none' }}
                    />
                    <Button
                      variant="secondary"
                      data-size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingAvatar} type="button"
                    >
                      <CameraIcon />
                      {isUploadingAvatar ? 'Laster opp...' : 'Endre bilde'}
                    </Button>
                    <Paragraph data-size="xs" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                      JPG, PNG eller GIF (maks 5MB)
                    </Paragraph>
                  </Stack>
                </div>
              </Stack>
            </Card>

            {/* Personal Information */}
            <Card>
              <Stack spacing={5}>
                <div>
                  <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
                    Personlig informasjon
                  </Heading>
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    Din grunnleggende kontaktinformasjon
                  </Paragraph>
                </div>

                <Stack spacing={4}>
                  <FormField label="Fullt navn" required>
                    <Textfield aria-label="Fullt navn"
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ola Nordmann"
                    />
                  </FormField>

                  <FormField label="E-postadresse" required>
                    <Textfield aria-label="Fullt navn"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="ola.nordmann@example.com"
                    />
                  </FormField>

                  <FormField label="Telefonnummer">
                    <Textfield aria-label="E-postadresse"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+47 123 45 678"
                    />
                  </FormField>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ds-spacing-3)' }}>
                    <FormField label="Fødselsdato">
                      <Textfield aria-label="Fødselsdato"
                        type="date"
                        value={profileData.dateOfBirth}
                        onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                      />
                    </FormField>

                    <FormField label="Fødselsnummer">
                      <Textfield aria-label="Fødselsdato"
                        onChange={(e) => setProfileData(prev => ({ ...prev, nationalId: e.target.value }))}
                        placeholder="11 siffer"
                        maxLength={11}
                      />
                    </FormField>
                  </div>
                </Stack>

                <div style={{ paddingTop: 'var(--ds-spacing-3)', borderTop: '1px solid var(--ds-color-neutral-border-subtle)' }}>
                  <Button onClick={handleSaveProfile} disabled={isSaving} type="button">
                    <SaveIcon />
                    {isSaving ? 'Lagrer...' : 'Lagre endringer'}
                  </Button>
                </div>
              </Stack>
            </Card>
          </Stack>
        </Tabs.Panel>

        {/* Addresses Tab */}
        <Tabs.Panel value="addresses">
          <Stack spacing={5}>
            {/* Intro */}
            <Card>
              <Stack spacing={3}>
                <div>
                  <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                    Adresseinformasjon
                  </Heading>
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    Administrer din bostedsadresse og fakturaadresse. Disse brukes for kommunikasjon og fakturering.
                  </Paragraph>
                </div>
              </Stack>
            </Card>

            {/* Residence Address */}
            <Card>
              <Stack spacing={5}>
                <div>
                  <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                    Bostedsadresse
                  </Heading>
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    Din registrerte bostedsadresse
                  </Paragraph>
                </div>

                <Stack spacing={4}>
                  <FormField label="Gateadresse" required>
                    <Textfield aria-label="Gateadresse"
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        residenceAddress: { ...prev.residenceAddress, street: e.target.value }
                      }))}
                      placeholder="Storgata 1"
                    />
                  </FormField>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--ds-spacing-3)' }}>
                    <FormField label="Poststed" required>
                      <Textfield aria-label="Poststed"
                        onChange={(e) => setProfileData(prev => ({
                          ...prev,
                          residenceAddress: { ...prev.residenceAddress, city: e.target.value }
                        }))}
                        placeholder="Oslo"
                      />
                    </FormField>

                    <FormField label="Postnummer" required>
                      <Textfield aria-label="Postnummer bosted"
                        onChange={(e) => setProfileData(prev => ({
                          ...prev,
                          residenceAddress: { ...prev.residenceAddress, postalCode: e.target.value }
                        }))}
                        placeholder="0010"
                        maxLength={4}
                      />
                    </FormField>
                  </div>

                  <FormField label="Land" required>
                    <Select
                      value={profileData.residenceAddress.country || 'Norge'}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        residenceAddress: { ...prev.residenceAddress, country: e.target.value }
                      }))}
                    >
                      <option value="Norge">Norge</option>
                      <option value="Sverige">Sverige</option>
                      <option value="Danmark">Danmark</option>
                      <option value="Finland">Finland</option>
                    </Select>
                  </FormField>
                </Stack>
              </Stack>
            </Card>

            {/* Invoice Address */}
            <Card>
              <Stack spacing={5}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                      Fakturaadresse
                    </Heading>
                    <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                      Adresse for fakturering og betalingsinformasjon
                    </Paragraph>
                  </div>
                  <Button
                    variant="tertiary"
                    data-size="sm"
                    onClick={handleCopyResidenceToInvoice} type="button"
                  >
                    <CopyIcon />
                    Kopier fra bostedsadresse
                  </Button>
                </div>

                <Stack spacing={4}>
                  <FormField label="Gateadresse" required>
                    <Textfield aria-label="Gateadresse"
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        invoiceAddress: { ...prev.invoiceAddress, street: e.target.value }
                      }))}
                      placeholder="Storgata 1"
                    />
                  </FormField>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--ds-spacing-3)' }}>
                    <FormField label="Poststed" required>
                      <Textfield aria-label="Poststed"
                        onChange={(e) => setProfileData(prev => ({
                          ...prev,
                          invoiceAddress: { ...prev.invoiceAddress, city: e.target.value }
                        }))}
                        placeholder="Oslo"
                      />
                    </FormField>

                    <FormField label="Postnummer" required>
                      <Textfield aria-label="Postnummer faktura"
                        onChange={(e) => setProfileData(prev => ({
                          ...prev,
                          invoiceAddress: { ...prev.invoiceAddress, postalCode: e.target.value }
                        }))}
                        placeholder="0010"
                        maxLength={4}
                      />
                    </FormField>
                  </div>

                  <FormField label="Land" required>
                    <Select
                      value={profileData.invoiceAddress.country || 'Norge'}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        invoiceAddress: { ...prev.invoiceAddress, country: e.target.value }
                      }))}
                    >
                      <option value="Norge">Norge</option>
                      <option value="Sverige">Sverige</option>
                      <option value="Danmark">Danmark</option>
                      <option value="Finland">Finland</option>
                    </Select>
                  </FormField>
                </Stack>
              </Stack>
            </Card>

            {/* Address Verification Info */}
            <Card style={{ backgroundColor: 'var(--ds-color-info-surface-default)', border: '1px solid var(--ds-color-info-border-subtle)' }}>
              <Stack spacing={3}>
                <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', alignItems: 'flex-start' }}>
                  <InfoIcon style={{ color: 'var(--ds-color-info-text-default)', marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <Paragraph data-size="sm" style={{ fontWeight: 'var(--ds-font-weight-semibold)', marginBottom: 'var(--ds-spacing-1)' }}>
                      Adresseverifikasjon
                    </Paragraph>
                    <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                      Vi verifiserer adresseinformasjon mot offentlige registre for å sikre korrekt levering og kommunikasjon.
                      Endringer i adresse kan ta opptil 24 timer å tre i kraft.
                    </Paragraph>
                  </div>
                </div>
              </Stack>
            </Card>

            {/* Save Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={handleSaveProfile} disabled={isSaving} type="button">
                <SaveIcon />
                {isSaving ? 'Lagrer...' : 'Lagre adresser'}
              </Button>
            </div>
          </Stack>
        </Tabs.Panel>

        {/* General Settings */}
        <Tabs.Panel value="general">
          <Card>
            <Stack spacing={5}>
              <div>
                <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
                  Generelle innstillinger
                </Heading>
                <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Grunnleggende konfigurasjon for systemet
                </Paragraph>
              </div>

              <Stack spacing={4}>
                <FormField label="Systemnavn" description="Navn på systemet som vises til brukere">
                  <Textfield aria-label="Systemnavn"
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      general: { ...prev.general, name: e.target.value }
                    }))}
                    placeholder="Digilist Booking"
                  />
                </FormField>

                <FormField label="Språk">
                  <Select
                    value={formData.general.locale}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      general: { ...prev.general, locale: e.target.value }
                    }))}
                  >
                    <option value="nb">Norsk bokmål</option>
                    <option value="nn">Norsk nynorsk</option>
                    <option value="en">English</option>
                  </Select>
                </FormField>

                <FormField label="Tidssone">
                  <Select
                    value={formData.general.timezone}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      general: { ...prev.general, timezone: e.target.value }
                    }))}
                  >
                    <option value="Europe/Oslo">Europa/Oslo (CET)</option>
                    <option value="Europe/London">Europa/London (GMT)</option>
                    <option value="America/New_York">Amerika/New York (EST)</option>
                  </Select>
                </FormField>

                <FormField label="Valuta">
                  <Select
                    value={formData.general.currency}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      general: { ...prev.general, currency: e.target.value }
                    }))}
                  >
                    <option value="NOK">Norske kroner (NOK)</option>
                    <option value="EUR">Euro (EUR)</option>
                    <option value="USD">US Dollar (USD)</option>
                  </Select>
                </FormField>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ds-spacing-3)' }}>
                  <FormField label="Datoformat">
                    <Select
                      value={formData.general.dateFormat}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        general: { ...prev.general, dateFormat: e.target.value }
                      }))}
                    >
                      <option value="dd.MM.yyyy">31.12.2024</option>
                      <option value="yyyy-MM-dd">2024-12-31</option>
                      <option value="MM/dd/yyyy">12/31/2024</option>
                    </Select>
                  </FormField>

                  <FormField label="Tidsformat">
                    <Select
                      value={formData.general.timeFormat}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        general: { ...prev.general, timeFormat: e.target.value }
                      }))}
                    >
                      <option value="24h">24-timers (13:00)</option>
                      <option value="12h">12-timers (1:00 PM)</option>
                    </Select>
                  </FormField>
                </div>
              </Stack>

              <div style={{ paddingTop: 'var(--ds-spacing-3)', borderTop: '1px solid var(--ds-color-neutral-border-subtle)' }}>
                <Button onClick={handleSave} disabled={isSaving} type="button">
                  <SaveIcon />
                  {isSaving ? 'Lagrer...' : 'Lagre endringer'}
                </Button>
              </div>
            </Stack>
          </Card>
        </Tabs.Panel>

        {/* Booking Settings */}
        <Tabs.Panel value="booking">
          <Card>
            <Stack spacing={5}>
              <div>
                <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
                  Bookinginnstillinger
                </Heading>
                <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Konfigurer booking-regler og retningslinjer
                </Paragraph>
              </div>

              <Stack spacing={4}>
                <FormField label="Automatisk bekreftelse">
                  <Switch
                    checked={formData.booking.autoConfirm}
                    aria-label="setFormData(prev => ({
                      ...prev,
                      booking: { ...prev.booking, autoConfirm: checked }
                    }))}
                  >
                    Bekreft bookinger automatisk uten godkjenning"
                    onChange={(checked) => setFormData(prev => ({
                      ...prev,
                      booking: { ...prev.booking, autoConfirm: checked }
                    }))}
                  >
                    Bekreft bookinger automatisk uten godkjenning
                  </Switch>
                </FormField>

                {!formData.booking.autoConfirm && (
                  <FormField label="Krev godkjenning">
                    <Switch
                      checked={formData.booking.requireApproval}
                    aria-label="setFormData(prev => ({
                        ...prev,
                        booking: { ...prev.booking, requireApproval: checked }
                      }))}
                    >
                      Alle bookinger må godkjennes av saksbehandler"
                      onChange={(checked) => setFormData(prev => ({
                        ...prev,
                        booking: { ...prev.booking, requireApproval: checked }
                      }))}
                    >
                      Alle bookinger må godkjennes av saksbehandler
                    </Switch>
                  </FormField>
                )}

                <FormField label="Tillat kansellering">
                  <Switch
                    checked={formData.booking.allowCancellation}
                    aria-label="setFormData(prev => ({
                      ...prev,
                      booking: { ...prev.booking, allowCancellation: checked }
                    }))}
                  >
                    Brukere kan kansellere egne bookinger"
                    onChange={(checked) => setFormData(prev => ({
                      ...prev,
                      booking: { ...prev.booking, allowCancellation: checked }
                    }))}
                  >
                    Brukere kan kansellere egne bookinger
                  </Switch>
                </FormField>

                {formData.booking.allowCancellation && (
                  <FormField
                    label="Kanselleringsfrist"
                    description="Antall timer før bookingstart kansellering er tillatt"
                  >
                    <Textfield aria-label="Kanselleringsfrist"
                      value={formData.booking.cancellationDeadlineHours.toString()}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        booking: { ...prev.booking, cancellationDeadlineHours: parseInt(e.target.value) || 0 }
                      }))}
                      min="0"
                      suffix="timer"
                    />
                  </FormField>
                )}

                <FormField
                  label="Maksimal forhåndsbooking"
                  description="Hvor langt frem i tid kan man booke?"
                >
                  <Textfield aria-label="Maksimal forhåndsbooking"
                    value={formData.booking.maxAdvanceBookingDays.toString()}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      booking: { ...prev.booking, maxAdvanceBookingDays: parseInt(e.target.value) || 0 }
                    }))}
                    min="1"
                    suffix="dager"
                  />
                </FormField>

                <FormField
                  label="Minimum forhåndstid"
                  description="Hvor kort tid før kan man booke?"
                >
                  <Textfield aria-label="Minimum forhåndstid"
                    value={formData.booking.minAdvanceBookingHours.toString()}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      booking: { ...prev.booking, minAdvanceBookingHours: parseInt(e.target.value) || 0 }
                    }))}
                    min="0"
                    suffix="timer"
                  />
                </FormField>

                <FormField
                  label="Buffertid mellom bookinger"
                  description="Automatisk pause mellom påfølgende bookinger"
                >
                  <Textfield aria-label="Buffertid mellom bookinger"
                    value={formData.booking.bufferTimeMinutes.toString()}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      booking: { ...prev.booking, bufferTimeMinutes: parseInt(e.target.value) || 0 }
                    }))}
                    min="0"
                    suffix="minutter"
                  />
                </FormField>
              </Stack>

              <div style={{ paddingTop: 'var(--ds-spacing-3)', borderTop: '1px solid var(--ds-color-neutral-border-subtle)' }}>
                <Button onClick={handleSave} disabled={isSaving} type="button">
                  <SaveIcon />
                  {isSaving ? 'Lagrer...' : 'Lagre endringer'}
                </Button>
              </div>
            </Stack>
          </Card>
        </Tabs.Panel>

        {/* Notification Settings */}
        <Tabs.Panel value="notifications">
          <Card>
            <Stack spacing={5}>
              <div>
                <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
                  Varslingsinnstillinger
                </Heading>
                <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Konfigurer hvordan systemet sender varsler
                </Paragraph>
              </div>

              <Stack spacing={4}>
                <FormField label="E-postvarsler">
                  <Switch
                    checked={formData.notifications.emailEnabled}
                    aria-label="setFormData(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, emailEnabled: checked }
                    }))}
                  >
                    Send varsler på e-post"
                    onChange={(checked) => setFormData(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, emailEnabled: checked }
                    }))}
                  >
                    Send varsler på e-post
                  </Switch>
                </FormField>

                <FormField label="SMS-varsler">
                  <Switch
                    checked={formData.notifications.smsEnabled}
                    aria-label="setFormData(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, smsEnabled: checked }
                    }))}
                  >
                    Send varsler på SMS"
                    onChange={(checked) => setFormData(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, smsEnabled: checked }
                    }))}
                  >
                    Send varsler på SMS
                  </Switch>
                </FormField>

                <FormField label="Push-varsler">
                  <Switch
                    checked={formData.notifications.pushEnabled}
                    aria-label="setFormData(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, pushEnabled: checked }
                    }))}
                  >
                    Send push-varsler til mobilapp"
                    onChange={(checked) => setFormData(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, pushEnabled: checked }
                    }))}
                  >
                    Send push-varsler til mobilapp
                  </Switch>
                </FormField>

                <div style={{
                  padding: 'var(--ds-spacing-4)',
                  backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  marginTop: 'var(--ds-spacing-2)',
                }}>
                  <Paragraph data-size="sm" style={{ fontWeight: 'var(--ds-font-weight-semibold)', marginBottom: 'var(--ds-spacing-3)' }}>
                    Automatiske varsler
                  </Paragraph>

                  <Stack spacing={3}>
                    <FormField label="Bookingbekreftelse">
                      <Switch
                        checked={formData.notifications.bookingConfirmation}
                    aria-label="setFormData(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, bookingConfirmation: checked }
                        }))}
                      >
                        Send bekreftelse når booking er godkjent"
                        onChange={(checked) => setFormData(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, bookingConfirmation: checked }
                        }))}
                      >
                        Send bekreftelse når booking er godkjent
                      </Switch>
                    </FormField>

                    <FormField label="Booking-påminnelse">
                      <Switch
                        checked={formData.notifications.bookingReminder}
                    aria-label="setFormData(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, bookingReminder: checked }
                        }))}
                      >
                        Send påminnelse før booking starter"
                        onChange={(checked) => setFormData(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, bookingReminder: checked }
                        }))}
                      >
                        Send påminnelse før booking starter
                      </Switch>
                    </FormField>

                    {formData.notifications.bookingReminder && (
                      <FormField
                        label="Påminnelsestidspunkt"
                        description="Hvor lenge før booking skal påminnelse sendes?"
                      >
                        <Textfield aria-label="Påminnelsestidspunkt"
                          value={formData.notifications.reminderHoursBefore.toString()}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            notifications: { ...prev.notifications, reminderHoursBefore: parseInt(e.target.value) || 24 }
                          }))}
                          min="1"
                          suffix="timer før"
                        />
                      </FormField>
                    )}
                  </Stack>
                </div>
              </Stack>

              <div style={{ paddingTop: 'var(--ds-spacing-3)', borderTop: '1px solid var(--ds-color-neutral-border-subtle)' }}>
                <Button onClick={handleSave} disabled={isSaving} type="button">
                  <SaveIcon />
                  {isSaving ? 'Lagrer...' : 'Lagre endringer'}
                </Button>
              </div>
            </Stack>
          </Card>
        </Tabs.Panel>

        {/* Integrations */}
        <Tabs.Panel value="integrations">
          <Stack spacing={4}>
            <Card>
              <Stack spacing={4}>
                <div>
                  <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                    Autentisering
                  </Heading>
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    ID-løsninger og pålogging
                  </Paragraph>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--ds-spacing-3)', backgroundColor: 'var(--ds-color-neutral-surface-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
                  <div>
                    <div style={{ fontWeight: 'var(--ds-font-weight-medium)', marginBottom: 'var(--ds-spacing-1)' }}>BankID</div>
                    <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>Norsk e-ID for sikker pålogging</Paragraph>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                    {integrations?.bankid?.enabled ? (
                      <Badge color="success">Aktiv</Badge>
                    ) : (
                      <Badge color="neutral">Inaktiv</Badge>
                    )}
                    <Switch
                      checked={integrations?.bankid?.enabled || false}
                      onChange={(checked) => handleIntegrationToggle('bankid', checked)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--ds-spacing-3)', backgroundColor: 'var(--ds-color-neutral-surface-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
                  <div>
                    <div style={{ fontWeight: 'var(--ds-font-weight-medium)', marginBottom: 'var(--ds-spacing-1)' }}>ID-porten</div>
                    <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>Offentlig påloggingsløsning</Paragraph>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                    {integrations?.idporten?.enabled ? (
                      <Badge color="success">Aktiv</Badge>
                    ) : (
                      <Badge color="neutral">Inaktiv</Badge>
                    )}
                    <Switch
                      checked={integrations?.idporten?.enabled || false}
                      onChange={(checked) => handleIntegrationToggle('idporten', checked)}
                    />
                  </div>
                </div>
              </Stack>
            </Card>

            <Card>
              <Stack spacing={4}>
                <div>
                  <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                    Betaling
                  </Heading>
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    Betalingsløsninger
                  </Paragraph>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--ds-spacing-3)', backgroundColor: 'var(--ds-color-neutral-surface-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
                  <div>
                    <div style={{ fontWeight: 'var(--ds-font-weight-medium)', marginBottom: 'var(--ds-spacing-1)' }}>Vipps</div>
                    <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>Mobilbetaling med Vipps</Paragraph>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                    {integrations?.vipps?.enabled ? (
                      <Badge color="success">Aktiv</Badge>
                    ) : (
                      <Badge color="neutral">Inaktiv</Badge>
                    )}
                    <Switch
                      checked={integrations?.vipps?.enabled || false}
                      onChange={(checked) => handleIntegrationToggle('vipps', checked)}
                    />
                  </div>
                </div>
              </Stack>
            </Card>

            <Card>
              <Stack spacing={4}>
                <div>
                  <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                    Tilgangskontroll
                  </Heading>
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    Låssystemer og adgangskontroll
                  </Paragraph>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--ds-spacing-3)', backgroundColor: 'var(--ds-color-neutral-surface-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
                  <div>
                    <div style={{ fontWeight: 'var(--ds-font-weight-medium)', marginBottom: 'var(--ds-spacing-1)' }}>RCO</div>
                    <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>Digital låssystem</Paragraph>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                    {integrations?.rco?.enabled ? (
                      <Badge color="success">Aktiv</Badge>
                    ) : (
                      <Badge color="neutral">Inaktiv</Badge>
                    )}
                    <Switch
                      checked={integrations?.rco?.enabled || false}
                      onChange={(checked) => handleIntegrationToggle('rco', checked)}
                    />
                  </div>
                </div>
              </Stack>
            </Card>

            <Card>
              <Stack spacing={4}>
                <div>
                  <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                    Kalender
                  </Heading>
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    Kalendersynkronisering
                  </Paragraph>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--ds-spacing-3)', backgroundColor: 'var(--ds-color-neutral-surface-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
                  <div>
                    <div style={{ fontWeight: 'var(--ds-font-weight-medium)', marginBottom: 'var(--ds-spacing-1)' }}>Google Calendar</div>
                    <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>Synkroniser med Google Calendar</Paragraph>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                    {integrations?.googleCalendar?.enabled ? (
                      <Badge color="success">Aktiv</Badge>
                    ) : (
                      <Badge color="neutral">Inaktiv</Badge>
                    )}
                    <Switch
                      checked={integrations?.googleCalendar?.enabled || false}
                      onChange={(checked) => handleIntegrationToggle('googleCalendar', checked)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--ds-spacing-3)', backgroundColor: 'var(--ds-color-neutral-surface-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
                  <div>
                    <div style={{ fontWeight: 'var(--ds-font-weight-medium)', marginBottom: 'var(--ds-spacing-1)' }}>Outlook</div>
                    <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>Synkroniser med Outlook/Exchange</Paragraph>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                    {integrations?.outlook?.enabled ? (
                      <Badge color="success">Aktiv</Badge>
                    ) : (
                      <Badge color="neutral">Inaktiv</Badge>
                    )}
                    <Switch
                      checked={integrations?.outlook?.enabled || false}
                      onChange={(checked) => handleIntegrationToggle('outlook', checked)}
                    />
                  </div>
                </div>
              </Stack>
            </Card>

            <Card>
              <Stack spacing={4}>
                <div>
                  <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                    Økonomi & ERP
                  </Heading>
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    Økonomisystemer og fakturering
                  </Paragraph>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--ds-spacing-3)', backgroundColor: 'var(--ds-color-neutral-surface-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
                  <div>
                    <div style={{ fontWeight: 'var(--ds-font-weight-medium)', marginBottom: 'var(--ds-spacing-1)' }}>Visma</div>
                    <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>Fakturering via Visma</Paragraph>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                    {integrations?.visma?.enabled ? (
                      <Badge color="success">Aktiv</Badge>
                    ) : (
                      <Badge color="neutral">Inaktiv</Badge>
                    )}
                    <Switch
                      checked={integrations?.visma?.enabled || false}
                      onChange={(checked) => handleIntegrationToggle('visma', checked)}
                    />
                  </div>
                </div>
              </Stack>
            </Card>

            <Card>
              <Stack spacing={4}>
                <div>
                  <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                    Offentlige registre
                  </Heading>
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    Verifikasjon og oppslag
                  </Paragraph>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--ds-spacing-3)', backgroundColor: 'var(--ds-color-neutral-surface-subtle)', borderRadius: 'var(--ds-border-radius-md)' }}>
                  <div>
                    <div style={{ fontWeight: 'var(--ds-font-weight-medium)', marginBottom: 'var(--ds-spacing-1)' }}>Brønnøysundregistrene</div>
                    <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>Verifiser organisasjoner</Paragraph>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                    {integrations?.brreg?.enabled ? (
                      <Badge color="success">Aktiv</Badge>
                    ) : (
                      <Badge color="neutral">Inaktiv</Badge>
                    )}
                    <Switch
                      checked={integrations?.brreg?.enabled || false}
                      onChange={(checked) => handleIntegrationToggle('brreg', checked)}
                    />
                  </div>
                </div>
              </Stack>
            </Card>
          </Stack>
        </Tabs.Panel>

        {/* Branding */}
        <Tabs.Panel value="branding">
          <Card>
            <Stack spacing={5}>
              <div>
                <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
                  Visuell profil
                </Heading>
                <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                  Tilpass utseende og merkevare
                </Paragraph>
              </div>

              <Stack spacing={4}>
                <FormField
                  label="Logo URL"
                  description="URL til logo (vil vises i toppen av siden)"
                >
                  <Textfield aria-label="Logo URL"
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      branding: { ...prev.branding, logo: e.target.value }
                    }))}
                    placeholder="https://example.com/logo.png"
                  />
                </FormField>

                <FormField
                  label="Primærfarge"
                  description="Hovedfarge for knapper og UI-elementer"
                >
                  <Textfield aria-label="Primærfarge"
                    value={formData.branding.primaryColor || '#1A56DB'}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      branding: { ...prev.branding, primaryColor: e.target.value }
                    }))}
                  />
                </FormField>

                <FormField
                  label="Sekundærfarge"
                  description="Farge for mindre fremtredende elementer"
                >
                  <Textfield aria-label="Sekundærfarge"
                    value={formData.branding.secondaryColor || '#6B7280'}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      branding: { ...prev.branding, secondaryColor: e.target.value }
                    }))}
                  />
                </FormField>

                <FormField
                  label="Favicon URL"
                  description="URL til favicon (vises i nettleserens fane)"
                >
                  <Textfield aria-label="Favicon URL"
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      branding: { ...prev.branding, favicon: e.target.value }
                    }))}
                    placeholder="https://example.com/favicon.ico"
                  />
                </FormField>
              </Stack>

              <div style={{ paddingTop: 'var(--ds-spacing-3)', borderTop: '1px solid var(--ds-color-neutral-border-subtle)' }}>
                <Button onClick={handleSave} disabled={isSaving} type="button">
                  <SaveIcon />
                  {isSaving ? 'Lagrer...' : 'Lagre endringer'}
                </Button>
              </div>
            </Stack>
          </Card>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
