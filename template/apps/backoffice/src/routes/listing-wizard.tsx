/**
 * ListingWizardPage
 *
 * Admin page for creating/editing listings
 * - Multi-step wizard form
 * - Image upload
 * - Pricing configuration
 * - Availability settings
 */

/* eslint-disable digdir/prefer-ds-components -- Complex wizard form with native HTML elements */

import { useState, useEffect } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Input,
  Textarea,
  Select,
  Spinner,
} from '@xaheen/ds';
import { useParams, useNavigate } from 'react-router-dom';

const MOBILE_BREAKPOINT = 768;

type WizardStep = 'basic' | 'location' | 'pricing' | 'availability' | 'media' | 'review';

const STEPS: { id: WizardStep; label: string }[] = [
  { id: 'basic', label: 'Grunninfo' },
  { id: 'location', label: 'Lokasjon' },
  { id: 'pricing', label: 'Priser' },
  { id: 'availability', label: 'Tilgjengelighet' },
  { id: 'media', label: 'Bilder' },
  { id: 'review', label: 'Oppsummering' },
];

const CATEGORIES = [
  { id: 'sports-hall', label: 'Idrettshall' },
  { id: 'football-field', label: 'Fotballbane' },
  { id: 'meeting-room', label: 'Møterom' },
  { id: 'swimming-pool', label: 'Svømmehall' },
  { id: 'gymnasium', label: 'Gymsal' },
];

export function ListingWizardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  
  const [currentStep, setCurrentStep] = useState<WizardStep>('basic');
  const [isLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    capacity: '',
    address: '',
    city: '',
    postalCode: '',
    municipality: '',
    hourlyRate: '',
    dailyRate: '',
    currency: 'NOK',
    openTime: '08:00',
    closeTime: '22:00',
    minBookingHours: '1',
    maxBookingHours: '8',
    advanceBookingDays: '30',
    images: [] as string[],
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);

  const handleNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentStepIndex + 1].id);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(STEPS[currentStepIndex - 1].id);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    navigate('/listings');
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spinner aria-label="Laster..." data-size="lg" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header */}
      <div>
        <Heading level={1} data-size="lg" style={{ margin: 0 }}>
          {isEdit ? 'Rediger lokale' : 'Nytt lokale'}
        </Heading>
        <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
          {isEdit ? 'Oppdater informasjon om lokalet' : 'Opprett et nytt lokale for utleie'}
        </Paragraph>
      </div>

      {/* Progress Steps */}
      <Card style={{ padding: 'var(--ds-spacing-4)' }}>
        <div style={{
          display: 'flex',
          gap: 'var(--ds-spacing-2)',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}>
          {STEPS.map((step, index) => (
            <button
              key={step.id}
              type="button"
              onClick={() => setCurrentStep(step.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-2)',
                padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                borderRadius: 'var(--ds-border-radius-md)',
                border: 'none',
                cursor: 'pointer',
                minWidth: isMobile ? 'auto' : '120px',
                backgroundColor: currentStep === step.id 
                  ? 'var(--ds-color-accent-surface-default)'
                  : index < currentStepIndex 
                    ? 'var(--ds-color-success-surface-default)'
                    : 'var(--ds-color-neutral-surface-hover)',
                color: currentStep === step.id
                  ? 'var(--ds-color-accent-text-default)'
                  : index < currentStepIndex
                    ? 'var(--ds-color-success-text-default)'
                    : 'var(--ds-color-neutral-text-default)',
              }}
            >
              {/* eslint-disable digdir/no-hardcoded-colors -- Demo wizard step indicator */}
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: 'var(--ds-border-radius-full)',
                  backgroundColor: 'rgba(255,255,255,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'var(--ds-font-size-sm)',
                  fontWeight: 'var(--ds-font-weight-semibold)',
                }}
              >
                {index < currentStepIndex ? '✓' : index + 1}
              </div>
              {/* eslint-enable digdir/no-hardcoded-colors */}
              {!isMobile && <span style={{ fontSize: 'var(--ds-font-size-sm)' }}>{step.label}</span>}
            </button>
          ))}
        </div>
      </Card>

      {/* Form Steps */}
      <Card style={{ padding: 'var(--ds-spacing-6)' }}>
        {currentStep === 'basic' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
            <Heading level={2} data-size="sm" style={{ margin: 0 }}>Grunnleggende informasjon</Heading>
            
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 'var(--ds-font-weight-medium)' }}>Navn *</label>
              <Input
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="F.eks. Idrettshall A"
                style={{ width: '100%' }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 'var(--ds-font-weight-medium)' }}>Kategori *</label>
              <Select
                value={formData.category}
                onChange={(e) => updateField('category', e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="">Velg kategori</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </Select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 'var(--ds-font-weight-medium)' }}>Beskrivelse</label>
              <Textarea
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Beskriv lokalet..."
                rows={4}
                style={{ width: '100%' }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 'var(--ds-font-weight-medium)' }}>Kapasitet (personer)</label>
              <Input
                type="number"
                value={formData.capacity}
                onChange={(e) => updateField('capacity', e.target.value)}
                placeholder="50"
                style={{ width: '200px' }}
              />
            </div>
          </div>
        )}

        {currentStep === 'location' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
            <Heading level={2} data-size="sm" style={{ margin: 0 }}>Lokasjon</Heading>
            
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 'var(--ds-font-weight-medium)' }}>Adresse *</label>
              <Input
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
                placeholder="Gateadresse 123"
                style={{ width: '100%' }}
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 'var(--ds-spacing-4)' }}>
              <div>
                <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 'var(--ds-font-weight-medium)' }}>Postnummer</label>
                <Input
                  value={formData.postalCode}
                  onChange={(e) => updateField('postalCode', e.target.value)}
                  placeholder="3000"
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 'var(--ds-font-weight-medium)' }}>By</label>
                <Input
                  value={formData.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  placeholder="Skien"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 'var(--ds-font-weight-medium)' }}>Kommune</label>
              <Input
                value={formData.municipality}
                onChange={(e) => updateField('municipality', e.target.value)}
                placeholder="Skien kommune"
                style={{ width: '100%' }}
              />
            </div>
          </div>
        )}

        {currentStep === 'pricing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
            <Heading level={2} data-size="sm" style={{ margin: 0 }}>Priser</Heading>
            
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 'var(--ds-spacing-4)' }}>
              <div>
                <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 'var(--ds-font-weight-medium)' }}>Timepris (NOK)</label>
                <Input
                  type="number"
                  value={formData.hourlyRate}
                  onChange={(e) => updateField('hourlyRate', e.target.value)}
                  placeholder="500"
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 'var(--ds-font-weight-medium)' }}>Dagspris (NOK)</label>
                <Input
                  type="number"
                  value={formData.dailyRate}
                  onChange={(e) => updateField('dailyRate', e.target.value)}
                  placeholder="3000"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 'availability' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
            <Heading level={2} data-size="sm" style={{ margin: 0 }}>Tilgjengelighet</Heading>
            
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 'var(--ds-spacing-4)' }}>
              <div>
                <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 'var(--ds-font-weight-medium)' }}>Åpningstid</label>
                <Input
                  type="time"
                  value={formData.openTime}
                  onChange={(e) => updateField('openTime', e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 'var(--ds-font-weight-medium)' }}>Stengetid</label>
                <Input
                  type="time"
                  value={formData.closeTime}
                  onChange={(e) => updateField('closeTime', e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 'var(--ds-spacing-4)' }}>
              <div>
                <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 'var(--ds-font-weight-medium)' }}>Min. booking (timer)</label>
                <Input
                  type="number"
                  value={formData.minBookingHours}
                  onChange={(e) => updateField('minBookingHours', e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 'var(--ds-font-weight-medium)' }}>Maks. booking (timer)</label>
                <Input
                  type="number"
                  value={formData.maxBookingHours}
                  onChange={(e) => updateField('maxBookingHours', e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 'var(--ds-font-weight-medium)' }}>Forhåndsbooking (dager)</label>
                <Input
                  type="number"
                  value={formData.advanceBookingDays}
                  onChange={(e) => updateField('advanceBookingDays', e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 'media' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
            <Heading level={2} data-size="sm" style={{ margin: 0 }}>Bilder</Heading>
            
            <div style={{
              border: '2px dashed var(--ds-color-neutral-border-default)',
              borderRadius: 'var(--ds-border-radius-md)',
              padding: 'var(--ds-spacing-8)',
              textAlign: 'center',
              cursor: 'pointer',
            }}>
              <Paragraph style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                Dra og slipp bilder her, eller klikk for å velge
              </Paragraph>
              <Button type="button" variant="secondary" data-size="sm" style={{ marginTop: 'var(--ds-spacing-3)' }}>
                Velg filer
              </Button>
            </div>
          </div>
        )}

        {currentStep === 'review' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
            <Heading level={2} data-size="sm" style={{ margin: 0 }}>Oppsummering</Heading>
            
            <Card style={{ padding: 'var(--ds-spacing-4)', backgroundColor: 'var(--ds-color-neutral-surface-hover)' }}>
              <div style={{ display: 'grid', gap: 'var(--ds-spacing-3)' }}>
                <div><strong>Navn:</strong> {formData.name || '-'}</div>
                <div><strong>Kategori:</strong> {CATEGORIES.find(c => c.id === formData.category)?.label || '-'}</div>
                <div><strong>Adresse:</strong> {formData.address || '-'}, {formData.postalCode} {formData.city}</div>
                <div><strong>Timepris:</strong> {formData.hourlyRate ? `${formData.hourlyRate} kr` : '-'}</div>
                <div><strong>Åpningstider:</strong> {formData.openTime} - {formData.closeTime}</div>
              </div>
            </Card>
          </div>
        )}
      </Card>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--ds-spacing-3)' }}>
        <Button
          type="button"
          variant="secondary"
          data-size="md"
          onClick={handleBack}
          disabled={currentStepIndex === 0}
          style={{ minHeight: '44px' }}
        >
          Tilbake
        </Button>
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)' }}>
          {currentStep === 'review' ? (
            <Button
              type="button"
              variant="primary"
              data-size="md"
              onClick={handleSave}
              disabled={isSaving}
              style={{ minHeight: '44px' }}
            >
              {isSaving ? 'Lagrer...' : (isEdit ? 'Oppdater lokale' : 'Opprett lokale')}
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              data-size="md"
              onClick={handleNext}
              style={{ minHeight: '44px' }}
            >
              Neste
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
