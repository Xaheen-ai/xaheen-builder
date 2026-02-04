/**
 * Economy Page
 * Manage invoices, sales documents, credit notes, and financial exports
 */

import { useState } from 'react';
import {
  Heading,
  Paragraph,
  Tabs,
  Button,
  PlusIcon,
} from '@xaheen/ds';

export function EconomyPage() {
  const [activeTab, setActiveTab] = useState('invoice-basis');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-5)', height: '100%' }}>
      {/* Page Header */}
      <div>
        <Heading level={2} data-size="md">
          Økonomi
        </Heading>
        <Paragraph data-size="sm" style={{ marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}>
          Fakturagrunnlag, salgsbilag, kreditnotar og eksport
        </Paragraph>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="invoice-basis">Fakturagrunnlag</Tabs.Tab>
          <Tabs.Tab value="sales-documents">Salgsbilag</Tabs.Tab>
          <Tabs.Tab value="credit-notes">Kreditnota</Tabs.Tab>
          <Tabs.Tab value="export">Eksport</Tabs.Tab>
        </Tabs.List>

        {/* Invoice Basis Tab */}
        <Tabs.Panel value="invoice-basis">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Paragraph>Generer og administrer fakturagrunnlag fra godkjente bookinger</Paragraph>
              <Button variant="primary" type="button">
                <PlusIcon />
                Generer fra bookinger
              </Button>
            </div>

            <div
              style={{
                padding: 'var(--ds-spacing-10)',
                textAlign: 'center',
                backgroundColor: 'var(--ds-color-neutral-surface-default)',
                borderRadius: 'var(--ds-border-radius-md)',
              }}
            >
              <Paragraph data-size="md" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                Ingen fakturagrunnlag funnet
              </Paragraph>
              <Paragraph data-size="sm" style={{ marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                Klikk "Generer fra bookinger" for å komme i gang
              </Paragraph>
            </div>
          </div>
        </Tabs.Panel>

        {/* Sales Documents Tab */}
        <Tabs.Panel value="sales-documents">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
            <Paragraph>Administrer salgsbilag og fakturaer</Paragraph>

            <div
              style={{
                padding: 'var(--ds-spacing-10)',
                textAlign: 'center',
                backgroundColor: 'var(--ds-color-neutral-surface-default)',
                borderRadius: 'var(--ds-border-radius-md)',
              }}
            >
              <Paragraph data-size="md" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                Ingen salgsbilag funnet
              </Paragraph>
              <Paragraph data-size="sm" style={{ marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                Salgsbilag opprettes når fakturagrunnlag finaliseres
              </Paragraph>
            </div>
          </div>
        </Tabs.Panel>

        {/* Credit Notes Tab */}
        <Tabs.Panel value="credit-notes">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Paragraph>Opprett og administrer kreditnotar</Paragraph>
              <Button variant="primary" type="button">
                <PlusIcon />
                Opprett kreditnota
              </Button>
            </div>

            <div
              style={{
                padding: 'var(--ds-spacing-10)',
                textAlign: 'center',
                backgroundColor: 'var(--ds-color-neutral-surface-default)',
                borderRadius: 'var(--ds-border-radius-md)',
              }}
            >
              <Paragraph data-size="md" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                Ingen kreditnotar funnet
              </Paragraph>
            </div>
          </div>
        </Tabs.Panel>

        {/* Export Tab */}
        <Tabs.Panel value="export">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
            <Paragraph>Eksporter økonomiske data til CSV, Excel eller PDF</Paragraph>

            <div
              style={{
                padding: 'var(--ds-spacing-10)',
                textAlign: 'center',
                backgroundColor: 'var(--ds-color-neutral-surface-default)',
                borderRadius: 'var(--ds-border-radius-md)',
              }}
            >
              <Paragraph data-size="md" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
                Eksport-funksjonalitet kommer snart
              </Paragraph>
            </div>
          </div>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
