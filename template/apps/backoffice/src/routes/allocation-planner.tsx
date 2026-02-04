/**
 * AllocationPlannerPage
 *
 * Saksbehandler page for managing resource allocations
 * - Calendar view of allocations
 * - Drag-and-drop time slot assignment
 * - Conflict detection
 * - Batch allocation tools
 */

import { useState, useEffect } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Spinner,
  Select,
} from '@xaheen/ds';

const MOBILE_BREAKPOINT = 768;

// Days of week
const DAYS = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag'];

// Time slots
const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];

// Mock allocations
const mockAllocations: Record<string, Record<string, { org: string; color: string }>> = {
  'Mandag-18:00': { 'Idrettshall A': { org: 'Skien IL', color: '#2563eb' } },
  'Mandag-19:00': { 'Idrettshall A': { org: 'Skien IL', color: '#2563eb' } },
  'Tirsdag-16:00': { 'Fotballbane 1': { org: 'Telemark FK', color: '#16a34a' } },
  'Tirsdag-17:00': { 'Fotballbane 1': { org: 'Telemark FK', color: '#16a34a' } },
  'Onsdag-18:00': { 'Idrettshall A': { org: 'Skien IL', color: '#2563eb' } },
  'Onsdag-19:00': { 'Idrettshall A': { org: 'Skien IL', color: '#2563eb' } },
};

// Mock resources
const resources = ['Idrettshall A', 'Idrettshall B', 'Fotballbane 1', 'Fotballbane 2'];

export function AllocationPlannerPage() {
  const [selectedResource, setSelectedResource] = useState(resources[0]);
  const [isLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Stats
  const totalSlots = DAYS.length * TIME_SLOTS.length;
  const allocatedSlots = Object.keys(mockAllocations).length;
  const utilizationPercent = Math.round((allocatedSlots / totalSlots) * 100);

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
            Allokeringsplan
          </Heading>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
            Planlegg og administrer tildeling av faste tider
          </Paragraph>
        </div>
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)' }}>
          <Select
            value={selectedResource}
            onChange={(e) => setSelectedResource(e.target.value)}
            style={{ minWidth: '200px' }}
          >
            {resources.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </Select>
          <Button type="button" variant="primary" data-size="md" style={{ minHeight: '44px' }}>
            Lagre endringer
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
        gap: 'var(--ds-spacing-4)',
      }}>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>Totalt tidsluker</Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0 }}>{totalSlots}</Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>Tildelt</Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0 }}>{allocatedSlots}</Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>Utnyttelse</Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0, color: utilizationPercent > 70 ? 'var(--ds-color-success-text-default)' : undefined }}>
            {utilizationPercent}%
          </Heading>
        </Card>
      </div>

      {/* Legend */}
      <Card style={{ padding: 'var(--ds-spacing-4)' }}>
        <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)', marginBottom: 'var(--ds-spacing-3)' }}>
          Organisasjoner
        </Paragraph>
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-4)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
            {/* eslint-disable-next-line digdir/no-hardcoded-colors */}
            <div style={{ width: '16px', height: '16px', borderRadius: 'var(--ds-spacing-1)', backgroundColor: '#2563eb' }} />
            <Paragraph data-size="sm" style={{ margin: 0 }}>Skien IL</Paragraph>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
            {/* eslint-disable-next-line digdir/no-hardcoded-colors */}
            <div style={{ width: '16px', height: '16px', borderRadius: 'var(--ds-spacing-1)', backgroundColor: '#16a34a' }} />
            <Paragraph data-size="sm" style={{ margin: 0 }}>Telemark FK</Paragraph>
          </div>
        </div>
      </Card>

      {/* Calendar Grid */}
      <Card style={{ padding: 0, overflow: 'auto' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
            <Spinner aria-label="Laster..." data-size="lg" />
          </div>
        ) : (
          <div style={{ minWidth: '800px' }}>
            {/* Header row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '80px repeat(7, 1fr)',
              borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
            }}>
              <div style={{ padding: 'var(--ds-spacing-3)', fontWeight: 'var(--ds-font-weight-semibold)', fontSize: 'var(--ds-font-size-sm)' }} />
              {DAYS.map((day) => (
                <div
                  key={day}
                  style={{
                    padding: 'var(--ds-spacing-3)',
                    fontWeight: 'var(--ds-font-weight-semibold)',
                    fontSize: 'var(--ds-font-size-sm)',
                    textAlign: 'center',
                    borderLeft: '1px solid var(--ds-color-neutral-border-subtle)',
                  }}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Time slots */}
            {TIME_SLOTS.map((time) => (
              <div
                key={time}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '80px repeat(7, 1fr)',
                  borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
                }}
              >
                <div style={{
                  padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                  fontSize: 'var(--ds-font-size-sm)',
                  color: 'var(--ds-color-neutral-text-subtle)',
                  fontFamily: 'var(--ds-font-family-monospace)',
                }}>
                  {time}
                </div>
                {DAYS.map((day) => {
                  const key = `${day}-${time}`;
                  const resourceAllocations = mockAllocations[key];
                  const allocation = resourceAllocations && selectedResource ? resourceAllocations[selectedResource] : undefined;
                  
                  return (
                    <div
                      key={key}
                      style={{
                        padding: 'var(--ds-spacing-1)',
                        borderLeft: '1px solid var(--ds-color-neutral-border-subtle)',
                        minHeight: '40px',
                        cursor: 'pointer',
                        backgroundColor: allocation ? allocation.color + '20' : undefined,
                      }}
                    >
                      {/* eslint-disable digdir/no-hardcoded-colors -- Mock data with dynamic colors */}
                      {allocation && (
                        <div
                          style={{
                            padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
                            borderRadius: 'var(--ds-border-radius-sm)',
                            backgroundColor: allocation.color,
                            color: 'white',
                            fontSize: 'var(--ds-font-size-xs)',
                            fontWeight: 'var(--ds-font-weight-medium)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {allocation.org}
                        </div>
                      )}
                      {/* eslint-enable digdir/no-hardcoded-colors */}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', justifyContent: 'flex-end' }}>
        <Button type="button" variant="secondary" data-size="md" style={{ minHeight: '44px' }}>
          Eksporter til Excel
        </Button>
        <Button type="button" variant="secondary" data-size="md" style={{ minHeight: '44px' }}>
          Generer forslag
        </Button>
        <Button type="button" variant="primary" data-size="md" style={{ minHeight: '44px' }}>
          Publiser plan
        </Button>
      </div>
    </div>
  );
}
