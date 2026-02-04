/**
 * AuditTimelinePage
 *
 * Saksbehandler page for viewing audit trail of decisions
 * - Timeline view of all decisions
 * - Filter by date, type, outcome
 * - Decision details
 * - Export functionality
 */

import { useState, useEffect } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Select,
  Badge,
  Spinner,
  Input,
} from '@xaheen/ds';
import { useLocale } from '@xaheen/i18n';

const MOBILE_BREAKPOINT = 768;

type DecisionOutcome = 'approved' | 'rejected' | 'returned';

// Mock audit log entries
const mockAuditEntries = [
  {
    id: 'audit-001',
    timestamp: '2026-01-14T15:30:00Z',
    actionType: 'decision',
    subject: 'Booking #B-2026-002',
    applicant: 'Grenland BK',
    outcome: 'approved' as DecisionOutcome,
    handler: 'Kari Hansen',
    comments: 'Godkjent uten vilkår.',
  },
  {
    id: 'audit-002',
    timestamp: '2026-01-14T14:15:00Z',
    actionType: 'decision',
    subject: 'Sesongsøknad H2026',
    applicant: 'Skien Svømmeklubb',
    outcome: 'returned' as DecisionOutcome,
    handler: 'Kari Hansen',
    comments: 'Behøver oppklaring av antall timer.',
  },
  {
    id: 'audit-003',
    timestamp: '2026-01-14T10:00:00Z',
    actionType: 'decision',
    subject: 'Booking #B-2026-001',
    applicant: 'Skien IL',
    outcome: 'approved' as DecisionOutcome,
    handler: 'Ola Nordmann',
    comments: 'Standard godkjenning.',
  },
  {
    id: 'audit-004',
    timestamp: '2026-01-13T16:45:00Z',
    actionType: 'decision',
    subject: 'Booking #B-2025-998',
    applicant: 'Telemark FK',
    outcome: 'rejected' as DecisionOutcome,
    handler: 'Ola Nordmann',
    comments: 'Tidspunktet er allerede tildelt annen organisasjon.',
  },
];

export function AuditTimelinePage() {
  const { locale } = useLocale();
  const [outcomeFilter, setOutcomeFilter] = useState<DecisionOutcome | 'all'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredEntries = mockAuditEntries.filter(entry => {
    if (outcomeFilter !== 'all' && entry.outcome !== outcomeFilter) return false;
    return true;
  });

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale === 'en' ? 'en-US' : 'nb-NO') + ' ' +
           date.toLocaleTimeString(locale === 'en' ? 'en-US' : 'nb-NO', { hour: '2-digit', minute: '2-digit' });
  };

  const getOutcomeLabel = (outcome: DecisionOutcome) => {
    switch (outcome) {
      case 'approved': return 'Godkjent';
      case 'rejected': return 'Avslått';
      case 'returned': return 'Returnert';
    }
  };

  const getOutcomeColor = (outcome: DecisionOutcome) => {
    switch (outcome) {
      case 'approved': return { bg: 'var(--ds-color-success-surface-default)', text: 'var(--ds-color-success-text-default)' };
      case 'rejected': return { bg: 'var(--ds-color-danger-surface-default)', text: 'var(--ds-color-danger-text-default)' };
      case 'returned': return { bg: 'var(--ds-color-warning-surface-default)', text: 'var(--ds-color-warning-text-default)' };
    }
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
            Revisjonslogg
          </Heading>
          <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
            Oversikt over alle vedtak og beslutninger
          </Paragraph>
        </div>
        <Button type="button" variant="secondary" data-size="md" style={{ minHeight: '44px' }}>
          Eksporter CSV
        </Button>
      </div>

      {/* Filters */}
      <Card style={{ padding: 'var(--ds-spacing-4)' }}>
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 'var(--ds-spacing-4)',
          alignItems: isMobile ? 'stretch' : 'flex-end',
        }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontSize: 'var(--ds-font-size-sm)', fontWeight: 500 }}>Vedtak</label>
            <Select
              value={outcomeFilter}
              onChange={(e) => setOutcomeFilter(e.target.value as DecisionOutcome | 'all')}
              style={{ width: '100%' }}
            >
              <option value="all">Alle vedtak</option>
              <option value="approved">Godkjent</option>
              <option value="rejected">Avslått</option>
              <option value="returned">Returnert</option>
            </Select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontSize: 'var(--ds-font-size-sm)', fontWeight: 500 }}>Fra dato</label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontSize: 'var(--ds-font-size-sm)', fontWeight: 500 }}>Til dato</label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <Button type="button" variant="primary" data-size="md" style={{ minHeight: '44px' }}>
            Filtrer
          </Button>
        </div>
      </Card>

      {/* Timeline */}
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
            <Spinner aria-label="Laster..." data-size="lg" />
          </div>
        ) : filteredEntries.length === 0 ? (
          <div style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center' }}>
            <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>
              Ingen vedtak å vise med valgte filtre
            </Paragraph>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
            {filteredEntries.map((entry, index) => {
              const color = getOutcomeColor(entry.outcome);
              return (
                <div
                  key={entry.id}
                  style={{
                    display: 'flex',
                    gap: 'var(--ds-spacing-4)',
                    position: 'relative',
                  }}
                >
                  {/* Timeline line */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '24px' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: 'var(--ds-border-radius-full)',
                      backgroundColor: color.bg,
                      border: `2px solid ${color.text}`,
                      flexShrink: 0,
                    }} />
                    {index < filteredEntries.length - 1 && (
                      <div style={{
                        flex: 1,
                        width: '2px',
                        backgroundColor: 'var(--ds-color-neutral-border-default)',
                        marginTop: 'var(--ds-spacing-1)',
                      }} />
                    )}
                  </div>
                  
                  {/* Content */}
                  <div style={{
                    flex: 1,
                    padding: 'var(--ds-spacing-4)',
                    backgroundColor: 'var(--ds-color-neutral-surface-hover)',
                    borderRadius: 'var(--ds-border-radius-md)',
                    marginBottom: 'var(--ds-spacing-2)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--ds-spacing-2)' }}>
                      <div>
                        <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 600 }}>
                          {entry.subject}
                        </Paragraph>
                        <Paragraph data-size="xs" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                          {entry.applicant} • {entry.handler}
                        </Paragraph>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                        <Badge style={{ backgroundColor: color.bg, color: color.text }}>
                          {getOutcomeLabel(entry.outcome)}
                        </Badge>
                        <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                          {formatDateTime(entry.timestamp)}
                        </Paragraph>
                      </div>
                    </div>
                    {entry.comments && (
                      <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)', fontStyle: 'italic' }}>
                        "{entry.comments}"
                      </Paragraph>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
