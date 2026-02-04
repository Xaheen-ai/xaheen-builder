/**
 * TenantBrandingPage
 *
 * TenantAdmin page for customizing tenant branding
 * - Logo upload
 * - Color scheme
 * - Typography
 * - Email templates
 */

/* eslint-disable digdir/prefer-ds-components, digdir/no-hardcoded-typography -- Complex branding form with custom styling */

import { useState, useEffect } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Input,
} from '@xaheen/ds';

const MOBILE_BREAKPOINT = 768;

const COLOR_PRESETS = [
  { name: 'Blå', primary: '#2563eb', accent: '#3b82f6' },
  { name: 'Grønn', primary: '#16a34a', accent: '#22c55e' },
  { name: 'Lilla', primary: '#7c3aed', accent: '#8b5cf6' },
  { name: 'Oransje', primary: '#ea580c', accent: '#f97316' },
];

export function TenantBrandingPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  // Branding state
  const [branding, setBranding] = useState({
    primaryColor: '#2563eb',
    accentColor: '#3b82f6',
    logoUrl: '',
    faviconUrl: '',
    headerText: 'Booking av lokaler',
    footerText: '© 2026 Skien Kommune',
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const updateBranding = (key: string, value: string) => {
    setBranding(prev => ({ ...prev, [key]: value }));
  };

  const applyPreset = (preset: typeof COLOR_PRESETS[0]) => {
    setBranding(prev => ({
      ...prev,
      primaryColor: preset.primary,
      accentColor: preset.accent,
    }));
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
            Merkevare og design
          </Heading>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
            Tilpass utseendet på plattformen
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

      {/* Color Scheme */}
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          Fargeskjema
        </Heading>
        
        {/* Presets */}
        <Paragraph data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-3)', fontWeight: 500 }}>
          Hurtigvalg
        </Paragraph>
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', flexWrap: 'wrap', marginBottom: 'var(--ds-spacing-4)' }}>
          {COLOR_PRESETS.map(preset => (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyPreset(preset)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-2)',
                padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                border: branding.primaryColor === preset.primary 
                  ? '2px solid var(--ds-color-accent-border-default)'
                  : '1px solid var(--ds-color-neutral-border-default)',
                borderRadius: 'var(--ds-border-radius-md)',
                backgroundColor: 'transparent',
                cursor: 'pointer',
              }}
            >
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: 'var(--ds-border-radius-full)',
                backgroundColor: preset.primary,
              }} />
              {preset.name}
            </button>
          ))}
        </div>

        {/* Custom colors */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 'var(--ds-spacing-4)' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 500 }}>Primærfarge</label>
            <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
              <input
                type="color"
                value={branding.primaryColor}
                onChange={(e) => updateBranding('primaryColor', e.target.value)}
                style={{ width: '44px', height: '44px', border: 'none', borderRadius: 'var(--ds-border-radius-md)', cursor: 'pointer' }}
              />
              <Input
                value={branding.primaryColor}
                onChange={(e) => updateBranding('primaryColor', e.target.value)}
                style={{ flex: 1 }}
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 500 }}>Aksentfarge</label>
            <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
              <input
                type="color"
                value={branding.accentColor}
                onChange={(e) => updateBranding('accentColor', e.target.value)}
                style={{ width: '44px', height: '44px', border: 'none', borderRadius: 'var(--ds-border-radius-md)', cursor: 'pointer' }}
              />
              <Input
                value={branding.accentColor}
                onChange={(e) => updateBranding('accentColor', e.target.value)}
                style={{ flex: 1 }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Logo */}
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          Logo
        </Heading>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 'var(--ds-spacing-4)' }}>
          <div>
            <Paragraph data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)', fontWeight: 500 }}>
              Hovedlogo
            </Paragraph>
            <div style={{
              border: '2px dashed var(--ds-color-neutral-border-default)',
              borderRadius: 'var(--ds-border-radius-md)',
              padding: 'var(--ds-spacing-6)',
              textAlign: 'center',
              cursor: 'pointer',
            }}>
              <Paragraph style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                Klikk for å laste opp
              </Paragraph>
              <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                PNG, SVG (maks 2MB)
              </Paragraph>
            </div>
          </div>
          <div>
            <Paragraph data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)', fontWeight: 500 }}>
              Favicon
            </Paragraph>
            <div style={{
              border: '2px dashed var(--ds-color-neutral-border-default)',
              borderRadius: 'var(--ds-border-radius-md)',
              padding: 'var(--ds-spacing-6)',
              textAlign: 'center',
              cursor: 'pointer',
            }}>
              <Paragraph style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                Klikk for å laste opp
              </Paragraph>
              <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                ICO, PNG 32x32
              </Paragraph>
            </div>
          </div>
        </div>
      </Card>

      {/* Text Content */}
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          Tekster
        </Heading>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 500 }}>Header-tekst</label>
            <Input
              value={branding.headerText}
              onChange={(e) => updateBranding('headerText', e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 500 }}>Footer-tekst</label>
            <Input
              value={branding.footerText}
              onChange={(e) => updateBranding('footerText', e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </Card>

      {/* Preview */}
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          Forhåndsvisning
        </Heading>
        <div style={{
          border: '1px solid var(--ds-color-neutral-border-default)',
          borderRadius: 'var(--ds-border-radius-md)',
          overflow: 'hidden',
        }}>
          {/* Mock header */}
          {/* eslint-disable digdir/no-hardcoded-colors -- Branding preview with custom colors */}
          <div
            style={{
              padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
              backgroundColor: branding.primaryColor,
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {/* eslint-disable-next-line digdir/no-hardcoded-typography */}
            <span style={{ fontWeight: 600 }}>{branding.headerText}</span>
            <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
              {/* eslint-disable-next-line digdir/no-hardcoded-colors */}
              <div style={{ width: '24px', height: '24px', borderRadius: 'var(--ds-border-radius-sm)', backgroundColor: 'rgba(255,255,255,0.2)' }} />
              {/* eslint-disable-next-line digdir/no-hardcoded-colors */}
              <div style={{ width: '24px', height: '24px', borderRadius: 'var(--ds-border-radius-sm)', backgroundColor: 'rgba(255,255,255,0.2)' }} />
            </div>
          </div>
          {/* eslint-enable digdir/no-hardcoded-colors */}
          {/* Mock content */}
          <div style={{ padding: 'var(--ds-spacing-4)', backgroundColor: 'var(--ds-color-neutral-surface-default)' }}>
            <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)' }}>
              <div style={{ flex: 1, height: '60px', borderRadius: 'var(--ds-border-radius-md)', backgroundColor: 'var(--ds-color-neutral-surface-hover)' }} />
              <div style={{ flex: 1, height: '60px', borderRadius: 'var(--ds-border-radius-md)', backgroundColor: 'var(--ds-color-neutral-surface-hover)' }} />
            </div>
            {/* eslint-disable digdir/no-hardcoded-colors -- Branding preview button */}
            <div
              style={{
                marginTop: 'var(--ds-spacing-3)',
                padding: 'var(--ds-spacing-2) var(--ds-spacing-4)',
                backgroundColor: branding.accentColor,
                color: 'white',
                borderRadius: 'var(--ds-border-radius-md)',
                display: 'inline-block',
              }}
            >
              Eksempel-knapp
            </div>
            {/* eslint-enable digdir/no-hardcoded-colors */}
          </div>
          {/* Mock footer */}
          <div style={{
            padding: 'var(--ds-spacing-2) var(--ds-spacing-4)',
            backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
            fontSize: 'var(--ds-font-size-xs)',
            color: 'var(--ds-color-neutral-text-subtle)',
            textAlign: 'center',
          }}>
            {branding.footerText}
          </div>
        </div>
      </Card>
    </div>
  );
}
