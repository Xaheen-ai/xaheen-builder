/**
 * Settings Page - User Profile Management
 * Comprehensive tabbed settings for end users
 */

import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Alert,
  SaveIcon,
  CheckCircleIcon,
  UserIcon,
  CameraIcon,
  DownloadIcon,
  TrashIcon,
  ShieldIcon,
  BellIcon,
  SettingsIcon,
  MapPinIcon,
  HomeIcon,
} from '@xaheen/ds';
import {
  useCurrentUser,
  useUpdateCurrentUser,
  useExportData,
  useDeleteAccount,
  useConsents,
  useUpdateConsents,
  type Address,
} from '@xaheen/sdk';
import { useLocale } from '@xaheen/i18n';
import { useAuth } from '../hooks/useAuth';

export function SettingsPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { locale, setLocale } = useLocale();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('profile');

  // Queries
  const { data: currentUserData, isLoading: isLoadingUser } = useCurrentUser();
  const currentUser = currentUserData?.data;

  const { data: consentsData } = useConsents();
  const consents = consentsData?.data;

  // Mutations
  const updateProfileMutation = useUpdateCurrentUser();
  const uploadAvatarMutation = useUploadUserAvatar();
  const exportDataMutation = useExportData();
  const deleteAccountMutation = useDeleteAccount();
  const updateConsentsMutation = useUpdateConsents();

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

  const [consentSettings, setConsentSettings] = useState({
    marketing: false,
    analytics: false,
    thirdPartySharing: false,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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

  // Load consents
  useState(() => {
    if (consents) {
      setConsentSettings({
        marketing: consents.marketing || false,
        analytics: consents.analytics || false,
        thirdPartySharing: consents.thirdPartySharing || false,
      });
    }
  });

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

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const result = await exportDataMutation.mutateAsync();
      // Create download link
      const dataStr = JSON.stringify(result.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mine-data-${new Date().toISOString()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm('Er du sikker på at du vil slette kontoen din? Dette kan ikke angres.')) {
      try {
        await deleteAccountMutation.mutateAsync();
        logout();
        navigate('/');
      } catch (error) {
        console.error('Failed to delete account:', error);
      }
    }
  };

  const handleUpdateConsents = async (field: keyof typeof consentSettings, value: boolean) => {
    const newConsents = { ...consentSettings, [field]: value };
    setConsentSettings(newConsents);
    try {
      await updateConsentsMutation.mutateAsync(newConsents);
    } catch (error) {
      console.error('Failed to update consents:', error);
    }
  };

  if (isLoadingUser) {
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
          <Heading level={1} data-size="lg" style={{ margin: 0 }}>
            Innstillinger
          </Heading>
          <Paragraph
            data-size="sm"
            style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-1)', marginBottom: 0 }}
          >
            Administrer din konto og preferanser
          </Paragraph>
        </div>
        {saveSuccess && (
          <Alert style={{ maxWidth: '400px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
              <CheckCircleIcon />
              Endringene ble lagret
            </div>
          </Alert>
        )}
      </div>

      {/* Tabs */}
      <div style={{
        backgroundColor: 'var(--ds-color-neutral-background-default)',
        borderRadius: 'var(--ds-border-radius-lg)',
        padding: 'var(--ds-spacing-6)',
        boxShadow: 'var(--ds-shadow-xsmall)',
      }}>
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List style={{ marginBottom: 'var(--ds-spacing-6)' }}>
            <Tabs.Tab value="profile">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                <UserIcon style={{ fontSize: 'var(--ds-font-size-md)' }} />
                Min profil
              </div>
            </Tabs.Tab>
            <Tabs.Tab value="addresses">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                <HomeIcon style={{ fontSize: 'var(--ds-font-size-md)' }} />
                Adresser
              </div>
            </Tabs.Tab>
            <Tabs.Tab value="privacy">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                <ShieldIcon style={{ fontSize: 'var(--ds-font-size-md)' }} />
                Personvern
              </div>
            </Tabs.Tab>
            <Tabs.Tab value="notifications">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                <BellIcon style={{ fontSize: 'var(--ds-font-size-md)' }} />
                Varsler
              </div>
            </Tabs.Tab>
            <Tabs.Tab value="preferences">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                <SettingsIcon style={{ fontSize: 'var(--ds-font-size-md)' }} />
                Preferanser
              </div>
            </Tabs.Tab>
          </Tabs.List>

          {/* Profile Tab */}
          <Tabs.Panel value="profile">
            <Stack spacing={6}>
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
                      <UserIcon style={{ fontSize: 'var(--ds-font-size-2xl)', color: 'var(--ds-color-neutral-text-subtle)' }} />
                    )}
                  </div>

                  <Stack spacing={2}>
                    {/* eslint-disable-next-line digdir/prefer-ds-components -- Hidden file input for avatar upload */}
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
                      disabled={isUploadingAvatar}
                      type="button"
                      aria-label="Endre profilbilde"
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
                    <Textfield
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ola Nordmann"
                      aria-label="Fullt navn"
                    />
                  </FormField>

                  <FormField label="E-postadresse" required>
                    <Textfield
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="ola.nordmann@example.com"
                      aria-label="E-postadresse"
                    />
                  </FormField>

                  <FormField label="Telefonnummer">
                    <Textfield
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+47 123 45 678"
                      aria-label="Telefonnummer"
                    />
                  </FormField>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ds-spacing-3)' }}>
                    <FormField label="Fødselsdato">
                      <Textfield
                        type="date"
                        value={profileData.dateOfBirth}
                        onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                        aria-label="Fødselsdato"
                      />
                    </FormField>

                    <FormField label="Fødselsnummer">
                      <Textfield
                        value={profileData.nationalId}
                        onChange={(e) => setProfileData(prev => ({ ...prev, nationalId: e.target.value }))}
                        placeholder="11 siffer"
                        maxLength={11}
                        aria-label="Fødselsnummer"
                      />
                    </FormField>
                  </div>
                </Stack>

                <div style={{ paddingTop: 'var(--ds-spacing-4)', borderTop: '1px solid var(--ds-color-neutral-border-subtle)' }}>
                  <Button onClick={handleSaveProfile} disabled={isSaving} type="button" aria-label="Lagre profilinnstillinger">
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
          <Stack spacing={6}>
            {/* Residence Address */}
            <Card>
              <Stack spacing={5}>
                <div>
                  <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
                    <MapPinIcon style={{ verticalAlign: 'middle', marginRight: 'var(--ds-spacing-2)' }} />
                    Bostedsadresse
                  </Heading>
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    Din registrerte bostedsadresse
                  </Paragraph>
                </div>

                <Stack spacing={4}>
                  <FormField label="Gateadresse">
                    <Textfield
                      value={profileData.residenceAddress.street || ''}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        residenceAddress: { ...prev.residenceAddress, street: e.target.value }
                      }))}
                      placeholder="Storgata 1"
                      aria-label="Gateadresse"
                    />
                  </FormField>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--ds-spacing-3)' }}>
                    <FormField label="Poststed">
                      <Textfield
                        value={profileData.residenceAddress.city || ''}
                        onChange={(e) => setProfileData(prev => ({
                          ...prev,
                          residenceAddress: { ...prev.residenceAddress, city: e.target.value }
                        }))}
                        placeholder="Oslo"
                        aria-label="Poststed"
                      />
                    </FormField>

                    <FormField label="Postnummer">
                      <Textfield
                        value={profileData.residenceAddress.postalCode || ''}
                        onChange={(e) => setProfileData(prev => ({
                          ...prev,
                          residenceAddress: { ...prev.residenceAddress, postalCode: e.target.value }
                        }))}
                        placeholder="0010"
                        maxLength={4}
                        aria-label="Postnummer"
                      />
                    </FormField>
                  </div>

                  <FormField label="Land">
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
                    <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
                      <HomeIcon style={{ verticalAlign: 'middle', marginRight: 'var(--ds-spacing-2)' }} />
                      Fakturaadresse
                    </Heading>
                    <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                      Adresse for fakturering
                    </Paragraph>
                  </div>
                  <Button
                    variant="tertiary"
                    data-size="sm"
                    onClick={handleCopyResidenceToInvoice} type="button"
                  >
                    Kopier fra bostedsadresse
                  </Button>
                </div>

                <Stack spacing={4}>
                  <FormField label="Gateadresse">
                    <Textfield
                      value={profileData.invoiceAddress.street || ''}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        invoiceAddress: { ...prev.invoiceAddress, street: e.target.value }
                      }))}
                      placeholder="Storgata 1"
                      aria-label="Gateadresse"
                    />
                  </FormField>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--ds-spacing-3)' }}>
                    <FormField label="Poststed">
                      <Textfield
                        value={profileData.invoiceAddress.city || ''}
                        onChange={(e) => setProfileData(prev => ({
                          ...prev,
                          invoiceAddress: { ...prev.invoiceAddress, city: e.target.value }
                        }))}
                        placeholder="Oslo"
                        aria-label="Poststed"
                      />
                    </FormField>

                    <FormField label="Postnummer">
                      <Textfield
                        value={profileData.invoiceAddress.postalCode || ''}
                        onChange={(e) => setProfileData(prev => ({
                          ...prev,
                          invoiceAddress: { ...prev.invoiceAddress, postalCode: e.target.value }
                        }))}
                        placeholder="0010"
                        maxLength={4}
                        aria-label="Postnummer"
                      />
                    </FormField>
                  </div>

                  <FormField label="Land">
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

                <div style={{ paddingTop: 'var(--ds-spacing-4)', borderTop: '1px solid var(--ds-color-neutral-border-subtle)' }}>
                  <Button onClick={handleSaveProfile} disabled={isSaving} type="button" aria-label="Lagre adresseinnstillinger">
                    <SaveIcon />
                    {isSaving ? 'Lagrer endringer' : 'Lagre adresser'}
                  </Button>
                </div>
              </Stack>
            </Card>
          </Stack>
        </Tabs.Panel>

        {/* Privacy Tab */}
        <Tabs.Panel value="privacy">
          <Stack spacing={6}>
            {/* Data Export */}
            <Card>
              <Stack spacing={4}>
                <div>
                  <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                    <ShieldIcon style={{ verticalAlign: 'middle', marginRight: 'var(--ds-spacing-2)' }} />
                    Dataeksport
                  </Heading>
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    Last ned en kopi av alle dine personopplysninger
                  </Paragraph>
                </div>

                <Alert>
                  <Paragraph data-size="sm" style={{ margin: 0 }}>
                    I henhold til GDPR har du rett til å få en kopi av dine personopplysninger. Eksporten inkluderer profil, bookinger, meldinger og aktivitetslogg.
                  </Paragraph>
                </Alert>

                <Button
                  variant="secondary"
                  onClick={handleExportData}
                  disabled={isExporting}
                  type="button"
                  aria-label="Eksporter mine data"
                >
                  <DownloadIcon />
                  {isExporting ? 'Eksporterer...' : 'Last ned mine data'}
                </Button>
              </Stack>
            </Card>

            {/* Consent Settings */}
            <Card>
              <Stack spacing={4}>
                <div>
                  <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                    Samtykker
                  </Heading>
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    Administrer hvordan vi bruker dine data
                  </Paragraph>
                </div>

                <Stack spacing={3}>
                  <div style={{
                    padding: 'var(--ds-spacing-4)',
                    backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
                    borderRadius: 'var(--ds-border-radius-md)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                        Markedsføring
                      </Paragraph>
                      <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                        Motta tips, tilbud og nyheter på e-post
                      </Paragraph>
                    </div>
                    <Switch
                      checked={consentSettings.marketing}
                      onChange={(e) => handleUpdateConsents('marketing', e.target.checked)}
                      aria-label="Markedsføring"
                    />
                  </div>

                  <div style={{
                    padding: 'var(--ds-spacing-4)',
                    backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
                    borderRadius: 'var(--ds-border-radius-md)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                        Analyse
                      </Paragraph>
                      <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                        Hjelp oss forbedre tjenesten med anonymisert bruksdata
                      </Paragraph>
                    </div>
                    <Switch
                      checked={consentSettings.analytics}
                      onChange={(e) => handleUpdateConsents('analytics', e.target.checked)}
                      aria-label="Analyse"
                    />
                  </div>

                  <div style={{
                    padding: 'var(--ds-spacing-4)',
                    backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
                    borderRadius: 'var(--ds-border-radius-md)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                        Deling med tredjeparter
                      </Paragraph>
                      <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                        Tillat deling av data med samarbeidspartnere
                      </Paragraph>
                    </div>
                    <Switch
                      checked={consentSettings.thirdPartySharing}
                      onChange={(e) => handleUpdateConsents('thirdPartySharing', e.target.checked)}
                      aria-label="Deling med tredjeparter"
                    />
                  </div>
                </Stack>
              </Stack>
            </Card>

            {/* Delete Account */}
            <Card>
              <Stack spacing={4}>
                <div>
                  <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)', color: 'var(--ds-color-danger-text-default)' }}>
                    Slett konto
                  </Heading>
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    Permanent sletting av din konto og alle tilknyttede data
                  </Paragraph>
                </div>

                <Alert>
                  <Stack spacing={2}>
                    <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                      Dette kan ikke angres
                    </Paragraph>
                    <Paragraph data-size="sm" style={{ margin: 0 }}>
                      Ved sletting av kontoen vil alle dine personopplysninger, bookinger, meldinger og aktivitetshistorikk bli permanent fjernet. Denne handlingen kan ikke reverseres.
                    </Paragraph>
                  </Stack>
                </Alert>

                <Button
                  variant="secondary"
                  onClick={handleDeleteAccount}
                  style={{
                    backgroundColor: 'var(--ds-color-danger-surface-default)',
                    color: 'var(--ds-color-danger-text-default)',
                    borderColor: 'var(--ds-color-danger-border-default)'
                  }} type="button"
                >
                  <TrashIcon />
                  Slett min konto
                </Button>
              </Stack>
            </Card>
          </Stack>
        </Tabs.Panel>

        {/* Notifications Tab */}
        <Tabs.Panel value="notifications">
          <Stack spacing={6}>
            <Card>
              <Stack spacing={4}>
                <div>
                  <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                    Varslingsinnstillinger
                  </Heading>
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    Administrer hvordan og når du mottar varsler
                  </Paragraph>
                </div>

                <Alert>
                  <Paragraph data-size="sm" style={{ margin: 0 }}>
                    Detaljerte varslingsinnstillinger er tilgjengelige på en egen side hvor du kan konfigurere e-post, SMS og push-varsler for ulike hendelser.
                  </Paragraph>
                </Alert>

                <Link to="/settings/notifications">
                  <Button variant="secondary" type="button">
                    Åpne varslingsinnstillinger
                  </Button>
                </Link>
              </Stack>
            </Card>
          </Stack>
        </Tabs.Panel>

        {/* Preferences Tab */}
        <Tabs.Panel value="preferences">
          <Stack spacing={6}>
            {/* Language */}
            <Card>
              <Stack spacing={4}>
                <div>
                  <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                    Språk
                  </Heading>
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    Velg språk for brukergrensesnittet
                  </Paragraph>
                </div>

                <FormField label="Foretrukket språk">
                  <Select value={locale} onChange={(e) => setLocale(e.target.value as 'nb' | 'en')}>
                    <option value="nb">Norsk (Bokmål)</option>
                    <option value="nn">Norsk (Nynorsk)</option>
                    <option value="en">English</option>
                  </Select>
                </FormField>
              </Stack>
            </Card>

            {/* Display Settings */}
            <Card>
              <Stack spacing={4}>
                <div>
                  <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                    Utseende
                  </Heading>
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    Tilpass hvordan systemet ser ut
                  </Paragraph>
                </div>

                <div style={{
                  padding: 'var(--ds-spacing-4)',
                  backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
                  borderRadius: 'var(--ds-border-radius-md)'
                }}>
                  <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                    Tema og utseendeinnstillinger kommer snart
                  </Paragraph>
                </div>
              </Stack>
            </Card>

            {/* Session & Security */}
            <Card>
              <Stack spacing={4}>
                <div>
                  <Heading level={3} data-size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
                    Økt og sikkerhet
                  </Heading>
                  <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                    Administrer din pålogging og sikkerhet
                  </Paragraph>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 'var(--ds-spacing-4)',
                  backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
                  borderRadius: 'var(--ds-border-radius-md)'
                }}>
                  <div>
                    <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                      Logg ut
                    </Paragraph>
                    <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                      Logg ut av din konto på denne enheten
                    </Paragraph>
                  </div>
                  <Button variant="secondary" data-size="sm" onClick={logout} type="button">
                    Logg ut
                  </Button>
                </div>
              </Stack>
            </Card>
          </Stack>
        </Tabs.Panel>
      </Tabs>
      </div>
    </div>
  );
}
