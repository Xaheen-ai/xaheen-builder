/**
 * DecisionFormsPage
 *
 * Saksbehandler page for handling booking/season decisions with formal outcomes
 * - Pending decision queue
 * - Decision form with outcomes
 * - Comments and conditions
 * - Audit trail
 */

import { useState, useEffect } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Textarea,
  Select,
  Badge,
  Table,
  Spinner,
  useDialog,
} from '@xaheen/ds';
import { useLocale } from '@xaheen/i18n';

const MOBILE_BREAKPOINT = 768;

type DecisionType = 'approved' | 'rejected' | 'returned' | 'pending';

// Mock pending decisions
const mockDecisions = [
  {
    id: 'dec-001',
    type: 'booking',
    subject: 'Booking #B-2026-001',
    applicant: 'Skien IL',
    details: 'Idrettshall A, 20. januar 18:00-20:00',
    submittedAt: '2026-01-14T10:00:00Z',
    status: 'pending',
  },
  {
    id: 'dec-002',
    type: 'season',
    subject: 'Sesongsøknad Vår 2026',
    applicant: 'Telemark FK',
    details: '3 faste tider per uke, 72 timer totalt',
    submittedAt: '2026-01-13T14:30:00Z',
    status: 'pending',
  },
];

export function DecisionFormsPage() {
  const { locale } = useLocale();
  const { confirm } = useDialog();
  const [selectedDecision, setSelectedDecision] = useState<typeof mockDecisions[0] | null>(null);
  const [outcome, setOutcome] = useState<DecisionType>('approved');
  const [comments, setComments] = useState('');
  const [conditions, setConditions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(locale === 'en' ? 'en-US' : 'nb-NO');
  };

  const handleSubmitDecision = async () => {
    if (!selectedDecision) return;
    
    const confirmed = await confirm({
      title: outcome === 'approved' ? 'Bekreft godkjenning' : outcome === 'rejected' ? 'Bekreft avslag' : 'Bekreft retur',
      description: `Er du sikker på at du vil ${outcome === 'approved' ? 'godkjenne' : outcome === 'rejected' ? 'avslå' : 'returnere'} denne saken?`,
      confirmText: outcome === 'approved' ? 'Godkjenn' : outcome === 'rejected' ? 'Avslå' : 'Returner',
      cancelText: 'Avbryt',
      variant: outcome === 'approved' ? 'success' : outcome === 'rejected' ? 'danger' : 'warning',
    });
    
    if (confirmed) {
      setIsSubmitting(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSubmitting(false);
      setSelectedDecision(null);
      setComments('');
      setConditions('');
    }
  };

  // Helper functions for decision status display
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getOutcomeLabel = (status: DecisionType) => {
    switch (status) {
      case 'approved': return 'Godkjent';
      case 'rejected': return 'Avslått';
      case 'returned': return 'Returnert';
      case 'pending': return 'Venter';
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getOutcomeColor = (status: DecisionType) => {
    switch (status) {
      case 'approved': return { bg: 'var(--ds-color-success-surface-default)', text: 'var(--ds-color-success-text-default)' };
      case 'rejected': return { bg: 'var(--ds-color-danger-surface-default)', text: 'var(--ds-color-danger-text-default)' };
      case 'returned': return { bg: 'var(--ds-color-warning-surface-default)', text: 'var(--ds-color-warning-text-default)' };
      case 'pending': return { bg: 'var(--ds-color-info-surface-default)', text: 'var(--ds-color-info-text-default)' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header */}
      <div>
        <Heading level={1} data-size="lg" style={{ margin: 0 }}>
          Vedtaksskjema
        </Heading>
        <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
          Fatt formelle vedtak på søknader og forespørsler
        </Paragraph>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: 'var(--ds-spacing-4)',
      }}>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>Ventende</Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0, color: 'var(--ds-color-warning-text-default)' }}>
            {mockDecisions.filter(d => d.status === 'pending').length}
          </Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>Godkjent i dag</Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0, color: 'var(--ds-color-success-text-default)' }}>3</Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>Avslått i dag</Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0, color: 'var(--ds-color-danger-text-default)' }}>1</Heading>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)' }}>
          <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)', margin: 0 }}>Totalt denne uke</Paragraph>
          <Heading level={2} data-size="xl" style={{ margin: 0 }}>12</Heading>
        </Card>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: 'var(--ds-spacing-6)',
      }}>
        {/* Pending Queue */}
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: 'var(--ds-spacing-4)', borderBottom: '1px solid var(--ds-color-neutral-border-subtle)' }}>
            <Heading level={2} data-size="sm" style={{ margin: 0 }}>Saker til behandling</Heading>
          </div>
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
              <Spinner aria-label="Laster..." data-size="lg" />
            </div>
          ) : (
            <Table>
              <Table.Body>
                {mockDecisions.filter(d => d.status === 'pending').map((decision) => (
                  <Table.Row 
                    key={decision.id} 
                    style={{ cursor: 'pointer', backgroundColor: selectedDecision?.id === decision.id ? 'var(--ds-color-accent-surface-default)' : undefined }}
                    onClick={() => setSelectedDecision(decision)}
                  >
                    <Table.Cell>
                      <div>
                        <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 600 }}>{decision.subject}</Paragraph>
                        <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                          {decision.applicant} • {formatDate(decision.submittedAt)}
                        </Paragraph>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge>{decision.type === 'booking' ? 'Booking' : 'Sesong'}</Badge>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
        </Card>

        {/* Decision Form */}
        <Card style={{ padding: 'var(--ds-spacing-5)' }}>
          {selectedDecision ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
              <div>
                <Heading level={2} data-size="sm" style={{ margin: 0 }}>{selectedDecision.subject}</Heading>
                <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-1)', marginBottom: 0 }}>
                  {selectedDecision.applicant}
                </Paragraph>
              </div>
              
              <div style={{ padding: 'var(--ds-spacing-3)', backgroundColor: 'var(--ds-color-neutral-surface-hover)', borderRadius: 'var(--ds-border-radius-md)' }}>
                <Paragraph data-size="sm" style={{ margin: 0 }}>{selectedDecision.details}</Paragraph>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 500 }}>Vedtak</label>
                <Select
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value as DecisionType)}
                  style={{ width: '100%' }}
                >
                  <option value="approved">Godkjent</option>
                  <option value="rejected">Avslått</option>
                  <option value="returned">Returnert for utfyllende info</option>
                </Select>
              </div>
              
              {outcome === 'approved' && (
                <div>
                  <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 500 }}>Vilkår (valgfritt)</label>
                  <Textarea
                    value={conditions}
                    onChange={(e) => setConditions(e.target.value)}
                    placeholder="Legg til eventuelle vilkår for godkjenningen..."
                    rows={3}
                    style={{ width: '100%' }}
                  />
                </div>
              )}
              
              <div>
                <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 500 }}>
                  {outcome === 'rejected' ? 'Begrunnelse *' : 'Intern kommentar'}
                </label>
                <Textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder={outcome === 'rejected' ? 'Begrunn avslaget...' : 'Eventuell kommentar...'}
                  rows={3}
                  style={{ width: '100%' }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', marginTop: 'var(--ds-spacing-2)' }}>
                <Button
                  type="button"
                  variant="primary"
                  data-size="md"
                  onClick={handleSubmitDecision}
                  disabled={isSubmitting || (outcome === 'rejected' && !comments.trim())}
                  style={{ flex: 1, minHeight: '44px' }}
                >
                  {isSubmitting ? 'Sender...' : 'Fatt vedtak'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  data-size="md"
                  onClick={() => setSelectedDecision(null)}
                  style={{ minHeight: '44px' }}
                >
                  Avbryt
                </Button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--ds-spacing-8)' }}>
              <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', textAlign: 'center' }}>
                Velg en sak fra listen for å fatte vedtak
              </Paragraph>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
