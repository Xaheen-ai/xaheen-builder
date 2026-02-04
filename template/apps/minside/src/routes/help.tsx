/**
 * HelpPage
 *
 * User portal help and support page
 * - FAQ sections
 * - Contact support
 * - Common topics
 * - Search help
 */

import { useState, useEffect } from 'react';
import {
  Card,
  Heading,
  Paragraph,
  Button,
  Input,
  Textarea,
} from '@xaheen/ds';
import { useT } from '@xaheen/i18n';

const MOBILE_BREAKPOINT = 768;

// Mock FAQ data
const faqSections = [
  {
    title: 'Booking og reservasjon',
    items: [
      { question: 'Hvordan booker jeg et lokale?', answer: 'Gå til listeoversikten, velg ønsket lokale og dato, og klikk "Book nå". Du vil motta bekreftelse på e-post.' },
      { question: 'Kan jeg endre eller kansellere en booking?', answer: 'Ja, du kan endre eller kansellere bookinger inntil 24 timer før. Gå til "Mine bookinger" og velg booking.' },
      { question: 'Hvordan betaler jeg?', answer: 'Betaling skjer vanligvis via faktura. For enkelte lokaler kan direkte betaling være tilgjengelig.' },
    ],
  },
  {
    title: 'Konto og profil',
    items: [
      { question: 'Hvordan oppretter jeg konto?', answer: 'Klikk "Registrer" og fyll ut skjemaet med navn, e-post og passord.' },
      { question: 'Hvordan endrer jeg passordet mitt?', answer: 'Gå til Innstillinger > Sikkerhet og klikk "Endre passord".' },
    ],
  },
  {
    title: 'Organisasjoner',
    items: [
      { question: 'Hvordan oppretter jeg en organisasjon?', answer: 'Gå til Organisasjon > Ny organisasjon og fyll ut informasjon om organisasjonen.' },
      { question: 'Hvordan inviterer jeg medlemmer?', answer: 'Under Organisasjon > Medlemmer kan du invitere nye medlemmer via e-post.' },
    ],
  },
];

export function HelpPage() {
  const t = useT();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({ subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredSections = searchQuery
    ? faqSections.map(section => ({
        ...section,
        items: section.items.filter(item =>
          item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter(section => section.items.length > 0)
    : faqSections;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setContactForm({ subject: '', message: '' });
    alert('Henvendelse sendt!');
  };

  const toggleFaq = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-6)' }}>
      {/* Header */}
      <div>
        <Heading level={1} data-size="lg" style={{ margin: 0 }}>
          {t('help.title')}
        </Heading>
        <Paragraph style={{ color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-2)', marginBottom: 0 }}>
          {t('help.description')}
        </Paragraph>
      </div>

      {/* Search */}
      <Card style={{ padding: 'var(--ds-spacing-4)' }}>
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('help.searchPlaceholder')}
          style={{ width: '100%' }}
        />
      </Card>

      {/* Quick Links */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: 'var(--ds-spacing-4)',
      }}>
        <Card style={{ padding: 'var(--ds-spacing-4)', textAlign: 'center', cursor: 'pointer' }}>
          <Paragraph data-size="lg" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>📅</Paragraph>
          <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 600 }}>Booking</Paragraph>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)', textAlign: 'center', cursor: 'pointer' }}>
          <Paragraph data-size="lg" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>💳</Paragraph>
          <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 600 }}>Betaling</Paragraph>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)', textAlign: 'center', cursor: 'pointer' }}>
          <Paragraph data-size="lg" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>👥</Paragraph>
          <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 600 }}>Konto</Paragraph>
        </Card>
        <Card style={{ padding: 'var(--ds-spacing-4)', textAlign: 'center', cursor: 'pointer' }}>
          <Paragraph data-size="lg" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>🏢</Paragraph>
          <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 600 }}>Organisasjon</Paragraph>
        </Card>
      </div>

      {/* FAQ Sections */}
      {filteredSections.map((section) => (
        <Card key={section.title} style={{ padding: 'var(--ds-spacing-5)' }}>
          <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
            {section.title}
          </Heading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
            {section.items.map((item) => {
              const faqId = `${section.title}-${item.question}`;
              const isExpanded = expandedFaq === faqId;
              return (
                <div key={faqId}>
                  <button
                    type="button"
                    onClick={() => toggleFaq(faqId)}
                    style={{
                      width: '100%',
                      padding: 'var(--ds-spacing-3)',
                      borderRadius: 'var(--ds-border-radius-md)',
                      border: 'none',
                      backgroundColor: isExpanded ? 'var(--ds-color-accent-surface-default)' : 'var(--ds-color-neutral-surface-hover)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 500 }}>
                      {item.question}
                    </Paragraph>
                    <span style={{ fontSize: 'var(--ds-font-size-lg)' }}>{isExpanded ? '−' : '+'}</span>
                  </button>
                  {isExpanded && (
                    <div style={{ padding: 'var(--ds-spacing-4)', paddingTop: 'var(--ds-spacing-3)' }}>
                      <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                        {item.answer}
                      </Paragraph>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      ))}

      {/* Contact Form */}
      <Card style={{ padding: 'var(--ds-spacing-5)' }}>
        <Heading level={2} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
          Kontakt oss
        </Heading>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 500 }}>Emne</label>
            <Input
              value={contactForm.subject}
              onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Hva gjelder henvendelsen?"
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--ds-spacing-2)', fontWeight: 500 }}>Melding</label>
            <Textarea
              value={contactForm.message}
              onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Beskriv problemet eller spørsmålet ditt..."
              rows={4}
              style={{ width: '100%' }}
            />
          </div>
          <Button
            type="button"
            variant="primary"
            data-size="md"
            onClick={handleSubmit}
            disabled={isSubmitting || !contactForm.subject || !contactForm.message}
            style={{ alignSelf: 'flex-start', minHeight: '44px' }}
          >
            {isSubmitting ? 'Sender...' : 'Send henvendelse'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
